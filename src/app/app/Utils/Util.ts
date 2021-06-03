import { Injectable, HostListener } from "@angular/core";
import { UserData } from "src/app/Utils/Globals/userData";
import { DotObject } from "./Helpers/dotObject";
import {
    Router,
    NavigationEnd,
    NavigationStart,
    RouterEvent,
} from "@angular/router";
import { md5 } from "./Globals/md5";

@Injectable({ providedIn: "root" })
export class Utils {
    /**
     * Determina si un breadcrumb esta siendo cargado o no.
     */
    public panLoading: boolean;

    /**
     * Almacena un setTimeOut para ser limpiado dinámicamente.
     */
    public panIntVal: any;

    /**
     * Almacena el valor actual del ruteo (#HASH)
     */
    public panVal: any;

    /**
     * Almacena campos JSON del backend para ser transformados a
     * objetos de frontend.
     */
    #jsonInputObject: string;

    /**
     * Angular no tiene para refrescar página,
     * en Utils sobre-escribimos esta propiedad para que pueda funcionar.
     * @param router
     * @returns
     */
    #timeOutReload = (router: Router) =>
        setTimeout(() => {
            router.routeReuseStrategy.shouldReuseRoute = function () {
                return false;
            };

            router.navigated = false;
            router.navigate([router.url]);
        }, 400);

    /**
     * Almacena los "EventListeners" de todo el sistema
     */
    #listeners = Object.create(null);

    /**
     * Determina si el sistema está o no en debug-mode.
     * modificar esta propiedad a TRUE si desea activarlo.
     */
    #debugMode = false;

    /**
     * El constructor de Utils invoca funciones globales
     * @param router para acceder a eventos que se disparan antes/despues/etc. de un cambio de ruta
     */
    constructor(private router: Router) {
        router.events.subscribe((e: RouterEvent) => {
            if (e instanceof NavigationEnd) {
                // Cuando termina de cargar una página
                this.updatePan();
                this.initSelect();
                this.initCheckBox();
            } else if (e instanceof NavigationStart) {
                // antes de dejar una página
                this.removeAllEventListener([
                    "click",
                    "input",
                    "change",
                    "keydown",
                ]);
                this.setPan(null);
                this.panLoading = true;
            }
        });
    }

    /**
     * Determina si un hash ya está cargado en eventlistener o no.
     * @param arr
     * @param hash
     * @returns
     */
    ifHashExists(arr: Array<any>, hash: string) {
        for (const obj of arr) {
            if (
                obj !== null &&
                typeof obj.hash !== "undefined" &&
                obj.hash === hash
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Retorna el Hash (md5) de un elemento para que pueda ser procesado.
     * @param data
     * @param ret
     * @returns
     */
    getHash(data: any, ret = true) {
        if (
            typeof data.name !== "undefined" &&
            data.name !== null &&
            data.name !== ""
        ) {
            return ret ? md5(data.name) : data.name;
        } else {
            return ret ? md5(data.toString()) : data.toString();
        }
    }

    /**
     * Funciones (Métodos) que necesitan ser cargados N cantidad de veces.
     * los seteamos en whitelist para que no elimine los duplicados.
     * @param data
     * @returns
     */
    public whitelistHash(data: any) {
        switch (data) {
            case "b1c6301ea93388089010139a0f18747e": // eventListenerSelectOptions
            case "e16a337a9e72c6c5a555d0a832c2c981": // initSelect
            case "9b9ff4d0f99b59dc095d1be9411d4af4": // initCheckBox
                return true;
        }

        return false;
    }

    /**
     * Si está en debug-mode el sistema logea información en consola.
     * @param listener
     */
    private debugMode(listener: any) {
        console.info(listener);
        console.info(this.getHash(listener));
    }

    /**
     * Antes de crear un eventListener por defecto (js) almacenamos la función que
     * se creo y el elemento que la invocó para poder limpiarlos de memoria luego.
     * Esto ya que JAVASCRIPT por defecto no elimina los EventListener por si solo.
     * @param element elemento que llama la función
     * @param type tipo de llamado (click, input, mousedown, etc)
     * @param listener funcion a llamar
     * @param global los injectables son globales y no deben ser eliminados del cache del eventlistener, si no, perderan su función.
     * @param options true or false, casi nunca se usa...
     */
    public addEventListener<K extends keyof HTMLElementEventMap>(
        element: any,
        type: any,
        listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any,
        global?: boolean,
        options?: boolean | AddEventListenerOptions
    ): void {
        if (!this.#listeners[type]) {
            this.#listeners[type] = [];
        }

        if (element instanceof HTMLCollection) {
            console.error(
                "[ERROR]:  No se puede poner eventlisteners a colecciones,utilice ids"
            );
            return;
        }

        /**
         * Agregamos una única vez los listeners al document, ya que son globales.
         */
        const hash = this.ifHashExists(
            this.#listeners[type],
            this.getHash(listener)
        );
        const isWhiteList = this.whitelistHash(this.getHash(listener));

        if (this.#debugMode) {
            this.debugMode(listener);
            return element.addEventListener(type, listener, options);
        } else {
            if (!hash || (hash && isWhiteList)) {
                this.#listeners[type].push({
                    fn: listener,
                    ele: element,
                    hash: this.getHash(listener),
                    global: global ?? false,
                });

                return element.addEventListener(type, listener, options);
            }
        }
    }

    /**
     * Elimina correctamente de memoria todas las funciones llamadas en un
     * evento determinado.
     * @nota: Esto elimina TODAS las funciones ejemplo (click).
     * SOLO debe ser usado en un OnDestroy o en un NavigationStart
     * @param type tipo de llamado (click, input, mousedown, etc)
     *
     * @nota2  los documents deben ser globales [BUG FIX 9.1.11 / 10.0.0 ANGULAR]
     */
    removeAllEventListener(types: Array<string>) {
        for (const type of types) {
            if (!this.#listeners[type] || !this.#listeners[type].length) {
                return;
            }

            [].forEach.call(this.#listeners[type], (fn: any) => {
                if (fn == null) {
                    return; // fue removido manualmente
                }
                if (fn.global) {
                    return;
                }
                fn.ele.removeEventListener(type, fn.fn);
            });
            // si no reseteamos el arreglo igual generará memory leak
            this.#listeners[type] = [];
        }
    }

    /**
     * Remueve un evento de un elemento en específico
     * @param ele HTMLElement a remover el evento
     * @param type tipo de evneto a remover (click, input, etc).
     */
    removeEventListener(ele: any, type: any) {
        [].forEach.call(this.#listeners[type], (fn: any, indx: any) => {
            if (fn == null) {
                return;
            }

            if (fn.global) {
                return;
            }
            if (fn.ele === ele) {
                fn.ele.removeEventListener(type, fn.fn);
                this.#listeners[type][indx] = null;
            }
        });
    }

    /**
     * Retorna la sesión de usuario guardada
     */
    public getUserData(): UserData {
        try {
            return JSON.parse(localStorage.getItem("userData")) ?? null;
        } catch (e) {
            console.info(
                "[SIAM]: NS_ERROR_STORAGE_IOERR: VDI Error, el usuario debe reiniciar el navegador"
            );
            return null;
        }
    }

    /**
     * otro nombre de hasRol
     * @param search
     */
    public UserHasRol(search: string): boolean {
        return this.hasRol(search);
    }

    /**
     * Detecta la presencia de un rol (true) o no (false)
     * @param search
     */
    public hasRol(search: string): boolean {
        let returnValue = false;
        this.getUserData().roles.forEach((rol) => {
            if (search.indexOf(rol) !== -1) {
                returnValue = true;
            }
        });
        return returnValue;
    }

    /**
     * Setea una nueva sesión de usuario
     */
    public setUserData(data: UserData) {
        try {
            localStorage.setItem("userData", JSON.stringify(data));
        } catch (e) {
            console.info(
                "[SIAM]: NS_ERROR_STORAGE_IOERR: VDI Error, el usuario debe reiniciar el navegador"
            );
            alert(
                "[SIAM]: NS_ERROR_STORAGE_IOERR: VDI Error, el usuario debe reiniciar el navegador"
            );
            return null;
        }
    }

    /**
     * toma los valores del breadcrumb
     */
    public getPan() {
        try {
            return this.setPan() ?? null;
        } catch (e) {
            console.info(
                "[SIAM]: NS_ERROR_STORAGE_IOERR: VDI Error, el usuario debe reiniciar el navegador"
            );
            return null;
        }
    }

    /**
     * Retorna el estado del breadcrumb
     * @returns
     */
    public isPanLoading(): boolean {
        return this.panLoading;
    }

    /**
     * Actualiza un breadcrumb automáticamente
     */
    public updatePan() {
        if (this.panIntVal !== null) {
            clearInterval(this.panIntVal);
        }

        this.panIntVal = setTimeout(() => {
            this.panVal = this.setPan();
            this.panLoading = false;
        }, 1000);
    }

    /**
     * Actualiza el breadcrumb (manualmente)
     */
    public setPan(pan?: String) {
        return pan ?? window.location.hash.slice(1);
    }

    /**
     * Transforma algun string raro en elemento html
     */
    public toHTML(input: string): any {
        return new DOMParser().parseFromString(input, "text/html")
            .documentElement.textContent;
    }

    /**
     * Detecta la posibilidad de un usario de acceder a una página x roles definidos.
     * @param rolesNecesarios los roles que se requieren para acceder
     * @param userRoles la lista de roles del usuario.
     */
    public indexOfAny(rolesNecesarios: string[], userRoles: string[]) {
        let returnValue = false;
        rolesNecesarios.forEach((rol) => {
            if (userRoles.indexOf(rol) !== -1) {
                returnValue = true;
            }
        });
        return returnValue;
    }

    /**
     * Limpia todos los errores mostrados por validateForm
     * @param input Input a analizar
     */
    cleanErrorMsgForm(input: any) {
        input.classList?.remove("label-error");
        const errMsg =
            input.parentElement?.getElementsByClassName("error-label-msg")[0] ??
            null;
        if (errMsg !== null) {
            errMsg.parentElement.removeChild(errMsg);
        }
    }

    /**
     * Retorna true si hay algun error
     * Retorna false si todo está bien.
     * @param hyStack id o clase a buscar.
     */
    validateForm(hyStack: string) {
        const inptArr = document.querySelectorAll(
            `${hyStack} input, ${hyStack} select, ${hyStack} textarea, ${hyStack} checkbox`
        );
        let errors = false;
        let errorDiv: any;

        Array.from(inptArr).forEach((inp: any) => {
            if (
                inp.dataset.ignorejson === "true" ||
                inp.dataset.ignorejsonsilence === "true"
            ) {
                return;
            }
            this.cleanErrorMsgForm(inp);
            if (
                typeof inp.required !== undefined &&
                inp.required &&
                (typeof inp.value === "undefined" ||
                    inp.value === "" ||
                    inp.value === null)
            ) {
                errorDiv = document.createElement("div");
                errorDiv.innerHTML = "Elemento requerido";
                errorDiv.setAttribute("class", "error-label-msg");

                inp.classList?.add("label-error");
                inp.parentElement?.prepend(errorDiv);
                errors = true;
                inp.addEventListener("focus", (e: { target: any }) => {
                    this.cleanErrorMsgForm(e.target);
                    inp.removeEventListener("focus", e);
                });
            }
        });
        errorDiv = null;
        return errors;
    }

    /**
     * Formatea todos los inputs en un objeto JSON para ser enviado al backend.
     * un hyStack es un elemento (clase o id) plano de HTML
     */
    getFormData(hyStack: string) {
        const dot = new DotObject(".", false, true, true);
        const obj = Object.create(null);
        const inptArr = document.querySelectorAll(
            `${hyStack} input, ${hyStack} select, ${hyStack} textarea, ${hyStack} checkbox`
        );

        Array.from(inptArr).forEach((inp: any) => {
            if (
                inp.dataset.ignorejson === "true" ||
                inp.dataset.ignorejsonsilence === "true"
            ) {
                return;
            }

            if (inp.name === "") {
                if (
                    !inp.parentElement.parentElement.classList.contains(
                        "select-items"
                    )
                ) {
                    console.info(
                        '[REVISAR]: Un elemento cuya propiedad "name" este vacía será omitida del objeto.'
                    );
                    console.info(
                        "Para efectos del sistema no tiene sentido que el name esté vacío, elimínelo o bien arregle el error"
                    );
                    console.info(inp);
                }
                return;
            }
            if (inp.className === "custom-checkbox") {
                obj[inp.name] = inp.checked
                    ? inp.dataset.checkedvalue
                    : inp.dataset.uncheckedvalue;
            } else {
                switch (inp.dataset.format) {
                    case "money":
                        inp.value = this.onlyNumbers(inp.value.toString());
                        break;
                }

                if (inp.type === "date") {
                    obj[inp.name] =
                        inp.dataset.dateformat === "Java"
                            ? this.JSDate2Java(inp.value)
                            : inp.value;
                } else {
                    obj[inp.name] =
                        inp.type === "number"
                            ? parseInt(inp.value, 10)
                            : inp.value;
                }
            }
        });
        return dot._object(obj);
    }

    /**
     * retorna un Objeto casteado a DotObject
     */
    getDotObject() {
        return new DotObject(".", false, true, true);
    }

    /**
     * Mismo que getFormData, pero en cambio de recibir un formulario, se recibe un objeto
     * en este método "rápido" mno se parsea números ni nada por el estilo...
     */
    getObjectData(obj: any) {
        const dotObj = Object.create(null);
        const dot = new DotObject(".", false, true, true);

        for (const key in obj) {
            dotObj[key] = obj[key].value ?? "";
        }

        return dot._object(dotObj);
    }

    /**
     * Transofrma las fechas de Oracle en JS
     * @param dtime Fecha en Oracle
     */
    javaDate2JS(dtime: string) {
        if (dtime === null || typeof dtime === "undefined") {
            return null;
        }
        if (dtime.indexOf("T") !== -1) {
            const anho = dtime.split("T")[0].split("-")[0];
            const mes = dtime.split("T")[0].split("-")[1];
            const dia = dtime.split("T")[0].split("-")[2];

            return `${anho}-${mes}-${dia}`;
        } else if (dtime.indexOf(" ") !== -1) {
            return dtime.split(" ")[0];
        }
    }

    /**
     * Al devolver la fecha al backend, debemos devolverla como formato JAVA
     */
    JSDate2Java(dtime: string) {
        return dtime == null || dtime.isEmpty()
            ? ""
            : `${dtime}T00:00:00.000-0600`;
    }

    /**
     * Obtiene la fecha con formato JS
     */
    dateNow() {
        let today = new Date();
        const dia = String(today.getDate()).padStart(2, "0");
        const mes = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        const anho = today.getFullYear();
        const hour = today.getHours();
        const min = today.getMinutes();

        return `${anho}-${mes}-${dia}`;
    }

    /**
     * Retorna la fecha actual (dateNow) pero estandarizado con get
     */
    getDate() {
        return this.dateNow();
    }

    getYear() {
        return new Date().getFullYear();
    }

    /**
     * Acorta un string a len caracteres (23 por defecto)
     */
    shorter($str: string, $len = 23) {
        return $str.slice(0, $len) + "...";
    }

    /**
     * Es una función de los input[type='select']
     * filtra las opciones por keydownevent
     * @param element
     * @param rows
     */
    filterLinks(element: any, rows: any) {
        [].forEach.call(rows.children as HTMLCollection, (ele: any) => {
            if (
                !(ele.innerHTML as string)
                    ?.toLowerCase()
                    .includes(element.value?.toLowerCase()) &&
                ele.dataset.ignoreclick !== "true"
            ) {
                ele.classList.add("hide");
            } else {
                ele.classList.remove("hide");
            }
        });
    }

    /**
     * Evento que se dispara cuando se selecciona una opción de un input[type='select']
     * @param ev
     */
    eventListenerSelectOptions = (ev: any) => {
        const realSelect = (ev.target.parentNode
            .parentNode as HTMLElement).getElementsByTagName("select")[0];
        const h: any = ev.target.parentNode.previousSibling;

        for (let i = 0; i < realSelect.length; i++) {
            if (realSelect.options[i].innerHTML === ev.target.innerHTML) {
                realSelect.selectedIndex = i;

                const evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                realSelect.dispatchEvent(evt);

                const evtCstm = new Event("customSelectChange", {
                    bubbles: true,
                });
                realSelect.dispatchEvent(evtCstm);

                h.innerHTML = `<div class="span-box"><i class="material-icons">keyboard_arrow_down</i></div>${ev.target.innerText}`;
                const y = (ev.target
                    .parentNode as HTMLElement).getElementsByClassName(
                    "same-as-selected"
                );
                for (const columnClass of y as any) {
                    columnClass.removeAttribute("class");
                }
                ev.target.setAttribute("class", "same-as-selected");
                break;
            }
        }
        h.click();
    };

    /**
     * Formatea todos los selects de una página para que sean bonitos
     */
    initSelect() {
        for (const ele of document.getElementsByTagName("select") as any) {
            if (!ele.parentNode.classList.contains("label-hover")) {
                console.error(
                    'El select debe estar dentro de un div class="label-hover"'
                );
            }

            if (ele.dataset.rendered === "true") {
                return;
            } else {
                ele.setAttribute("data-rendered", "true");
            }

            const container = document.createElement("div");
            container.setAttribute("class", "select-selected");
            container.innerHTML = ele.options[ele.selectedIndex]?.innerHTML;

            if (ele.required) {
                container.setAttribute("required", "true");
            }

            if (ele.disabled) {
                container.classList.add("select-disabled");
            }

            const check = document.createElement("i");
            check.setAttribute("class", "material-icons reset-check");
            check.innerHTML = "keyboard_arrow_down";

            const simulateBox = document.createElement("div");
            simulateBox.setAttribute("class", "span-box");
            container.prepend(simulateBox);

            simulateBox.prepend(check);
            container.prepend(simulateBox);

            const rows = document.createElement("div");
            rows.setAttribute("class", "select-items select-hide");

            if (ele.children.length >= 4) {
                const filterDiv = document.createElement("div");
                filterDiv.setAttribute("data-ignoreclick", "true");
                const filter = document.createElement("input");
                filter.setAttribute("data-ignoreclick", "true");
                filter.setAttribute("class", "w100 defaultInput");
                filter.setAttribute("placeholder", "Filtrar...");
                filter.setAttribute("data-isfilter", "true");
                filter.style.minHeight = "38px";
                filterDiv.appendChild(filter);
                rows.appendChild(filterDiv);
                this.addEventListener(filter, "input", () =>
                    this.filterLinks(filter, rows)
                );
            }

            for (const option of ele.children) {
                const opt = document.createElement("div");
                opt.innerHTML = option.innerHTML;

                this.addEventListener(
                    opt,
                    "click",
                    this.eventListenerSelectOptions
                );
                rows.appendChild(opt);
            }

            ele.parentElement.appendChild(container);
            ele.parentElement.appendChild(rows);

            ele.hidden = true;
            const doc = this;

            this.addEventListener(container, "click", (e) =>
                this.openSelect(e, doc, ele)
            );
        }

        this.addEventListener(document, "click", this.closeAllSelect);
    }

    /**
     * Abre el combobox seleccionado
     */
    openSelect(e: any, doc: this, ele: any) {
        e.stopPropagation();

        if (e.clientX === 0 && e.clientY == 0) {
            /**
             * llamado desde una opción de menu, no debe ejecutar este código
             */
            return;
        }

        doc.closeAllSelect(doc);

        const select = ele.parentNode.querySelector("select");
        if (
            !select.disabled &&
            typeof select.dataset.ignoreclick === "undefined"
        ) {
            (e.target.nextSibling as HTMLElement).style.width =
                e.target.offsetWidth + "px";
            const top =
                e.target.getBoundingClientRect().top + e.target.offsetHeight;
            (e.target
                .nextSibling as HTMLElement).style.maxHeight = `calc(100vh - ${
                top + 20
            }px)`;
            (e.target.nextSibling as HTMLElement).classList.toggle(
                "select-hide"
            );
            e.target.classList.toggle("select-arrow-active");

            if (typeof ele.nextElementSibling.children[0] !== "undefined") {
                ele.nextElementSibling.children[0].innerHTML =
                    '<i class="material-icons reset-check">keyboard_arrow_up</i>';
            }
        }
    }

    /**
     * Cierra todos los selects que se encuentren en una página
     */
    closeAllSelect(elmnt: any) {
        if (elmnt.target?.dataset?.ignoreclick === "true") {
            return;
        }

        const arrNo = [];
        const x = document.getElementsByClassName("select-items");
        const y = document.getElementsByClassName("select-selected");
        for (let i = 0; i < y.length; i++) {
            if (elmnt === y[i]) {
                arrNo.push(i);
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }

        document
            .querySelectorAll(".reset-check")
            .forEach((check: HTMLElement) => {
                check.innerText = "keyboard_arrow_down";
            });
    }

    /**
     * Inicializa todos los checkbox que aun no hayan sido renderizados previamente.
     * @returns
     */
    initCheckBox() {
        for (const ele of document.querySelectorAll(
            'input[type="checkbox"][class^="custom-checkbox"][data-rendered="false"]'
        ) as any) {
            if (!ele.parentNode.classList.contains("label-hover")) {
                console.error(
                    'El select debe estar dentro de un div class="label-hover"'
                );
            }

            if (ele.dataset.rendered === "true") {
                return;
            } else {
                ele.setAttribute("data-rendered", "true");
            }

            const container = document.createElement("div");
            container.setAttribute(
                "class",
                `check-selected defaultInput fix-div w100 ${
                    ele.checked ? ele.dataset.checkclass : ""
                }`
            );
            container.setAttribute("data-key", ele.dataset.key);
            container.setAttribute("data-rowid", ele.dataset.rowid);
            container.setAttribute("data-isautomatic", ele.dataset.isautomatic);
            container.setAttribute("name", ele.name);
            (container as any).name = ele.name;

            const check = document.createElement("i");
            check.setAttribute("class", "material-icons checkSelectedFix");
            if (ele.checked) {
                container.innerHTML = ele.dataset.checklabel ?? "Presenta";
                check.innerHTML = "done";
            } else {
                container.innerHTML = ele.dataset.unchecklabel ?? "No presenta";
                check.innerHTML = "close";
            }

            const simulateBox = document.createElement("div");
            simulateBox.setAttribute("class", "span-box checkSelectedFixSpan");
            container.prepend(simulateBox);

            simulateBox.prepend(check);

            if (ele.required) {
                container.setAttribute("required", "true");
            }

            if (ele.readOnly) {
                container.classList.add("check-disabled");
            }

            this.addEventListener(container, "click", function (e) {
                const realCheckbox = (this.parentNode
                    .parentNode as HTMLElement).querySelectorAll(
                    'input[type="checkbox"][class^="custom-checkbox"]'
                )[0] as any;

                if (realCheckbox.readOnly) {
                    return;
                }

                realCheckbox.checked = !realCheckbox.checked;
                if (
                    realCheckbox.checked &&
                    !container.classList.contains(
                        realCheckbox.dataset.checkclass
                    )
                ) {
                    container.classList.add(realCheckbox.dataset.checkclass);
                    container.innerHTML =
                        realCheckbox.dataset.checklabel ?? "Presenta";
                    check.innerHTML =
                        realCheckbox.dataset.checkclass === "check-checked-red"
                            ? "close"
                            : "done";
                    simulateBox.prepend(check);
                    container.prepend(simulateBox);
                } else if (!realCheckbox.checked) {
                    container.classList.remove(realCheckbox.dataset.checkclass);
                    container.innerHTML =
                        realCheckbox.dataset.unchecklabel ?? "No presenta";
                    check.innerHTML = "close";
                    simulateBox.prepend(check);
                    container.prepend(simulateBox);
                }
            });
            ele.parentElement.appendChild(container);
            ele.hidden = true;
        }
    }

    /**
     * La idea es que trabaje muy similar al $(<element>) de JQUERY
     * @param tag id o clase a buscar
     * @param camp si se omite busca todos los elementos si no solo 1.
     */
    getInput(tag: string, allSelector: number = null): any {
        return allSelector !== null
            ? document.querySelectorAll(tag)
            : document.querySelector(tag);
    }

    /**
     * por defecto JS hace "Shallow Copy", lo que hace que duplicar un  objeto mantenga la referencia al anterior.
     * "si edita la copia edita el original", deepCopy hace una copia desde 0.
     * deepCopy != json parse / stringify: El JSON no copia funciones ni elementos complejos DeepCopy SI!!
     * @param inObject
     */
    deepCopy(inObject: any) {
        let outObject: any;
        let value: any;
        let key: any;

        if (typeof inObject !== "object" || inObject === null) {
            return inObject; // Return the value if inObject is not an object
        }

        // Create an array or object to hold the values
        outObject = Array.isArray(inObject) ? [] : {};

        for (key in inObject) {
            value = inObject[key];

            // Recursively (deep) copy for nested objects, including arrays
            outObject[key] = this.deepCopy(value);
        }

        return outObject;
    }

    /**
     * formatea el texto como millones,miles.decimales
     * (1,000,000.00)
     */
    moneyFormat(amount: any, decimalCount = 2, decimal = ".", thousands = ",") {
        try {
            amount = this.onlyNumbers(amount.toString());
            decimalCount =
                amount.toString().split(".")?.[1]?.length > 0
                    ? amount?.split(".")?.[1]?.length
                    : decimalCount ?? 2;

            const negativeSign = amount < 0 ? "-" : "";

            const i: any = parseInt(
                (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
            ).toString();
            const j = i.length > 3 ? i.length % 3 : 0;

            return (
                "\u20A1" +
                negativeSign +
                (j ? i.substr(0, j) + thousands : "") +
                i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
                (decimalCount
                    ? decimal +
                      Math.abs(amount - i)
                          .toFixed(decimalCount)
                          .slice(2)
                    : "")
            );
        } catch (e) {
            return amount;
        }
    }

    /**
     * proceso inverso del moneyFormat elimina las "comas ," de los miles y millones
     * y el símbolo de millones, deja los decimales y el "-" de serlo...
     * @param str
     */
    onlyNumbers(str: string) {
        return str.replace(/[^\d.-]/g, "");
    }

    /**
     * Setea los campos del backend a un formato Front end automáticamente.
     * @param col
     * @returns
     */
    parseJIONames(col: string) {
        let retCol = "";
        const colSplit = col.split("_");

        colSplit.forEach((name) => {
            switch (name.toLowerCase()) {
                case "di":
                case "ce":
                case "ca":
                    break;
                case "tip":
                    retCol += "Tipo ";
                    break;
                case "des":
                    retCol += "Desc. ";
                    break;
                case "num":
                    retCol += "No. ";
                    break;
                case "fec":
                    retCol += "Fecha ";
                    break;
                case "ind":
                    retCol += "Ind. ";
                    break;
                case "mto":
                case "mon":
                    retCol += "Monto ";
                    break;
                case "cod":
                    retCol += "Cod. ";
                    break;
                case "per":
                    retCol += "Periodo ";
                    break;
                default:
                    const first = name.charAt(0).toUpperCase();
                    retCol += first + name.substr(1, name.length) + " ";
                    break;
            }
        });

        return retCol.trim();
    }

    /**
     * NO MANDE EL FROM, SOLO LAS COLUMNAS DEL SELECT
     * Formeatea un select a un elemento tipo JSon Input Object (JIO)
     * elimina los ", +, |, ' de encontrar
     * después elimina todo lo que esté entre () como funciones
     * elimina SELECT y otras funciones de PLSQL
     *
     * después hace split de cada columna (,) y lo separa si encuentra (.) o un alias ( )
     * finalmente pasa todo a minuscula excepto las letras después de (_) para que se acople a hibernate
     *
     * Cómo usarlo:
     *
     *
     *   ngOnInit() {
     *       this.utils.cleanSelect(`
     *           "SELECT A.COD_CIA, A.NUM_DOC, A.FEC_DOC, A.DEPARTAMENTO, B.DES_DEPTO, A.SOLICITANTE, "
     *           + "RTRIM(C.DES_NOMBRE)||' '||RTRIM(C.DES_APELLIDO1)||' '||RTRIM(C.DES_APELLIDO2) NOMBRE_SOLICITANTE, A.MON_DOCTO, A.OBSERVACIONES, "
     *           + "A.EST_MOVIMIENTO, A.TIPO, DECODE(A.TIPO,'O','BIENES','SERVICIOS') DES_TIPO, A.EXPEDIENTE, A.ANO_FISCAL, A.PER_PROCESO, A.ID_USUARIO, "
     *           + "A.FECHA_REGISTRO, A.PROGRAMA, A.PROYECTO, A.AUTORIZA_AREA, A.AUTORIZA_PRESUPUESTO, A.AUTORIZA_DIRECTOR, A.FEC_AUTORIZA_AREA, "
     *           + "A.FEC_AUTORIZA_PRESUP, A.FEC_AUTORIZA_DIRECTOR, A.IND_APR_AREA, A.IND_APR_PRESUP, A.IND_APR_DIRECTOR, A.RECIBE_PROVEDURIA, "
     *           + "A.FEC_RECIBE_PROVEDURIA, A.IND_APR_ALCALDE, A.FEC_AUTORIZA_ALCALDE, A.AUTORIZA_ALCALDE, A.IND_RECHAZA, A.FEC_RECHAZADO, A.RECHAZADO_POR, "
     *           + "A.MOTIVO_RECHAZO, A.IND_TRAMITE, A.FEC_ANULADA, A.ANULADO_POR, A.IND_NOTIFICACION, A.FEC_NOTIFICACION, A.FEC_INICIO_OC, "
     *           + "PRESUP.FNC_REVISA_MONTOS_REQUI(A.COD_CIA, A.NUM_DOC, A.MON_DOCTO) IND_IGUAL "
     *       `);
     *   }
     */
    cleanSelect(select: string) {
        let JIO = "";

        select = select.replaceAll('"', "");
        select = select.replaceAll(/\+/, "");
        select = select.replaceAll(/\|/, "");
        select = select.replaceAll(/\'/, "");
        select = select.replaceAll(/\(([^\)]+)\)/, "");
        select = select.replaceAll("SELECT", "");
        select = select.replaceAll("RTRIM", "");
        select = select.replaceAll("DECODE", "");
        select = select.replaceAll("LTRIM", "");
        select = select.replaceAll("NVL", "");

        if (select.toUpperCase().includes("FROM") === true) {
            console.info("FROM encontrado, use nada más la parte del SELECT");
            return;
        }

        const columns = select.split(",");

        columns.forEach((column, indx: number) => {
            column = column.trim();
            let realCol = "";

            if (column.indexOf(" ") > 0) {
                realCol = column.split(" ")[1];
            } else if (column.indexOf(".") > 0) {
                realCol = column.split(".")[1];
            } else {
                realCol += column;
            }

            realCol = realCol.toLowerCase();
            const unparsedCol = realCol;

            do {
                const indxOf = realCol.indexOf("_");
                if (indxOf > 0) {
                    const charAt = realCol.charAt(indxOf + 1);
                    realCol = realCol.replace(
                        "_" + charAt,
                        charAt.toUpperCase()
                    );
                }
            } while (realCol.indexOf("_") > 0);

            JIO += `
${realCol}: new HTMLInput({
    type: 'hidden',
    alias: '${this.parseJIONames(unparsedCol)}',
    value: data[${indx}],
    columnClass: 'col-3',
}),`;
        });

        document.getElementsByClassName("mat-drawer-content")[0].innerHTML = `
            <textarea class="form-control" style="width: 87vw;height: 98vh; display: block; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; color: #495057; background-color: #fff;
                background-clip: padding-box; border: 1px solid #ced4da; border-radius: .25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;">${JIO}
            </textarea>
        `;
    }

    /**
     * Funciona similar al cleanSelect
     * la diferencia esq este parsea un objeto, ya que a partir del modulo de cobros
     * se usa la (List<ObjectNode> | ObjectNode)
     */
    cleanObject(obj: any, isRecursive = false, RecursiveKey = "") {
        let deepCopy: any;
        if (!isRecursive) {
            this.#jsonInputObject = "";
        }

        if (typeof obj[0] === "undefined") {
            // es un elemento
            deepCopy = this.deepCopy(obj);
        } else {
            // es una lista de elementos
            deepCopy = this.deepCopy(obj[0]);
        }

        Object.keys(deepCopy).forEach((key: string) => {
            const haveDot = key === "id";
            if (typeof deepCopy[key] === "object" && deepCopy[key] !== null) {
                this.cleanObject(deepCopy[key], true, key);
            } else {
                this.#jsonInputObject += `
${!isRecursive ? key : "'" + RecursiveKey + "." + key + "'"}: new HTMLInput({
    type: 'hidden',
    alias: '${this.parseJIONames(key)}',
    value: ${"data." + (!isRecursive ? "" : "id.") + key},
    columnClass: 'col-3',
}),`;
            }
        });

        if (!isRecursive) {
            document.getElementsByClassName(
                "mat-drawer-content"
            )[0].innerHTML = `
                <textarea class="form-control" style="width: 87vw;height: 98vh; display: block; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; color: #495057; background-color: #fff;
                    background-clip: padding-box; border: 1px solid #ced4da; border-radius: .25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;">${
                        this.#jsonInputObject
                    }
                </textarea>
            `;
        }
    }

    /**
     * Forza recargar la pantalla
     */
    reloadPage(router: Router) {
        this.#timeOutReload(router);
        clearTimeout(this.#timeOutReload(router));
    }

    /**
     * Devuelve el verdadero largo de una lista.
     * @param list
     * @param prop
     */
    getListLenght(list: [], prop: string) {
        let len = list.length;
        if (len === 0) return 0;
        else {
            list.forEach((ele: any) => {
                if (ele[prop].value === "") len--;
            });
        }
        return len;
    }

    /**
     * Imprime un PDF en un TAB nuevo
     */
    printPDF(pdfBytes: ArrayBuffer) {
        if (pdfBytes.byteLength > 0) {
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            window.open(window.URL.createObjectURL(blob), "_blank");
        } else {
            console.info(
                "[SIAM]: El reporte no se mostró por que no presenta datos"
            );
        }
    }

    /**
     * En algunas ocaciones el backend devolverá los bytes planos,
     * en vez de en formato ByteArray, cuando sucede eso, el printPDF
     * no funciona y debemos usar este método que lee byte por byte del String
     * y los transforma en un Arreglo que puede ser leido como blob
     * @param pdfBytes
     */
    printPlainPDFBytes(pdfBytes) {
        const byteCharacters = atob(pdfBytes);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        window.open(window.URL.createObjectURL(blob), "_blank");

    }

    /**
     * Elimina caracteres raros de una string en URL
     */
    cleanURI(str: string) {
        return str?.replaceAll("%2520", "")?.replaceAll("%20", " ");
    }
}
