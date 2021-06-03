export class DotObject {

    hasOwnProperty = Object.prototype.hasOwnProperty;
    dotDefault: any;
    private separator: string;
    private override: boolean;
    private useArray: boolean;
    private useBrackets: boolean;
    private keepArray: boolean;
    private cleanup: any[];

    constructor(separator: string, override: boolean, useArray: boolean, useBrackets: boolean, dotDefault = false) {
        if (typeof override === 'undefined') { override = false; }
        if (typeof useArray === 'undefined') { useArray = true; }
        if (typeof useBrackets === 'undefined') { useBrackets = true; }
        this.separator = separator || '.';
        this.override = override;
        this.useArray = useArray;
        this.useBrackets = useBrackets;
        this.keepArray = false;
        if (!dotDefault) {
            this.dotDefault = new DotObject('.', false, true, true, true);
        }
        // contains touched arrays
        this.cleanup = [];
    }

    /**
     * Alias method  for `dot.remove`
     *
     * Note: this is not an alias for dot.delete()
     */
    del = this._remove;

    _process(v: any, mod: any) {
        let i: number;
        let r: any;

        if (typeof mod === 'function') {
            r = mod(v);
            if (r !== undefined) {
                v = r;
            }
        } else if (Array.isArray(mod)) {
            for (i = 0; i < mod.length; i++) {
                r = mod[i](v);
                if (r !== undefined) {
                    v = r;
                }
            }
        }
        return v;
    }


    parseKey(key: any, val: any) {
        // detect negative index notation
        if (key[0] === '-' && Array.isArray(val) && /^-\d+$/.test(key)) {
            return val.length + parseInt(key, 10);
        }
        return key;
    }

    isIndex(k: any) {
        return /^\d+$/.test(k);
    }

    isObject(val: any) {
        return Object.prototype.toString.call(val) === '[object Object]';
    }

    isArrayOrObject(val: any) {
        return Object(val) === val;
    }

    isEmptyObject(val: any) {
        return Object.keys(val).length === 0;
    }

    parsePath(path: any, sep: any) {
        if (path.indexOf('[') >= 0) {
            path = path.replace(/\[/g, '.').replace(/]/g, '');
        }
        return path.split(sep);
    }


    wrap(method: any) {
        return () => {
            return this.dotDefault[method].apply(this.dotDefault, arguments);
        };
    }

    _fill(a: any[], obj: any, v: any, mod: any) {
        const k = a.shift();

        if (a.length > 0) {
            obj[k] = obj[k] ||
                (this.useArray && this.isIndex(a[0]) ? [] : {});

            if (!this.isArrayOrObject(obj[k])) {
                if (this.override) {
                    obj[k] = {};
                } else {
                    if (!(this.isArrayOrObject(v) && this.isEmptyObject(v))) {
                        throw new Error(
                            'Trying to redefine `' + k + '` which is a ' + typeof obj[k]
                        );
                    }

                    return;
                }
            }

            this._fill(a, obj[k], v, mod);
        } else {
            if (!this.override &&
                this.isArrayOrObject(obj[k]) && !this.isEmptyObject(obj[k])) {
                if (!(this.isArrayOrObject(v) && this.isEmptyObject(v))) {
                    throw new Error('Trying to redefine non-empty obj[\'' + k + '\']');
                }

                return;
            }

            obj[k] = this._process(v, mod);
        }
    }

    /**
     *
     * Converts an object with dotted-key/value pairs to it's expanded version
     *
     * Optionally transformed by a set of modifiers.
     *
     * Usage:
     *
     *   var row = {
     *     'nr': 200,
     *     'doc.name': '  My Document  '
     *   }
     *
     *   var mods = {
     *     'doc.name': [_s.trim, _s.underscored]
     *   }
     *
     *   dot.object(row, mods)
     *
     */
    _object(obj: any, mods?: any) {
        const self = this;

        Object.keys(obj).forEach((k) => {
            const mod = mods === undefined ? null : mods[k];
            // normalize array notation.
            const ok = this.parsePath(k, self.separator).join(self.separator);

            if (ok.indexOf(self.separator) !== -1) {
                self._fill(ok.split(self.separator), obj, obj[k], mod);
                delete obj[k];
            } else {
                obj[k] = this._process(obj[k], mod);
            }
        });

        return obj;
    }


    /**
     * @param path dotted path
     * @param v value to be set
     * @param obj object to be modified
     * @param mod optional modifier
     */
    _str(path: string, v: any, obj: any, mod: any) {
        const ok = this.parsePath(path, this.separator).join(this.separator);

        if (path.indexOf(this.separator) !== -1) {
            this._fill(ok.split(this.separator), obj, v, mod);
        } else {
            obj[path] = this._process(v, mod);
        }

        return obj;
    }

    /**
     *
     * Pick a value from an object using dot notation.
     *
     * Optionally remove the value
     *
     */
    _pick(path: any, obj: any, remove: boolean = false, reindexArray: any = false) {
        let i: number;
        let keys: any[];
        let val: any;
        let key: any;
        let cp: any;

        keys = this.parsePath(path, this.separator);
        for (i = 0; i < keys.length; i++) {
            key = this.parseKey(keys[i], obj);
            if (obj && typeof obj === 'object' && key in obj) {
                if (i === (keys.length - 1)) {
                    if (remove) {
                        val = obj[key];
                        if (reindexArray && Array.isArray(obj)) {
                            obj.splice(key, 1);
                        } else {
                            delete obj[key];
                        }
                        if (Array.isArray(obj)) {
                            cp = keys.slice(0, -1).join('.');
                            if (this.cleanup.indexOf(cp) === -1) {
                                this.cleanup.push(cp);
                            }
                        }
                        return val;
                    } else {
                        return obj[key];
                    }
                } else {
                    obj = obj[key];
                }
            } else {
                return undefined;
            }
        }
        if (remove && Array.isArray(obj)) {
            obj = obj.filter((n) => n !== undefined);
        }
        return obj;
    }
    /**
     *
     * Delete value from an object using dot notation.
     *
     */
    _delete(path: any, obj: any) {
        return this._remove(path, obj, true);
    }

    /**
     *
     * Remove value from an object using dot notation.
     *
     * Will remove multiple items if path is an array.
     * In this case array indexes will be retained until all
     * removals have been processed.
     *
     * Use dot.delete() to automatically  re-index arrays.
     *
     */
    _remove(path: string | any[], obj: any, reindexArray: any) {
        let i: number;

        this.cleanup = [];
        if (Array.isArray(path)) {
            for (i = 0; i < path.length; i++) {
                this._pick(path[i], obj, true, reindexArray);
            }
            if (!reindexArray) {
                this._cleanup(obj);
            }
            return obj;
        } else {
            return this._pick(path, obj, true, reindexArray);
        }
    }

    _cleanup(obj: any) {
        let ret: any;
        let i: number;
        let keys: any[];
        let root: any;
        if (this.cleanup.length) {
            for (i = 0; i < this.cleanup.length; i++) {
                keys = this.cleanup[i].split('.');
                root = keys.splice(0, -1).join('.');
                ret = root ? this._pick(root, obj) : obj;
                ret = ret[keys[0]].filter((v: any) => v !== undefined);
                this._set(this.cleanup[i], ret, obj);
            }
            this.cleanup = [];
        }
    }

    /**
     *
     * Move a property from one place to the other.
     *
     * If the source path does not exist (undefined)
     * the target property will not be set.
     */
    _move(source: any, target: any, obj: any, mods: any, merge: any) {
        if (typeof mods === 'function' || Array.isArray(mods)) {
            this._set(target, this._process(this._pick(source, obj, true), mods), obj, merge);
        } else {
            merge = mods;
            this._set(target, this._pick(source, obj, true), obj, merge);
        }

        return obj;
    }

    /**
     *
     * Transfer a property from one object to another object.
     *
     * If the source path does not exist (undefined)
     * the property on the other object will not be set.
     */
    _transfer(source: any, target: any, obj1: any, obj2: any, mods: any, merge: any) {
        if (typeof mods === 'function' || Array.isArray(mods)) {
            this._set(target,
                this._process(
                    this._pick(source, obj1, true),
                    mods
                ), obj2, merge);
        } else {
            merge = mods;
            this._set(target, this._pick(source, obj1, true), obj2, merge);
        }

        return obj2;
    }

    /**
     *
     * Copy a property from one object to another object.
     *
     * If the source path does not exist (undefined)
     * the property on the other object will not be set.
     */
    _copy(source: any, target: any, obj1: any, obj2: any, mods: any, merge: any) {
        if (typeof mods === 'function' || Array.isArray(mods)) {
            this._set(target,
                this._process(
                    // clone what is picked
                    JSON.parse(
                        JSON.stringify(
                            this._pick(source, obj1, false)
                        )
                    ),
                    mods
                ), obj2, merge);
        } else {
            merge = mods;
            this._set(target, this._pick(source, obj1, false), obj2, merge);
        }

        return obj2;
    }

    /**
     *
     * Set a property on an object using dot notation.
     */
    _set(path: any, val: any, obj: any, merge: boolean = false) {
        let i: number;
        let keys: string | any[];
        let key: string | number;

        // Do not operate if the value is undefined.
        if (typeof val === 'undefined') {
            return obj;
        }
        keys = this.parsePath(path, this.separator);

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            if (i === (keys.length - 1)) {
                if (merge && this.isObject(val) && this.isObject(obj[key])) {
                    for (const k in val) {
                        if (DotObject.hasOwnProperty.call(val, k)) {
                            obj[key][k] = val[k];
                        }
                    }
                } else if (merge && Array.isArray(obj[key]) && Array.isArray(val)) {
                    // tslint:disable-next-line: prefer-for-of
                    for (let j = 0; j < val.length; j++) {
                        obj[keys[i]].push(val[j]);
                    }
                } else {
                    obj[key] = val;
                }
            } else if (
                // force the value to be an object
                !DotObject.hasOwnProperty.call(obj, key) ||
                (!this.isObject(obj[key]) && !Array.isArray(obj[key]))
            ) {
                // initialize as array if next key is numeric
                if (/^\d+$/.test(keys[i + 1])) {
                    obj[key] = [];
                } else {
                    obj[key] = {};
                }
            }
            obj = obj[key];
        }
        return obj;
    }

    /**
     *
     * Transform an object
     *
     * Usage:
     *
     *   var obj = {
     *     "id": 1,
     *    "some": {
     *      "thing": "else"
     *    }
     *   }
     *
     *   var transform = {
     *     "id": "nr",
     *    "some.thing": "name"
     *   }
     *
     *   var tgt = dot.transform(transform, obj)
     *
     * @param recipe Transform recipe
     * @param obj Object to be transformed
     */
    _transform(recipe: { [x: string]: any; }, obj: {}, tgt: {}) {
        obj = obj || {};
        tgt = tgt || {};
        Object.keys(recipe).forEach(function(key: string | number) {
            this._set(recipe[key], this._pick(key, obj), tgt);
        }.bind(this));
        return tgt;
    }

    /**
     *
     * Convert object to dotted-key/value pair
     *
     * Usage:
     *
     *   var tgt = dot.dot(obj)
     *
     *   or
     *
     *   var tgt = {}
     *   dot.dot(obj, tgt)
     *
     * @param obj source object
     * @param tgt target object
     * @param Array path path array (internal)
     */
    _dot(obj: { [x: string]: any; }, tgt: { [x: string]: any; }, path: any[]) {
        tgt = tgt || {};
        path = path || [];
        const isArray = Array.isArray(obj);

        Object.keys(obj).forEach(function(key: string) {
            const index = isArray && this.useBrackets ? '[' + key + ']' : key;
            if (
                (
                    this.isArrayOrObject(obj[key]) &&
                    (
                        (this.isObject(obj[key]) && !this.isEmptyObject(obj[key])) ||
                        (Array.isArray(obj[key]) && (!this.keepArray && (obj[key].length !== 0)))
                    )
                )
            ) {
                if (isArray && this.useBrackets) {
                    const previousKey = path[path.length - 1] || '';
                    return this.dot(obj[key], tgt, path.slice(0, -1).concat(previousKey + index));
                } else {
                    return this.dot(obj[key], tgt, path.concat(index));
                }
            } else {
                if (isArray && this.useBrackets) {
                    tgt[path.join(this.separator).concat('[' + key + ']')] = obj[key];
                } else {
                    tgt[path.concat(index).join(this.separator)] = obj[key];
                }
            }
        }.bind(this));
        return tgt;
    }
}
