import { Utils } from "src/app/Utils/Util";
import { OnDestroy, Injectable } from "@angular/core";
import { Orquesta, HTMLForm, HTMLInput, formClasses, formClassType } from "../../Utils/Interfaces";
import { MatDialogRef } from '@angular/material/dialog';
import { DataTableComponent } from '../data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';
import { NavigationStart, Router, RouterEvent } from '@angular/router';

/**
 * Esta se crea como una clase Helper de DataTablesComponent
 * lo principal es que el funcionamiento de esta sea el correcto.
 * Puede ser consumido por otras clases, pero de no ser imperativo
 * no edite nada de aca sin conocimiento de DataTablesComponent
 */
@Injectable({
    providedIn: "root",
})
export class Forms implements OnDestroy {

    /**
     * Los TimeOuts no deben ser limpiados. Sin embargo, en esta ocación necesitamos hacerlo.
     * Asi, que lo almacenamos en una variable.
     */
    collapseTabTimeOut: any;


    public detailFormData: any;

    /**
     * Almacena el click a un input en una lista
     * para que pueda recorrer con flechas para abajo y arriba.
     */
    #listItemClicked: any;

    /**
     * Almacena el elemento que está siendo clickeado, para realizar acciones varias...
     */
    #clickedFormElement: any = null;


    /**
     * Los clicks simulados en lista (para bajar subir de registro)
     * no deben ejecutar acciones de llamado.
     */
    #isClickByList: boolean;

    /**
     * ReorderList: cuando se elimina una linea con deleteRow()
     * debe almacenar el nombre de la lista en donde se guardó para eliminar
     * unos campos "vaciós" para que no se envíen al backend
     */
    reorderList: Array<any> = [];

    /**
     * Almacena la información del Modal llamado para evitar memory leaks
     * Me parece que debo revisarlo...
     */
    private modalServiceSingleton: DataTableComponent;

    /**
     * código html del loader del form
     */
    #HTMLoader = `
        <div class='row ml-3 mr-3'>
            <div class='col-12' id="ajaxLoader" style='border: 0 !important'>
                <mat-progress-spinner class="mat-progress-spinner mat-primary mat-progress-spinner-indeterminate-animation" color="primary" mode="indeterminate" role="progressbar" ng-reflect-color="primary" ng-reflect-mode="indeterminate" style="width: 100px; height: 100px;"><svg focusable="false" preserveAspectRatio="xMidYMid meet" ng-reflect-ng-switch="true" style="width: 100px; height: 100px;" viewBox="0 0 100 100"><!--bindings={
                    "ng-reflect-ng-switch-case": "true"
                }--><circle cx="50%" cy="50%" r="45" style="animation-name: mat-progress-spinner-stroke-rotate-100; stroke-dasharray: 282.743px; stroke-width: 10%;" class="ng-star-inserted"></circle><!--bindings={
                    "ng-reflect-ng-switch-case": "false"
                }--></svg></mat-progress-spinner>
            </div>
            <div class='col-12'>
                <div class='text-center'>Cargando formulario...</div>
            </div>
        </div>
    `;

    constructor(
        public util: Utils,
        private toastr: ToastrService,
        private router: Router
    ) {
        this.util.addEventListener(document, "click", (e) =>
            this.onFormClick(e.target), true
        );

        this.util.addEventListener(document, "input", (e) =>
            this.onFormInput(e.target), true
        );

        this.util.addEventListener(document, "customSelectChange", (e) =>
            this.onFormChange(e.target), true
        );

        this.util.addEventListener(document, "keydown", (e: KeyboardEvent) =>
            this.onFormKeypress(e), true
        );

        router.events.subscribe((e: RouterEvent) => {
            if (e instanceof NavigationStart) {
                // Antes de dejar una página al no funcionar el ngOnDestroy,
                // lo que hacemos es limpiar de forma manual los datos..
                this.cleanDetailFormData();
            }
        });
    }

    ngOnDestroy(): void {
        this.cleanDetailFormData();
    }

    /**
     * Limpiamos manualmente el formulario, ya que es una clase Singleton,
     * NUNCA correrá ngOnDestroy hasta que se recargue la página.
     */
    cleanDetailFormData() {
        this.toastr.clear();

        if (this.detailFormData === null || typeof this.detailFormData === 'undefined') {
            return;
        }

        for (const property in this.detailFormData) {
            this.detailFormData[property] = null;
            delete this.detailFormData[property];
        }
        this.detailFormData['__proto__'] = null;
        this.detailFormData = null;

        this.reorderList = [];

        if (typeof this.modalServiceSingleton !== 'undefined') {
            this.modalServiceSingleton.ngOnDestroy();
            this.modalServiceSingleton = null;
        }

        if (this.collapseTabTimeOut) {
            clearTimeout(this.collapseTabTimeOut);
            this.collapseTabTimeOut = null;
        }

        this.#listItemClicked = null;
    }
    /**
     * Formatea los HTMLInput's para que trabajen como objetos independientes.
     */
    public async parseStandartResponse(response: any) {
        if (typeof (await response) === 'undefined') {
            console.error('Undefined response: el detailService no está entregando ningún objeto.');
            return undefined;
        }

        if (response instanceof Array) {
            response.forEach((obj: any, indx) => {
                Object.keys(obj).forEach((key) => {
                    obj[key].name = key;
                });

                obj.rowId = indx;
            });
        } else if (response instanceof Object) {
            Object.keys(response).forEach((key) => {
                response[key].name = key;
            });
        }

        return true;
    }

    /**
     * Cierra un Tab completo!
     * Si lo que se desea es cerrar el detailview, es con closeDetailView
     */
    collapseTab(ele: any) {
        if (ele.dataset.unhide === "true") {
            return;
        }

        const detalle = ele.parentElement.nextElementSibling;
        if (!detalle.classList.contains("hideDetailView")) {
            detalle.classList.add("hideDetailView");
            ele.nextElementSibling.firstChild.innerHTML = "expand_less";
            clearTimeout(this.collapseTabTimeOut);

            this.collapseTabTimeOut = setTimeout(() => {
                detalle.classList.add("hide");
                ele.parentElement.classList.add("mb-2");
            }, 200);
        } else {
            ele.nextElementSibling.firstChild.innerHTML = "expand_more";
            ele.parentElement.classList.remove("mb-2");
            detalle.classList.remove("hideDetailView", "hide");
        }
    }

    /**
     * Retorna true si un checkbox presenta alguna de las siguientes
     * valores
     */
    private getCheckedState(data: any) {
        return data === "S" || data === "true" || data === "1" ? true : false;
    }

    /**
     * Arma las opciones de un select bajo la estructura de matriz:
     * Arreglo[Arreglo["opcion", "valor"], ...]
     */
    private async parseSelectOptions(data: any) {
        let htmlOpts = "";
        const opts = await data.selectService?.call(this, data);
        if (typeof opts !== "undefined" && opts instanceof Array) {
            for (const ele of opts) {
                if (!(ele instanceof Array)) {
                    console.error(
                        'La estructura de un Select es Arreglo[Arreglo["opcion", "valor"], ...]'
                    );
                    break;
                }
                htmlOpts += `<option value="${ele[0]}" ${ele[0].toString() === data.value ? "selected" : ""
                    }>${ele[1]}</option>`;
            }
        }

        return htmlOpts;
    }

    /**
     * Se usa para tomar el primer valor válido de una tabla
     * con el fin de pintarlo en el título de un DetailView
     */
    private getFirstKey(data: any, indx = 0) {
        if (typeof data === 'undefined' || typeof data[Object.keys(data)[indx]] === "undefined") {
            return "";
        }

        if (data[Object.keys(data)[indx]] instanceof Array) {
            indx++;
        }

        return data[Object.keys(data)[indx]].alias !== ""
            ? data[Object.keys(data)[indx]].alias
            : this.getFirstKey(data, indx + 1);
    }

    /**
     * Se usa para tomar el primer valor válido de una tabla
     * con el fin de pintarlo en el título de un DetailView
     */
    private getFirsValue(data: any, indx = 0) {
        if (typeof data === 'undefined')
            return "";

        if (data[Object.keys(data)[indx]] instanceof Array) {
            indx++;
        }

        if (typeof data[Object.keys(data)[indx]] === "undefined") {
            return "";
        }
        return data[Object.keys(data)[indx]].alias !== ""
            ? data[Object.keys(data)[indx]].value
            : this.getFirsValue(data, indx + 1);
    }

    /**
     * 1. Crea la barra de opciones de un DetailView
     *  TRUE: nuevo item
     *  FALSE: Edita item
     */
    public createDetailToolBar(data: any, rowId: number, newItem: boolean) {
        return `
            <div class="row w100 m-0 optionDetailRow">
                <div class="col-8 p-0">
                    <h3 class='h3DynamicDetailInfo'>
                    ${!newItem
                ? `Detalle ${this.getFirstKey(
                    data
                )}: <b>${this.getFirsValue(data)}</b>`
                : "Nuevo registro"
            }
                    </h3>
                </div>
                <div class="col-4 p-0 d-flex flex-row-reverse">
                    <button id="onClickCloseDetailInfo" class=" btn mt-2 mb-2 ml-1 mr-2 btn-error"
                        title="Cerrar ventana detalle">
                        <i class="material-icons d-flex">fullscreen_exit</i>
                    </button>
                    ${!newItem
                ? `
                            <button class=" btn btnGuardarEdicion mt-2 mb-2 ml-1 mr-0 btn-success"
                                title="Guardar elemento">
                                <i class="material-icons d-flex btnGuardarEdicionFix">save</i>
                            </button>
                            <button class=" btn btnHabilitaEdicion mt-2 mb-2 ml-1 mr-0"
                                title="Habilitar edición">
                                <i class="material-icons d-flex btnHabilitaEdicionFix">lock_open</i>
                            </button>
                            <button class=" btn btnUpElement mt-2 mb-2 ml-1 mr-0"
                                title="Siguiente elemento de la tabla" data-rowid="${rowId}">
                                <i class="material-icons d-flex btnUpElementFix">keyboard_arrow_up</i>
                            </button>
                            <button class=" btn btnDownElement mt-2 mb-2 ml-1 mr-0"
                                    title="Siguiente elemento de la tabla" data-rowid="${rowId}">
                                    <i class="material-icons d-flex btnDownElementFix">keyboard_arrow_down</i>
                            </button>
                        `
                : `
                            <button class=" btn btnNuevoRegistro mt-2 mb-2 ml-1 mr-0 btn-success"
                                title="Crear registro">
                                <i class="material-icons d-flex btnNuevoRegistroFix">save</i>
                            </button>
                        `
            }
                </div>
            </div>
            <div class="container-fluid w100 disabledOff">
        `;
    }

    firstDebug = 0;
    debugFirst(data: any) {
        if (this.firstDebug === 0) {
            console.info(data);
        }
        this.firstDebug++;
    }

    public getColumClass(data: any) {
        return data.type !== "title" && data.type !== "subtitle"
            ? data?.columnClass ?? "col-3"
            : data.columnClass ?? "";
    }

    public getInputClass(data: any) {
        return data.type !== "title" && data.type !== "subtitle"
            ? data?.inputClass ?? "" : "";
    }

    private getLabel(data: any) {
        if (data.alias) {
            return `
                <label>
                    ${data.alias}
                    ${data.required === true ? '<span style="color:red"> *</span>' : ""}
                </label>
            `;
        } else {
            return '';
        }
    }

    private getStyle(data: any) {
        return data.style === null ? "" : `style="${data.style}"`;
    }


    public getValue(data: any) {
        switch (data.format) {
            case 'money': return this.util.moneyFormat(data.value);
            default: return data.value;
        }
    }

    /**
     * Crea un Input básico si dentro de un DetailView
     * un data.type number es un string normal por que puede ser formateado
     * con money, si fuese un input number no funcionaría el parseo
     *
     * isAutomatic = si es creado automáticamente por un data table -> debe meterlo en el dataset
     */
    public createDefaultInput(data: any, rowId: any, newItem: boolean, key: any, columnId: number, isAutomatic = false) {
        if (data.type !== "hidden") {
            return `
                <div
                    class='${!isAutomatic ? this.getColumClass(data) : "w-100"} pr-1 pl-1'
                    ${this.getStyle(data)}
                    data-columnid="${columnId}"
                >
                    <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? isAutomatic ? " mb-1" : " mb-3" : ""}">
                        ${!isAutomatic ? this.getLabel(data) : ""}
                        <input
                            style="${data.format === "money" ? "text-align: right; padding-right: 10px !important;" : ""}"
                            data-ignorejson='${data.ignoreJson}'
                            type='${(data.type === 'number' ? 'text' : data.type) ?? 'text'}'
                            class="p-0 defaultInput onInputClick w100 ${this.getInputClass(data)}"
                            ${data.type === 'date'
                    ? `min="1997-01-01" max="2100-12-31" data-dateformat="${data.dateTimeFormat}"`
                    : ''
                }
                            name='${data.name}'
                            ${(!newItem || data.forceReadonly) && !isAutomatic ? "readonly" : ""}
                            ${data.readonly ? ' data-ignoreclick="true"' : ""}
                            value="${this.getValue(data) ?? ''}"
                            ${data.type === 'number' ? 'data-validatenumber="true"' : ''}
                            data-rowid="${rowId}"
                            data-modalvalue="${data.modalValue}"
                            data-format="${data.format}"
                            data-isautomatic="${isAutomatic ? "true" : "false"}"
                            data-key="${key}"
                            data-label="${data.alias}"
                            ${data.required ? "required" : ""}
                            maxlength='${data.textMaxSize}'
                            minlength='${data.textMinSize}'
                        >
                        ${typeof data.tooltip === 'string' ? `<span class="tooltip">${data.tooltip}</span>` : ""}
                    </div>
                </div>
            `;
        } else {
            return `
                <input
                    data-ignorejson='${data.ignoreJson}'
                    type='${data.type}'
                    data-rowid="${rowId}"
                    class="p-0 defaultInput w100 ${this.getInputClass(data)}"
                    name='${data.name}'
                    readonly
                    value="${data.value ?? ""}"
                    data-modalvalue="${data.modalValue}"
                    ${data.required ? "required" : ""}
                >
            `;
        }
    }

    /**
     * Crea un Input de tipo File
     */
    public createFileInput(data: any, rowId: any, newItem: boolean, key: any, columnId: number) {
        return `
            <div
                class='${this.getColumClass(data)} pr-1 pl-1'
                ${this.getStyle(data)}
                data-columnid="${columnId}"
            >
                <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? " mb-3" : ""}">
                    ${this.getLabel(data)}
                    <input
                        type='file'
                        accept='${data.acceptFormats}'
                        class="p-0 defaultInput onInputClick w100 ${this.getInputClass(data)}"
                        name='${data.name}'
                        ${(!newItem || data.forceReadonly) ? "readonly" : ""}
                        ${data.readonly ? ' data-ignoreclick="true"' : ""}
                        value="${this.getValue(data) ?? ''}"
                        data-rowid="${rowId}"
                        data-key="${key}"
                        data-label="${data.alias}"
                        ${data.required ? "required" : ""}
                    >
                    ${typeof data.tooltip === 'string' ? `<span class="tooltip">${data.tooltip}</span>` : ""}
                </div>
            </div>
        `;
    }

    /**
     * Crea un textarea
     */
    public createTextArea(data: any, rowId: any, newItem: boolean, key: any, columnId: number) {
        if (data.type !== "hidden") {
            return `
                <div
                    class='${this.getColumClass(data)} pr-1 pl-1'
                    ${this.getStyle(data)}
                    data-columnid="${columnId}"
                >
                    <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? " mb-3" : ""}">
                        ${this.getLabel(data)}
                        <textarea
                            data-ignorejson='${data.ignoreJson}'
                            type='${(data.type === 'number' ? 'text' : data.type) ?? 'text'}'
                            class="p-0 defaultInput onInputClick w100 ${this.getInputClass(data)}"
                            name='${data.name}'
                            ${(!newItem || data.forceReadonly) ? "readonly" : ""}
                            ${data.readonly ? ' data-ignoreclick="true"' : ""}
                            value="${this.getValue(data) ?? ''}"
                            ${data.type === 'number' ? 'data-validatenumber="true"' : ''}
                            data-rowid="${rowId}"
                            data-modalvalue="${data.modalValue}"
                            data-format="${data.format}"
                            data-isautomatic="false"
                            data-key="${key}"
                            data-label="${data.alias}"
                            ${data.required ? "required" : ""}
                            maxlength='${data.textMaxSize}'
                            minlength='${data.textMinSize}'
                        ></textarea>
                        ${typeof data.tooltip === 'string' ? `<span class="tooltip">${data.tooltip}</span>` : ""}
                    </div>
                </div>
            `;
        } else {
            return `
                <input
                    data-ignorejson='${data.ignoreJson}'
                    type='${data.type}'
                    data-rowid="${rowId}"
                    class="p-0 defaultInput w100 ${this.getInputClass(data)}"
                    name='${data.name}'
                    readonly
                    value="${data.value ?? ""}"
                    data-modalvalue="${data.modalValue}"
                    ${data.required ? "required" : ""}
                >
            `;
        }
    }

    /**
     * Crea un input que además tiene un modal dentro de el.
     * Esto para no tener que hacer 1 boton y 1 input extra...
     */
    public createMixedInput(
        data: any,
        rowId: number,
        key: any,
        newItem: boolean,
        type: "DTMixture" | "FormMixture",
        columnId: number
    ) {
        return `
        <div
            class='${this.getColumClass(data)} pr-1 pl-1'
            ${this.getStyle(data)}
            data-columnid="${columnId}"
        >
            <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? "mb-3" : ""}">
                ${this.getLabel(data)}

                <div class="input-group">
                    <input
                        type='${data.type}'
                        data-rowid="${rowId}"
                        data-key='${key}'
                        class="p-0 defaultInput w100 ${this.getInputClass(data)}"
                        name='${data.name}'
                        readonly
                        value="${data.value ?? ""}"
                        data-modalvalue="${data.modalValue}"
                        style="border-right: 0;"
                        data-ignoreclick="true"
                        ${data.required ? "required" : ""}
                    >
                    <div class="input-group-append">
                        <button class="btn ${type == "DTMixture" ? "openModal" : "openBasicModal"} w100"
                            modalvalue="${data.modalValue}"
                            data-column="${data.name}"
                            name='${data.name}'
                            data-key="${key}"
                            data-rowid="${rowId}">
                            <i class="material-icons  ${type == "DTMixture" ? "openModalIconFix" : "openBasicModalIconFix"}">search</i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    /**
     * Crea un modal muy básico
     */
    public createBasicModal(data: any, rowId: number, key: any, newItem: boolean, columnId: number) {
        // Si el tipo de retorno es tipo mixture, hace algo muy similar al mixture de datatable
        if (data.modalReturnType === 'Mixture') {
            return `
            <div
                class='${this.getColumClass(data)} pr-1 pl-1'
                ${this.getStyle(data)}
                data-columnid="${columnId}"
            >
                <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? "mb-3" : ""}">
                    ${this.getLabel(data)}

                    <div class="input-group">
                        <input
                            type='${data.type}'
                            data-rowid="${rowId}"
                            data-key='${key}'
                            class="p-0 defaultInput w100 ${this.getInputClass(data)}"
                            name='${data.name}'
                            readonly
                            value="${data.value ?? ""}"
                            data-modalvalue="${data.modalValue}"
                            style="border-right: 0;"
                            data-ignoreclick="true"
                            ${data.required ? "required" : ""}
                        >
                        <div class="input-group-append">
                            <button class="btn openBasicModal openModalStyle w100"
                                modalvalue="${data.modalValue}"
                                data-column="${data.name}"
                                name='${data.name}'
                                data-key="${key}"
                                data-rowid="${rowId}">
                                <i class="material-icons openBasicModalIconFix">search</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        } else {
            return `
                <div class='${this.getColumClass(data)} pr-1 pl-1' data-columnid="${columnId}">
                    <button class="btn btn-detail openBasicModal w100"
                        data-column="${data.name}"
                        name="${data.name}"
                        data-rowid="${rowId}"
                        data-key="${key}" ${this.getStyle(data)}>
                        ${data.iconName
                    ? `<i class="material-icons btn-detail-icon">${data.iconName}</i>`
                    : ""
                }
                        ${data.alias}
                    </button>
                </div>
            `;
        }
    }

    /**
     * Crea un Botón dentro de un DetailView
     */
    public createBtn(data: any, key: string, columnId: number) {
        return `
            <div class='${this.getColumClass(data)} pr-1 pl-1' data-columnid="${columnId}">
                <button class=" btn btn-detail btn-function ${data.btnType} ${this.getInputClass(data)}"
                    name='${data.name}'
                    data-key='${key}'
                    alt='${data.alias}'
                    ${data.disabled ? "disabled" : ""}
                    ${this.getStyle(data)}>
                    ${data.iconName ? `<i class="material-icons btn-detail-icon">${data.iconName}</i>` : ""}
                    ${data.value.length > 0 ? data.value : data.alias}
                </button>
                ${typeof data.tooltip === 'string' ? `<span class="tooltip">${data.tooltip}</span>` : ""}
            </div>
        `;
    }

    /**
     * Crea un Select dentro de un DetailView
     */
    public async createSelect(data: any, orquesta: Orquesta) {
        return `
            <div class='${this.getColumClass(data)} pr-1 pl-1' data-columnId="${orquesta.columnId}">
                <div class="label-hover mt-1 ${typeof data.isarray === "undefined" ? "mb-3" : ""}">
                    ${this.getLabel(data)}

                    <select
                        name='${data.name}'
                        data-modalvalue="${data.modalValue}"
                        class="${this.getInputClass(data)}"
                        ${!orquesta.newItem || data.forceReadonly ? "disabled" : ""}
                        ${data.required ? "required" : ""}
                        ${data.readonly ? ' data-ignoreclick="true"' : ""}
                        >
                        ${await this.parseSelectOptions(data)}
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Crea un título dentro de un DetailView
     */
    public createTitle(data: any) {
        return `
            <div class='col-12 p-0 ${this.getColumClass(data)} ${data.titleCollapsed ? "mb-2" : ""}'>
                <h1 class="subtitleDetail detail-collapse" data-unhide="${data.titleUnHide}">
                    ${data.value}
                </h1>
                <div class="span-box"><i class="material-icons">expand_more</i></div>
            </div>
            <div class='row col-12 p-0 m-0 detail-container mb-2 ${data.titleCollapsed === true ? "hideDetailView hide" : ""}'>
        `;
    }

    /**
     * Crea una columna dentro de un DetailView
     */
    public createBootstrapColumn(data: any) {
        return `
            <div class='${data.columnClass}'>
        `;
    }


    /**
     * Crea un checkbox dentro de un DetailView
     */
    public createCheckBox(data: any, rowId: number, newItem: boolean, key: string, columnId: number, isAutomatic = false) {
        return `
            <div class='${!isAutomatic ? this.getColumClass(data) : 'w-100'} pr-1 pl-1' data-columnid="${columnId}">
                <div class="label-hover mt-1">
                    ${isAutomatic ? "" : this.getLabel(data)}

                    <input
                        type="checkbox"
                        class="custom-checkbox ${this.getInputClass(data)}"
                        name='${data.name}'
                        ${this.getCheckedState(data.value) ? "checked" : ""}
                        data-rowid="${rowId}"
                        data-modalvalue="${data.modalValue}"
                        data-checkedvalue="${data.checkedValue}"
                        data-uncheckedvalue="${data.uncheckedValue}"
                        data-checklabel="${data.checkLabel}"
                        data-unchecklabel="${data.uncheckLabel}"
                        data-checkclass="${data.checkClass}"
                        data-isautomatic="${isAutomatic}"
                        data-rendered="false"
                        data-key="${key}"
                        ${(!newItem || data.forceReadonly) && !isAutomatic ? "readonly" : ""}
                        >
                        ${typeof data.tooltip === 'string' ? `<span class="tooltip">${data.tooltip}</span>` : ""}
                </div>
            </div>
        `;
    }

    /**
     * Crea un subtitulo dentro de un DetailView
     */
    public createSubtitle(data: any) {
        return `
            <div class='col-12 p-0 ${this.getColumClass(data)}'>
                <h3 class="subtitleDetailh3"> ${data.value}</h3>
            </div>
        `;
    }

    public async orquestByType(orquesta: Orquesta): Promise<Object> {
        let htmlTmp = "";

        const data =
            orquesta.primary === null
                ? orquesta.detailData[orquesta.key]
                : orquesta.primary[orquesta.key];

        if (typeof data === 'undefined') {
            console.info("Undefined data in form");
            return;
        }

        switch (data.type) {
            case "select":
                htmlTmp += await this.createSelect(data, orquesta);
                break;

            case "file":
                htmlTmp += this.createFileInput(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.newItem,
                    orquesta.key,
                    orquesta.columnId,
                );
                break;

            case "checkbox":
                htmlTmp += this.createCheckBox(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.newItem,
                    orquesta.key,
                    orquesta.columnId,
                    false
                );
                break;

            case "DTMixture":
                htmlTmp += this.createMixedInput(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.key,
                    orquesta.newItem,
                    data.type,
                    orquesta.columnId
                );
                break;

            case "modal":
                htmlTmp += this.createBasicModal(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.key,
                    orquesta.newItem,
                    orquesta.columnId
                );
                break;

            case "button":
                htmlTmp += this.createBtn(data, orquesta.key, orquesta.columnId);
                break;

            case "textarea":
                htmlTmp += this.createTextArea(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.newItem,
                    orquesta.key,
                    orquesta.columnId
                );
                break;

            default:
                htmlTmp += this.createDefaultInput(
                    data,
                    orquesta.dataSource?.rowId ?? null,
                    orquesta.newItem,
                    orquesta.key,
                    orquesta.columnId,
                    false
                );
                break;

            case "title":
                htmlTmp +=
                    (orquesta.hasTitle ? `</div>` : "") +
                    this.createTitle(data);
                if (!orquesta.hasTitle) {
                    orquesta.hasTitle = true;
                }
                break;
            case "bootstrapColumn":
                htmlTmp +=
                    (orquesta.hasCol ? `</div>` : "") +
                    this.createBootstrapColumn(data);
                if (!orquesta.hasCol) {
                    orquesta.hasCol = true;
                }
                break;
            case "subtitle":
                htmlTmp += this.createSubtitle(data);
                break;

            case "detail":
                /* omite */ break;
        }

        return {
            html: htmlTmp,
            hasTitle: orquesta.hasTitle,
            hasCol: orquesta.hasCol
        };
    }

    /**
     * Pone un loader mientras el formulario termina de cargar
     * @param formClass: clase html a poner a cargar
     *
     * Si el formId no es nulo significa que viene de un modal por ende debemos buscarlo por ID.
     * de lo contrario lo buscamos por document.
     */
    setFormLoading(formId: string, formClass: any) {
        const parent: Document | HTMLElement = typeof formId === 'undefined' || formId === null ? document : document.getElementById(formId);

        formClass = parent.getElementsByClassName(formClass)[0];
        if (formClass === null || typeof formClass === 'undefined')
            return;
        formClass.innerHTML = this.#HTMLoader;
    }

    private getDetailView(form: HTMLForm) {
        let detailView: HTMLElement = null;
        const docIndx = (document.getElementsByClassName(form.formClass) as HTMLCollection).length - 1;

        if (typeof form.formId === "undefined") {
            detailView = document.getElementsByClassName(form.formClass)[docIndx] as HTMLElement;
        } else {
            const id = document.getElementById(form.formId);
            detailView = id.getElementsByClassName(form.formClass)[docIndx] as HTMLElement;
        }

        if (typeof detailView === 'undefined' || detailView === null || !detailView.classList.containsAny(formClasses)) {
            console.error(`
                [ERROR]: No se encontró la clase contenedora del detailView - te faltó:
                    <div class="formControl | formControlDetail(#)"></div>
            `);
            return null;
        }

        return detailView;
    }

    /**
     * Este es el método que crea un form
     * ---------------------------------------
     *
     * IMPORTANTE: NO ES UTILIZADO POR DATATABLESCOMPONENT
     * esto significa que puede ser modificado como se requiera
     * no va a afectar la integridad de data-tables
     *
     * ---------------------------------------
     * puede ser editado a discreción.
     * @param detailView HTMLElement de la vista
     * @param detailData la data que se presentará (Arreglo de HTMLInput's)
     *
     * @param append en vez de crear un formulario lo adjunta a uno existente.
     * @
     */
    public async createForm(form: HTMLForm, append = false) {
        /**
         * Hacemos un sleep de 200ms para que no confunda los documentos.
         */
        const sleep = await new Promise(resolve => setTimeout(resolve, 200));

        return new Promise(async (resolve: any) => {
            this.setFormLoading(form.formId, form.formClass);

            const detailView: HTMLElement = this.getDetailView(form);
            if (detailView === null)
                return;

            let hasTitle = false;
            let hasCol = false;
            let htmlText = "";
            const callForm = await form.formData.call(this);
            this.detailFormData = append === false ? callForm : Object.assign({}, this.detailFormData, callForm);
            const resp = await this.parseStandartResponse(callForm);

            if (typeof resp === 'undefined') {
                this.toastr.info("La presente tabla o formulario no presentan datos.", "Información");
                return;
            }

            for (const key of Object.keys(callForm)) {
                if (key === "rowId") {
                    continue;
                }
                /**
                 * Si no es un array manda un orquesta sencillo
                 * De lo contrario, crea una lista `${key}[${cont}].${subKey} donde:
                 *  key = nombre de la lista
                 *  cont = posicion automática en lista
                 *  subkey = detalle a almacenar
                 */
                if (!(callForm[key] instanceof Array)) {
                    const orquestra = await this.orquestByType({
                        orquestaType: "Form",
                        key: key,
                        dataSource: null,
                        hasTitle: hasTitle,
                        hasCol: hasCol,
                        primary: null,
                        newItem: true,
                        detailData: callForm,
                        columnId: null
                    }) ?? null;

                    if (orquestra === null) {
                        console.info('invalid orquestra type');
                    } else {
                        htmlText += orquestra.html;
                        hasTitle = orquestra.hasTitle;
                        hasCol = orquestra.hasCol;
                    }
                } else if (typeof callForm[key][0] !== "undefined") {
                    htmlText +=
                        '<div class="row col-12 text-center array-detail-row-title">';

                    // -- creamos la lista de columnas (labels)
                    for (const subKey of Object.keys(callForm[key][0])) {
                        if (callForm[key][0][subKey] === null || callForm[key][0][subKey].type === "hidden") {
                            continue;
                        }
                        htmlText += `
                            <div class='${this.getColumClass(callForm[key][0][subKey])} pr-1 pl-1'>
                                <label>${callForm[key][0][subKey].alias}</label>
                            </div>
                        `;
                    }
                    htmlText += `</div><div class="row array-detail-row pb-2 w100" style="max-height: ${form.formMaxHeight ?? '240px'};" data-list="${key}">`;
                    let cont = 0;
                    let columnId = 0;
                    for (const htmlInpt of callForm[key]) {
                        htmlText += `<div class="d-flex w100" data-list-position="${cont}">`;
                        for (const subKey of Object.keys(htmlInpt)) {
                            if (htmlInpt[subKey] === null) {
                                continue;
                            }

                            if (htmlInpt[subKey].type !== 'button' && htmlInpt[subKey].type !== 'modal') {
                                htmlInpt[subKey].alias = "";
                            }

                            htmlInpt[subKey].isarray = "true";
                            htmlInpt[subKey].name = `${key}[${cont}].${subKey}`;
                            const orquestra: any = await this.orquestByType({
                                orquestaType: "Form",
                                key: subKey,
                                dataSource: null,
                                hasTitle: hasTitle,
                                hasCol: hasCol,
                                primary: htmlInpt,
                                newItem: true,
                                detailData: callForm,
                                columnId: columnId
                            }) ?? null;
                            if (orquestra === null) {
                                console.error('invalid orquestra type');
                            } else {
                                htmlText += orquestra.html;
                                hasTitle = orquestra.hasTitle;
                                hasCol = orquestra.hasCol;
                            }
                            columnId++;
                        }
                        cont++;
                        htmlText += '</div>';
                    }
                    htmlText += "</div>";
                }
            }

            htmlText += `
                </div>
                ${hasTitle ? "</div>" : ""}
                ${hasCol ? "</div>" : ""}
            `;

            detailView.innerHTML = htmlText;
            detailView.classList.add(form.initialState ?? 'show');
            this.util.initSelect();
            this.util.initCheckBox();
            resolve("ok");
        });
    }

    /**
     * Retorna true si es una lista o false si no.
     * @param path
     */
    isList(path: string) {
        return path.includes('list');
    }

    /**
     * getRealPath: Devuelve la path real de un detailData si es una lista o no.
     * @param inp
     */
    getRealPath(key: string, inp: any, data: any) {
        let dData: any;

        if (typeof inp.name !== 'undefined' && this.isList(inp.name)) {
            const listName = inp.name.split("[")[0];
            const position = inp.name.split("[")[1].split("]")[0];
            const SElse = inp.name.split("[")[1].split("]")[1].trim().substring(1);
            return data[listName][position][SElse];
        } else {
            return data[key];
        }
    }

    /**
     * Retorna el valor de una llave de un DetailView
     * Esto ya que si se llama directo puede que no funcione
     * @param key llave a buscar
     * @param data si no tiene singifica que es un form, si tiene es una datatable
     *
     */
    getDetailValueOf(key: string, data = null) {
        let dData = null;
        if (data === null) {
            dData = this.getRealPath(key, { name: key }, this.detailFormData);
        } else {
            dData = this.getRealPath(key, { name: key }, data);
        }
        if (typeof dData === 'undefined') {
            console.error(`[SIAM]: ${key} return undefined (not found). please fix before continue`);
        }
        return dData;
    }

    /**
     * Resetea el valor de un objeto y su input asociado
     * puede llevar multiples llaves ejemplo nombre,apellido
     * el algoritmo limpiará ambas llaves...
     */
    cleanDetailValueOf(key: string, data = null) {
        const realData = data == null ? this.detailFormData : data;

        if (typeof realData !== 'undefined' && realData.length !== null) {
            if (!key.includes(',')) {
                this.__subCleanDetailValueOf(key, realData);
            } else {
                for (const k of key.split(',')) {
                    this.__subCleanDetailValueOf(k.trim(), realData);
                }
            }
        }
    }

    private __subCleanDetailValueOf(str: string, data) {
        const dData = this.getRealPath(str, { name: str }, data);

        if (typeof dData !== 'undefined' && dData !== null) {
            dData.value = null;
            (document.querySelectorAll(`input[name="${dData.name}"]`)[0] as HTMLInput).value = '';
        } else {
            console.error(`la llave: ${str} no es ha encontrado en la data de detalle, compruebe que existe esta.`);
        }
    }

    /**
     * setea un valor tanto al detaildata o detailformdata
     * y al visible.
     */
    setDetailValueOf(key: string, value: any, data = null) {
        const dData = this.getRealPath(key, { name: key }, data === null ? this.detailFormData : data);
        const ele: any = document.getElementsByName(dData?.name)[0];

        ele.value = ele.dataset.format === 'money' ? this.util.moneyFormat(value) : value;
        dData.value = value;
    }

    /**
     * retorna el nombre de la lista (list[9].codInx)
     * devolvería "list"
     * @param data
     */
    getListName(data: any) {
        if (!data.name.toString().includes('[')) {
            console.error('tratando de tomar una lista de un elemento que no lo es');
            return;
        }

        return data.name.split('[')[0];
    }

    /**
     * retorna el index de la lista (list[9].codInx)
     * devolvería "9"
     * @param data
     */
    getListIndex(data: any) {
        if (!data.name.toString().includes('[')) {
            console.error('tratando de tomar una lista de un elemento que no lo es: ');
            console.error('[DEBUG DATA]');
            console.error(data);
            return;
        }

        return data.name.match(new RegExp(/\[(.*)(?=\])/g))[0].substr(1);
    }

    /**
     * retorna el path de la lista (list[9].codInx)
     * devolvería ".codInx"
     * @param data
     */
    getListPath(data: any) {
        if (!data.name.toString().includes(']')) {
            console.error('tratando de tomar una lista de un elemento que no lo es');
            return;
        }

        return data.name.split(']')[1];
    }

    /**
     * A diferencia de data-table no ocupa verificar nada solo realizar el llamado
     * @param data
     */
    async parseBtnAction(data: any) {
        this.setButtonLoading(document.getElementsByName(data?.name)[0], true);
        await data.buttonService?.call(this, data);
        this.setButtonLoading(document.getElementsByName(data?.name)[0], false);
    }

    /**
     * El checkbox no es un un objeto de forms, por lo que debemos decirle cómo trabajar.
     * cuando le da click debemos actualizar el estado al estado opuesto al que está
     * además, debes llamar onChange.
     */
    async parseCheckboxAction(data: any) {
        if (data.value === "" || data.value === data.uncheckedValue) {
            data.value = data.checkedValue;
        } else {
            data.value = data.uncheckedValue;
        }

        return await data.onChange?.call(this, data);
    }

    /**
     * A diferencia de data-table no ocupa verificar nada solo realizar el llamado
     * @param data
     */
    async parseInputClickAction(data: any) {
        return await data.onClick?.call(this, data);
    }

    async openBasicModal(data: any, btn = null) {
        return await data.modalService?.call(this, data);
    }

    public closeCurrentModal(dialogRef: MatDialogRef<any, any>, ele: any, data: any) {
        const backdrop = (dialogRef as any)._overlayRef._backdropElement;
        const modal = (dialogRef as any)._overlayRef._backdropElement.nextElementSibling;

        modal.parentNode.removeChild(modal);
        backdrop.parentNode.removeChild(backdrop);

        data.modalServiceTable.ngOnDestroy();
        this.util.removeEventListener(ele, 'click');
    }

    /**
     * Parsea un form y lo devuleve ('formControl' por defecto)
     * detailView es únicamente para DataTables
     */
    getParsedForm(form2parce: formClassType | "detailView" = 'formControl') {
        if (!this.util.validateForm(`.${form2parce}`)) {
            const formData = this.util.getFormData(`.${form2parce}`);
            if (typeof this.reorderList !== 'undefined' && this.reorderList !== null && this.reorderList.length > 0) {
                this.reorderList.forEach((list: string, index: number) => {
                    if (typeof formData[list] === 'undefined' || formData[list] === null) {
                        this.reorderList.splice(index, 1);
                    } else {
                        formData[list] = formData[list].filter((el: any) => {
                            return el != null;
                        });
                    }
                });
            }
            return formData;
        } else {
            return "Campos vacíos obligatorios encontrados, por favor verifique";
        }
    }

    /**
     * Parsea un objeto rápido
     * si lo que quiere es enviar data de formularios o DetailView, puede hacerlo con
     * getParsedForm()
     */
    getParsedObject(obj: any) {
        return this.util.getObjectData(obj);
    }

    /**
     * quita el check de un checkbox sin hacer que se active el onChange del segundo checkbox.
     * debería ser utilizado únicamente cuando hay 2 checkbox y uno debe desmarcar el otro.
     * en cualquier otro uso, puede fallar, no ha sido probado.
     */
    uncheckBox(name: any) {
        const checkbox = this.getDetailValueOf(name);

        if (checkbox.value === checkbox.checkedValue) {
            checkbox.value = checkbox.uncheckedValue;
            document.getElementsByName(name)[1].children[0].children[0].innerHTML = "close";
            (document.getElementsByName(name)[1]).classList.remove(checkbox.checkClass);
            (document.getElementsByName(name)[0] as any).checked = !(document.getElementsByName(name)[0] as any).checked;
        }
    }

    /**
     * Marca un checkbox
     */
    checkBox(name: any) {
        const checkbox = this.getDetailValueOf(name);
        if (checkbox.value !== checkbox.checkedValue) {
            checkbox.value = checkbox.checkedValue;
            document.getElementsByName(name)[1].children[0].children[0].innerHTML = "done";
            (document.getElementsByName(name)[1]).classList.add(checkbox.checkClass);
            (document.getElementsByName(name)[0] as any).checked = !(document.getElementsByName(name)[0] as any).checked;
        }
    }

    /**
     * Cambia el selector de un htmlinput: type:select
     */
    updateSelect(name: string, newVal: any) {
        const select = this.getDetailValueOf(name);
        if (newVal !== null && typeof newVal !== 'undefined' && select.value !== newVal) {
            this.setDetailValueOf(name, newVal);

            document.getElementsByName(name)[0].nextElementSibling.childNodes[1].nodeValue =
                (document.getElementsByName(name)[0].children[newVal] as any).innerText ?? 'no encontrado';
        }
    }

    /**
     * Pone un boton en modo cargando
     * retorna el boton Original
     * @param load true setloading
     * false = retorna a la normalidad
     */
    setButtonLoading(btn: any, load: boolean) {
        return new Promise((resolve) => {
            if (btn == null)
                return;

            if (load) {
                btn.disabled = true;
                btn.tmp = btn.innerHTML;
                btn.innerHTML = '<i class="material-icons btn-detail-icon rotating">sync</i>';
                btn.dataset.isloading = true;
                btn.style.cursor = 'not-allowed';
                resolve(btn);
            } else {
                btn.innerHTML = btn.tmp;
                btn.disabled = false;
                btn.dataset.isloading = false;
                btn.style.cursor = 'pointer';
            }
            resolve('ok');
        });
    }


    /**
     * Evalua si es un form (true) o si es otra cosa (false)
     * @param inp
     */
    private isFormControl(inp: any): boolean {
        this.toastr.clear();

        for (const formClass of formClasses) {
            if (inp.closest(`.${formClass}`) !== null && typeof inp.closest(`.${formClass}`) !== 'undefined') {
                return true;
            }

        }

        return false;
    }

    /**
     * setDetailValueOf trabajan de diferente forma, pero realizan la misma acción.
     * @param inp
     */
    onFormChange(inp: any) {
        if (!this.isFormControl(inp)) {
            return;
        }

        let dData = this.getRealPath(inp.name, inp, this.detailFormData);
        if (typeof dData !== 'undefined' && dData !== null) {
            dData['value'] = inp.value;
        }

        dData.onChange?.call(this, dData);
    }

    /**
     * Simulate the @Hostlistener input event
     */
    onFormInput(inp: any) {
        if (!this.isFormControl(inp)) {
            return;
        }

        if (typeof inp.dataset.isfilter !== 'undefined') {
            /**
             * Son filtro de input[type='select'], no deben ser escuchados
             */
            return;
        }

        if (typeof inp.dataset.validatenumber !== 'undefined') {
            const lastChar = inp.value.substr(inp.value.length - 1, inp.value.length);

            /**
             * valida la tecla presionada para saber si es un número numeros
             * (0-9)|\.|\, => RAGEXE
             */
            if (isNaN(lastChar) && !(lastChar as string).in([',', '.', '-'])) {
                inp.value = inp.value.substr(0, inp.value.length - 1);
                this.toastr.warning(`El campo: <b>${inp.dataset.label}</b>, debe ser numérico. (<b>${lastChar}</b>): no se reconoce como un número.`, 'Información');
            }
        }

        let dData = this.getRealPath(inp.name, inp, this.detailFormData);
        if (typeof dData !== 'undefined' && dData !== null) {
            dData['value'] = inp.value;
        }

        dData.onChange?.call(this, dData);
    }

    /**
     * Cambia de posición el click dentro de una lista en forms
     */
    onFormKeypress(key: KeyboardEvent) {
        if (!key.target || !this.isFormControl(key.target)) {
            return;
        }

        if (key.code === 'Tab') {
            this.resetClickedElement();
        }

        if (!key.code.in(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']))
            return;

        if (this.#listItemClicked && this.isList(this.#listItemClicked.name)) {
            const listName = this.getListName(this.#listItemClicked);
            const listIndx = parseInt(this.getListIndex(this.#listItemClicked), 10);
            const listPath = this.getListPath(this.#listItemClicked);

            if (key.code === "ArrowDown" || key.code === "ArrowUp") {
                const next = `${listName}[${(listIndx + 1)}]${listPath}`;
                const prev = `${listName}[${(listIndx - 1)}]${listPath}`;

                const n = document.getElementsByName(key.keyCode === 40 ? next : prev)[0];
                if (typeof n !== 'undefined') {
                    this.toastr.clear();
                    this.#isClickByList = true;
                    n.click();
                }
            } else if (key.code === "ArrowLeft" || key.code === "ArrowRight") {
                const curr = `${listName}[${(listIndx)}]${listPath}`;
                const ele = document.getElementsByName(curr)[0];

                /**
                 * Filtramos los elementos del arreglo que no tenan columnid (hidden) y los checkbox
                 * ya que estos se comportan de manera "extraña" los sacamos de la funcionalidad.
                 */
                const arrEle = Array.from(document.getElementsByName(curr)[0].offsetParent.parentElement.children)
                    .filter((ele: any) => ele.dataset.columnid >= 0 &&
                        !ele.children[0]?.children[0]?.classList.contains('custom-checkbox'));

                const currId = (arrEle.indexOf(ele.offsetParent));
                const next = arrEle[currId + 1];
                const prev = arrEle[currId - 1];

                let n = (key.keyCode === 39 ? next : prev);

                if (typeof n !== 'undefined') {
                    this.toastr.clear();
                    n = n.getElementsByTagName('input')[0];

                    this.#isClickByList = true;
                    (n as HTMLElement)?.click();
                }

            }
        }
    }

    /**
     * los inputs con formato se resetean por medio de esta función
     */
    resetClickedElement() {
        if (this.#clickedFormElement !== null && typeof this.#clickedFormElement !== 'undefined') {
            if (this.#clickedFormElement.dataset.format === 'money') {
                this.#clickedFormElement.value = this.util.moneyFormat(this.#clickedFormElement.value);
                this.#clickedFormElement = null;
            }
        }
    }

    /**
     * Recibee un input name y devuelve el archivo asociado.
     * En ngSIAM no trabajamos con FormData, sin embargo para archivos
     * no es posible trabajarlo sin ello.
     * @param inputName tag "name" del input a buscar
     * @param position devuelve la posición del archivo subido, por defecto 0
     * @returns un FormData
     */
    getFileUploadedByName(inputName: string, position = 0) : FormData {
        const fileBlob = (document.getElementsByName(inputName)[0] as HTMLInputElement).files[position];
        console.log(fileBlob);
        const formData = new FormData();
        formData.append('file', fileBlob);
        return formData;
    }


    /**
     * Simulate the @Hostlistener click event
     */
    onFormClick(inp: any) {
        this.resetClickedElement();

        if (!this.isFormControl(inp)) {
            return;
        }

        this.toastr.clear();

        const fixClass = [
            "openModalIconFix",
            "openBasicModalIconFix",
            "btn-detail-icon",
            "btnDownElementFix",
            "btnUpElementFix",
            "btnHabilitaEdicionFix",
            "btnGuardarEdicionFix",
            "btnNuevoRegistroFix",
            "span-box"
        ];

        if (fixClass.some((className) => inp.classList.contains(className))) {
            inp = inp.parentElement;
        }

        if (inp.classList.contains("checkSelectedFix")) {
            inp = inp.parentElement.parentElement;
        }

        const inpcls = inp.classList;

        switch (true) {
            case inpcls.contains("openFormModal"):
                console.error("[SIAM]: Los formularios (Forms) no soportan el tipo de dato DTMixture (Data Tables Mixture), en su lugar use un tipo 'modal' con la propiedad modalReturnType tipo mixture con un ModalComponent asociado");
                console.error("[SIAM]: Puede utilizar presupuesto/aprobacione/ajuste-requisiciones como ejemplo");
                break;
            case inpcls.contains("openBasicModal"):
                this.openBasicModal(this.getRealPath(inp.dataset.key, inp, this.detailFormData), inp);
                break;

            case inpcls.contains("onInputClick"):
                this.#listItemClicked = inp;
                inp.focus();
                this.parseInputClickAction(this.getRealPath(inp.dataset.key, inp, this.detailFormData));

                if (inp.dataset.format === 'money') {
                    inp.value = this.util.onlyNumbers(inp.value);
                    this.#clickedFormElement = inp;
                }
                break;

            case (inpcls.contains('defaultInput') && inp.dataset.format === 'money'):
                inp.value = this.util.onlyNumbers(inp.value);
                this.#clickedFormElement = inp;
                break;

            case inpcls.contains("detail-collapse"):
                this.collapseTab(inp);
                break;

            case inpcls.contains("btn-function"):
                this.parseBtnAction(this.getRealPath(inp.dataset.key, inp, this.detailFormData));
                break;

            case inpcls.contains("check-selected"):
                this.parseCheckboxAction(this.getRealPath(inp.dataset.key, inp, this.detailFormData));
                break;
        }
    }

    /**
     * Muestra un módulo vacío
     */
    emptyDataSet() {
        return {
            title: new HTMLInput({
                type: 'title',
                value: 'Información general'
            }),
            text: new HTMLInput({
                value: 'No hay datos para procesar',
                columnClass: 'col-12',
                forceReadonly: true
            }),
        }
    }

    /**
     * genera una lista vacía de datos
     */
    setListMinLenght(list: Array<any>, len: number) {
        const realLen = list.length;
        if (list.length < len) {
            for (let i = 0; i < (len - realLen); i++) {
                list.push([]);
            }
        }
    }

    /**
     * Elimina todas las opciones de un HTMLInput type select
     * @param key
     */
    deleteAllSelectOptions(key: string) {
        const select: any = document.getElementsByName(key)[0];

        while (select.options.length > 0) {
            select.remove(0);
        }

        const selectOpt = select.nextElementSibling.nextElementSibling as HTMLElement;
        while (selectOpt.firstChild) {
            selectOpt.removeChild(selectOpt.lastChild);
        }
        select.nextElementSibling.innerText = "";
    }

    /**
     * Agrega opciones a un HTMLInput type select sin tener que recargar la página
     */
    selectAddOptions(key: string, arr: Array<Array<string | number >>) {
        const select: any = document.getElementsByName(key)[0];

        arr.forEach((subArr: [any, string]) => {
            const option: any = document.createElement("OPTION");
            option.innerHTML = subArr[1];
            option.value = subArr[0];
            select.options.add(option);

            const selectOpt = select.nextElementSibling.nextElementSibling as HTMLElement;
            const div = document.createElement('div');
            div.innerHTML = subArr[1];
            this.util.addEventListener(div, 'click', this.util.eventListenerSelectOptions);

            selectOpt.appendChild(div);
        });
    }
}
