import {
    Component, ViewChild, EventEmitter, Output, ElementRef, ViewEncapsulation,
    ChangeDetectionStrategy, TemplateRef, Input, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Utils } from '../../Utils/Util';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { fadeAnimation, detailExpand } from 'src/app/Utils/Helpers/animation';
import { HTMLInput } from '../../Utils/Interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { Forms } from '../forms/Forms';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

/**
 * Interface de la Meta Data de la columna,
 * se emplea para no necesitar múltiples arreglos
 */
export interface ColumnInfo {
    id: string;
    name: string;
    hidden: boolean;
    type: string;
    format: string;
}

@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeAnimation, detailExpand],
})
export class DataTableComponent implements OnDestroy {

    /**
     * Almacena la funcion que llena la tabla, para recargarla.
     */
    callback: any;

    newItemFunction: any = null;

    /**
     * Determina si la tabla está cargando o no
     */
    private isLoading = true;

    /**
     * Es el DataSource de la tabla
     */
    dataSource = new MatTableDataSource<any>([]);

    /**
     * Este almacena la información de la consulta de detalle (DetailView).
     */
    detailData: any;

    /**
     * Guarda la Meta data de las columnas, se usa para la creación de las columnas en la tabla
     */
    columnInfo: ColumnInfo[] = [];

    /**
     * Almacena la información del Modal llamado para evitar memory leaks
     * Me parece que debo revisarlo...
     */
    private modalServiceSingleton: any[] = [];


    /**
     * Detail view animate of data table component
     * FALSE: Cierra el DetailView
     * TRUE: Abre el DetailView
     * Ambos con animación
     */
    detailViewAnimate = false;

    /**
     * Almacena los TimesOut que deben ser destruidos manualmente (garbage collector no lo hace)
     */
    private createTableTimeOut: any;
    private reloadDetailViewTimeOut: any;

    /**
     * Almacena el elemento que está siendo clickeado, para realizar acciones varias...
     */
    private clickedElement: any = null;

    /**
     * Los @Output (EMMITERS)
     * Son eventos que la tabla enviará  y el componente que llamó a la tabla escuchará
     * por medio de alguna función propia del usuario
     * -- Sirven para transmitir datos entre elementos
     *
     * saveRowEmitter guarda items existentes
     * saveNewRowEmitter guarda nuevos items
     */
    @Output() doubleClickRowEmitter: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() saveRowEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveNewRowEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() keyDownUpDownEmmitter: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Los @Input (GETTERS)
     * Caso contrario de los EMMITERS, serán aquellos que escuchen peticiones del componente
     * que está inicializando la tabla, en este caso declaramos que si no está SETTEADO en el componente,
     * lo declare @TRUE por defecto
     */
    @Input() newItemVisible = true;
    @Input() deleteItemVisible = true;
    @Input() exportVisible = true;
    @Input() filterVisible = true;
    @Input() detailViewBottom = false;
    @Input() filterByDate = false;

    /**
     * Para identificar o diferenciar si es un DataTable nativo o un DT de un modal.
     * Es importante ya que si es un modal se comporta de manera diferente,
     * esto nos ayuda a diferenciarlos y decirle al componente cómo trabajar.
     */
    @Input() DTTitle = 'DataTable';

    /**
     * Los @ViewChild (document.getElementBy...)
     * Son observadores de elementos internos de la estructura de la tabla
     */
    @ViewChild(MatTable) table: MatTable<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('modalEelement') modalEelement: TemplateRef<any>;
    @ViewChild(DataTableComponent) modalServiceTable: DataTableComponent;

    // Se encarga de almacenar la información de los Check Box en el HTML
    selection = new SelectionModel(true, []);

    // Almacena el rowId abierto actualmente en un DetailData
    _currentRowId: number;

    /**
     * Almacena la lista de columnas que pueden ser filtradas
     * si son nula filtra todas.
     */
    column2sort: Array<String> = null;


    constructor(
        public elementRef: ElementRef,
        public util: Utils,
        public forms: Forms,
        public toastr: ToastrService,
        public dialog: MatDialog,
        public appRef: ChangeDetectorRef) {
        {
            this.util.addEventListener(document, "click", (e) => {
                e.preventDefault();
                this.onClick(e.target);
            });

            this.util.addEventListener(document, "input", (e) =>
                this.onInput(e.target)
            );

            this.util.addEventListener(document, "change", (e) =>
                this.onMouseLeave(e.target)
            );

            this.util.addEventListener(document, "keydown", (e) =>
                this.onKeyDown(e)
            );

            this.util.addEventListener(document, "customSelectChange", (e) =>
                this.onSelectChange(e.target), true
            );
        }
    }



    async onSelectChange(inp: any) {
        let data: any;

        if (inp.closest("app-data-table") === null) {
            return;
        }

        if (inp.dataset.isautomatic === "true") {
            // si el input es generado automáticamente significa que fue creado por una datatable
            // por lo que debemos buscarlo en e datasource, de lo contrario se debe buscar en el detail Data
            data = this.dataSource.data[inp.dataset.rowid];
        } else {
            data = this.detailData;
        }

        let dData = this.forms.getRealPath(inp.name, inp, data);

        if (typeof dData !== 'undefined' && dData !== null) {
            dData['value'] = inp.value;
        }
        await dData.onChange?.call(this, dData);
    }


    /**
     * MEMORY LEAK FIX
     * las siguientes variables deben ser limpiadas manualmente.
     * NO ELIMINAR NADA.
     */
    ngOnDestroy(): void {

        /**
         * Eliminamos las referencias creadas por angular
         */
        this.dataSource.data = [];
        this.dataSource.filteredData = [];

        this.paginator.ngOnDestroy();
        this.sort.ngOnDestroy();
        this.table.dataSource = [];
        this.table.ngOnDestroy();


        clearTimeout(this.createTableTimeOut);
        clearTimeout(this.reloadDetailViewTimeOut);
        clearTimeout(this.forms.collapseTabTimeOut);

        if (this.DTTitle !== 'modal') {
            this.util.removeAllEventListener(['click']);
            this.DTTitle = null;
            this.toastr.clear();
        }

        /**
         * Anteriormente limpiabamos manualmente las referencias (lo dejaremos para evitar conflictos)
         * con el metodo de abajo:
         *  - Limpiamos el DataSource de la tabla
         *  - Limpiamos los sobrantes de la tabla
         *  - Recorremos cada propiedad y la seteamos en null.
         *  - Elinamos la referencia al objeto
         *  - Finalmente limpiamos el __proto__ que es el que almacena la memoria de las funciones.
         *
         * Con esto logramos que el Shallow Size del Heap Memory baje significativamente, y deje de ocacionar memory leaks.
         */

        for (const property in (this.dataSource as any)) {
            this.dataSource[property] = null;
            delete this.dataSource[property];
        }

        for (const property in (this.table as any)) {
            this.table[property] = null;
            delete this.table[property];
        }

        for (const property in this) {
            this[property] = null;
            delete this[property];
        }

        this['__proto__'] = null;
    }

    set loading(load: boolean) {
        this.isLoading = load;
    }

    get loading(): boolean {
        return this.isLoading;
    }

    set currentRowId(indx: number) {
        this._currentRowId = indx;
    }

    get currentRowId(): number {
        return this._currentRowId;
    }

    /**
     * Inicia las configuraciones necesarias para que el módulo trabaje de manera óptima
     */
    initConfig(response: any[]): boolean {
        if (response === null || typeof response === 'undefined' || response.length === 0) {
            this.isLoading = false;
            this.appRef.detectChanges();
            return false;
        }

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;

        return true;
    }

    /**
     * Crea el encabezado (Información fundamental de las columnas)
     */
    private createColumnInfo(response: any[]) {
        this.forms.reorderList = [];
        this.columnInfo = [];

        for (const key of (Object.keys(response[0]))) {
            if (response[0][key].type === 'title') {
                continue;
            }

            if (response[0][key].type !== 'detail') {
                this.columnInfo.push({
                    id: key,
                    name: response[0][key].alias ?? key,
                    hidden: response[0][key].hidden ?? false,
                    type: response[0][key].type,
                    format: response[0][key].format
                });
            } else {
                this.columnInfo.push({
                    id: response[0][key].type,
                    name: '+ Info.',
                    hidden: false,
                    type: response[0][key].type,
                    format: ""
                });
            }
        }

        this.forms.parseStandartResponse(response);
    }

    public reloadAppRef() {
        this.appRef.detectChanges();
    }

    /**
     * Recarga los datos de la tabla (vuelve a realizar la consultas al backend)
     * Utilizada cuando se guarda un registro y se quiere actualizar la tabla.
     */
    reloadTable() {
        return new Promise((resolve: any) => {
            this.isLoading = true;
            if (this.createTableTimeOut) {
                clearTimeout(this.createTableTimeOut);
            }

            this.dataSource = new MatTableDataSource<any>([]);
            this.columnInfo = [];
            this.createTable();
            this.closeDetailView();
            this.forms.reorderList = [];
            resolve("ok");
        });
    }

    /**
     * trata Recarga el detail View, con la vista abierta actualmente
     */
    reloadDetailView() {
        if (this.reloadDetailViewTimeOut) {
            clearTimeout(this.reloadDetailViewTimeOut);
        }

        this.reloadDetailViewTimeOut = setTimeout(() => {
            this.findDetailAndHandle(this.currentRowId, 0);
        }, 2000);
    }

    /**
     * Crea la tabla de una manera asíncrona para que no interfiera con el
     * rendimiento general de la página
     * @param callback llama a una función (llenado de datos) del componente.
     * @param columnsSort Arreglo con las columnas que pueden ser sorteadas,
     *      null por defecto (todas las columnas pueden ser sorteadas)
     */
    async createTable(callback: any = null, columnsSort: Array<String> = null) {
        if (callback !== null && typeof callback !== 'undefined') {
            this.callback = callback;
        }
        if (columnsSort !== null && typeof columnsSort !== 'undefined') {
            this.column2sort = columnsSort;
        }
        return new Promise((resolve: any) => {
            this.createTableTimeOut = setTimeout(async () => {
                await this.handleData(await this.callback?.call());
                resolve('ok');
            }, 1000);
        });
    }

    /**
     * Método que inicializa la acción de la tabla
     * @param response data traida desde un await
     * @param cols son las columnas en plano
     */
    async handleData(response: any[]) {
        if (typeof response === 'undefined') {
            return;
        }

        if (typeof this.initConfig !== 'function')
            return;

        if (!this.initConfig(response)) {
            response = [{
                titulo: new HTMLInput({
                    type: 'text',
                    alias: 'Atención',
                    value: 'La presente tabla no cuenta con información para mostrar.',
                    columnClass: 'text-center',
                })

            }];
        }

        this.dataSource.data = response;
        this.createColumnInfo(this.dataSource.data);
        response = null;

        this.dataSource.filterPredicate = (data: any, filter: string) => {

            const listAsFlatString = (obj: object): string => {
                let returnVal = '';

                Object.values(obj).forEach((val) => {
                    if (val?.filterValue !== null && (typeof val.filterValue === 'string' || typeof val.filterValue === 'number')) {
                        returnVal += ' ' + val.filterValue;
                    } else if (val?.value !== null && (typeof val.value === 'string' || typeof val.value === 'number')) {
                        returnVal += ' ' + val.value;
                    }
                });

                return returnVal.trim().toLowerCase();
            };

            return listAsFlatString(data).includes(filter);
        };

        this.dataSource.sortingDataAccessor = (data, header) => {
            if (data[header]?.type === 'text' && data[header]?.value) {
                return data[header]?.value;
            } else if (data[header]?.type === 'checkbox' && data[header]?.filterValue) {
                return data[header]?.filterValue;
            }
        };
    }

    /**
     * Aplica filtro sobre la tabla
     * @param filterValue String del input
     */
    applyFilter(filterValue: string) {
        this.detailViewAnimate = false;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        setTimeout(() => {
            this.util.initCheckBox();
        }, 100);
    }

    /**
     * Método propio del Drag-n-Drop
     */
    columnMenuDropped(event: CdkDragDrop<any>): void {
        moveItemInArray(this.columnInfo, event.item.data.columnIndex, event.currentIndex);
    }

    /**
     * Método propio del Drag-n-Drop
     */
    toggleSelectedColumn(columnId: string) {
        const colFound = this.columnInfo.find(col => col.id === columnId);
        colFound.hidden = !colFound.hidden;
    }

    /**
     * devuelve las columnas mostradas (no escondidas)
     */
    getDisplayedColumns(): string[] {
        if (this.columnInfo != null) {
            return this.columnInfo.filter(cd => !cd.hidden).map(cd => cd.id);
        }
    }

    /**
     * Acciona el evento doble click en una tabla
     */
    handeDobleClickRow($event: any, dataSource: any) {
        $event.preventDefault();
        this.doubleClickRowEmitter.emit(dataSource);
    }

    /**
     * Elimina objetos innecesarios de la memoria, que no tienen importancia para
     * el desarrollador.
     */
    parseColumns(): string[] {
        const fakeRows = JSON.parse(JSON.stringify(this.dataSource.data));

        for (const ele of JSON.parse(JSON.stringify(this.dataSource.data))) {
            for (const key of Object.keys(ele)) {
                switch (ele[key]?.type) {
                    case 'detail':
                    case 'modal':
                    case 'title':
                        delete (ele[key]);
                        break;
                    default:
                        ele[key] = typeof ele[key].value === 'undefined' ? '' : ele[key].value;
                        break;
                }
            }
        }
        return fakeRows;
    }

    /**
     * Hace un pequeño highlight para detectar qué (columna,row) se está presionando.
     */
    tdHighlight($ev: any) {
        const removeAll: HTMLCollection = document.getElementsByClassName('tdHighLight');
        const eleState: boolean = ($ev.target.dataset.tdclick === 'true');

        [].forEach.call(removeAll, ($el: any) => {
            $el.classList.remove('tdHighLight');
        });
        if (!eleState) {
            $ev.target.classList.add('tdHighLight');
        }
        $ev.target.dataset.tdclick = !eleState;
    }

    /**
     * Determina el valor de un input
     */
    getValue(element: any) {
        if (typeof element === 'undefined')
            return;
        else if (element.type !== 'select') {
            return this.forms.getValue(element);
        } else {
            const opts = element.selectService?.call();
            if (opts === null) {
                console.error('Un select debe tener un selectService asociado');
                return element.value;
            }

            for (const opt of opts) {
                if (typeof element.value !== 'undefined' && element.value !== null
                    && opt[0] === element.value) {
                    return opt[1];
                }
            }

            return element.value;
        }
    }

    getInputDetail(dataSource: any) {
        for (const key of Object.keys(dataSource) as any) {
            if (typeof dataSource[key].detailService !== 'undefined' && dataSource[key].detailService !== null) {
                return dataSource[key];
            }
        }
        return null;
    }

    /**
     * Cambia los íconos de las flechas de las columnas para saber el posicionamiento (asc, desc)
     */
    sortEvent($ev = null) {
        if ($ev !== null) {
            const icon =
                $ev.target.localName === 'button' ?
                    $ev.target.childNodes[0].childNodes[0] :
                    $ev.target as HTMLElement;

            const allThIcons = document.querySelectorAll(`th .${icon.classList[0]}`) as NodeListOf<HTMLElement>;


            allThIcons.forEach((thIcon: HTMLElement) => {
                if (thIcon.dataset.colid !== icon.dataset.colid) {
                    thIcon.innerHTML = 'unfold_more';
                }
            });

            switch (icon.innerHTML) {
                case 'unfold_more': icon.innerHTML = 'keyboard_arrow_up'; break;
                case 'keyboard_arrow_up': icon.innerHTML = 'keyboard_arrow_down'; break;
                case 'keyboard_arrow_down': icon.innerHTML = 'unfold_more'; break;
            }
        }
    }


    findDetailAndHandle(rowId: number, opt: number) {
        const data = this.dataSource.data[rowId + opt];
        if (typeof data === 'undefined' || data === null) {
            this.toastr.warning('No hay más elementos en la tabla', 'Alerta');
            return;
        }

        for (const key of Object.keys(data)) {
            if (data[key].type === 'detail') {
                this.openDetailInfoExtended(data, false);
                break;
            }
        }
    }


    /**
     * Realiza la apertura del boton de modal
     * @param dataSource recibe el objeto propio de la tabla
     * @param column valor de la columna
     */
    openModal(column: string) {
        if ((document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement)?.innerText.trim() === 'lock_open') {
            this.toastr.warning('Debe habilitar la edición antes de utilizar el botón.', 'Error');
            return;
        }

        let dData = this.forms.getRealPath(column, { name: column }, this.detailData);

        if (dData.modalService === null || typeof dData.modalService === 'undefined') {
            console.error('un DTMixture debe tener un servicio de modal "modalService" asociado');
            return;
        }

        const dialogRef = this.dialog.open(this.modalEelement, {
            width: dData.modalWidth + 'px',
            id: 'noselect',
            restoreFocus: true,
        });

        dialogRef.afterOpened().subscribe(async r => {
            this.modalServiceSingleton = await dData.modalService.call(this, dData);

            if (this.modalServiceSingleton === null || typeof this.modalServiceSingleton === 'undefined') {
                this.dialog.closeAll();
                this.modalServiceSingleton = null;
                return;
            }

            this.appRef.detectChanges();

            this.modalServiceTable.elementRef.nativeElement.setAttribute('column', column);
            this.modalServiceTable.handleData(this.modalServiceSingleton);
        });
    }

    private __subModalEventReciver($ev: any, ele: any) {
        if (typeof ele.modalValue !== 'undefined'
            && ele.modalValue !== null
            && typeof $ev[ele.modalValue] !== 'undefined') {
            ele.value = $ev[ele.modalValue].value;

            (document.querySelector(`input[data-modalvalue="${$ev[ele.modalValue].name}"]`) as HTMLInput).value =
                $ev[ele.modalValue].value;

            if (ele.onChange !== null) {
                ele.onChange.call(this, ele);
            }
        }
    }

    openBasicModal(column: string) {
        if ((document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement)?.innerText.trim() === 'lock_open') {
            this.toastr.warning('Debe habilitar la edición antes de utilizar el botón.', 'Error');
            return;
        }

        return this.forms.openBasicModal(column);
    }

    /**
     * Este es un método único de la clase (privado)
     * aquí realiza la lógica para asignar un modal a inputs.
     * @param $event recibe el objeto seleccionado
     */
    public modalEventReciver($ev: any) {

        Object.keys(this.detailData).forEach(key => {
            if (this.detailData[key] instanceof Array) {
                this.detailData[key].forEach((ele: any) => {
                    Object.keys(ele).forEach(subKey => {
                        this.__subModalEventReciver($ev, ele[subKey]);
                    });
                });
            } else {
                this.__subModalEventReciver($ev, this.detailData[key]);
            }
        });
        this.dialog.closeAll();
    }

    async parseBtnAction(data: any) {
        if ((document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement)?.innerText.trim() === 'lock_open') {
            this.toastr.warning('Debe habilitar la edición antes de utilizar el botón.', 'Error');
            return;
        }

        return this.forms.parseBtnAction(data);
    }

    async parseInputClickAction(data: any) {
        if (data.onClick === null) {
            return;
        }

        if (!data.clickOnLock && (document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement)?.innerText.trim() === 'lock_open') {
            this.toastr.warning('Debe habilitar la edición antes de utilizar el botón.', 'Error');
            return;
        }
        return await data.onClick?.call(this, data);
    }

    async parseCheckboxAction(data: any) {
        if ((document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement)?.innerText.trim() === 'lock_open') {
            this.toastr.warning('Debe habilitar la edición antes de utilizar el botón.', 'Error');
            return;
        }

        if (data.value === "" || data.value === data.uncheckedValue) {
            data.value = data.checkedValue;
        } else {
            data.value = data.uncheckedValue;
        }

        return await data.onChange?.call(this, data);
    }

    /**
     * Cierra el detailView y devuelve dicho elemento.
     */
    resetDetailView() {
        const detailView = document.getElementsByClassName('detailView')[0] as HTMLElement;
        if (this.detailViewAnimate) {
            this.detailViewAnimate = false;
            this.appRef.detectChanges();
        }
        detailView.innerHTML = '';

        return detailView;
    }

    /**
     * Devuelve el boton de detalle de una fila, si no lo encuentra devuelve null
     */
    getBtnDetalle(dataSource: any): any {
        const btnDetalle = this.getInputDetail(this.dataSource.data[dataSource.rowId]);
        if (btnDetalle === null) {
            this.toastr.error('Esta tabla no presenta informaci&oacute; detallada - reportar a T.I.', 'Error');
            return null;
        }
        return btnDetalle;
    }

    /**
     * Setea el detailData
     *
     * devuelve el detailView y el boton de detalle
     * @param dataSource
     * @param newItem
     */
    async setDetailData(dataSource: any, newItem: boolean): Promise<Array<any>> {
        const detailView = this.resetDetailView();
        let btnDetalle = null;
        if (!newItem) {
            btnDetalle = this.getBtnDetalle(dataSource);
            if (btnDetalle === null || typeof btnDetalle === 'undefined') {
                return;
            } else {
                this.detailData = await btnDetalle.detailService?.call(this, btnDetalle);
            }
        } else {
            this.detailData = dataSource;
        }
        return [detailView, btnDetalle];
    }



    /**
     * Es el orquestador PRINCIPAL de la creación del DetailView
     * el dice cómo se renderiza todos los elementos y el orden
     * newItem:
     *  TRUE: nuevo item
     *  FALSE: Edita item
     */
    async openDetailInfoExtended(dataSource: any, newItem: boolean) {
        if (typeof dataSource === 'undefined')
            return;

        const btn = document.querySelector(`button.btn-extended-detail[data-rowid="${dataSource.rowId}"]`);
        this.forms.setButtonLoading(btn, true);
        this.forms.reorderList = [];
        this.util.removeEventListener(document.getElementById('onClickCloseDetailInfo'), 'click');

        const returnData = await this.setDetailData(dataSource, newItem);
        if (typeof returnData === 'undefined' || typeof this.detailData === 'undefined') {
            console.error('[SIAM]: El Data table no presenta detailService válido, reportar a T.I.');
            return;
        }

        const detailView = returnData[0];
        const btnDetalle = returnData[1];

        this.forms.parseStandartResponse(this.detailData);

        this.currentRowId = dataSource.rowId;

        let hasTitle = false;
        let hasCol = false;
        let htmlText = this.forms.createDetailToolBar(this.detailData, dataSource.rowId, newItem);

        for (const key of Object.keys(this.detailData)) {
            if (key === 'rowId') {
                continue;
            }

            if (!(this.detailData[key] instanceof Array)) {
                const orquestra = await this.forms.orquestByType({
                    orquestaType: 'Data Table',
                    key: key,
                    dataSource: dataSource,
                    hasTitle: hasTitle,
                    hasCol: hasCol,
                    primary: null,
                    newItem: newItem,
                    detailData: this.detailData,
                    columnId: null
                });
                htmlText += orquestra.html;
                hasTitle = orquestra.hasTitle;
                hasCol = orquestra.hasCol;

            } else if (typeof this.detailData[key][0] !== 'undefined') {
                htmlText += `<div class="row col-12 text-center array-detail-row-title">`;
                // -- creamos la lista de columnas (labels)
                for (const subKey of Object.keys(this.detailData[key][0])) {
                    if (this.detailData[key][0][subKey].type === 'hidden') {
                        continue;
                    }
                    htmlText += `
                        <div class='${this.forms.getColumClass(this.detailData[key][0][subKey])} pr-1 pl-1'>
                            <label>
                                ${this.detailData[key][0][subKey].alias}
                                ${this.detailData[key][0][subKey].alias !== '' &&
                            this.detailData[key][0][subKey].required === true ? '<span style="color:red"> *</span>' : ''}
                            </label>
                        </div>
                    `;
                }

                htmlText += `</div><div class="row array-detail-row pb-2 w100" data-list="${key}">`;
                let cont = 0;
                let columnId = 0;
                for (const htmlInpt of this.detailData[key]) {
                    htmlText += `<div class="d-flex w100" data-list-position="${cont}">`;
                    for (const subKey of Object.keys(htmlInpt)) {
                        if (htmlInpt[subKey].type !== 'button') {
                            htmlInpt[subKey].alias = "";
                        }
                        htmlInpt[subKey].isarray = 'true';
                        htmlInpt[subKey].name = `${key}[${cont}].${subKey}`;
                        const orquestra: any = await this.forms.orquestByType({
                            orquestaType: 'Data Table',
                            key: subKey,
                            dataSource: dataSource,
                            hasTitle: hasTitle,
                            hasCol: hasCol,
                            primary: htmlInpt,
                            newItem: newItem,
                            detailData: this.detailData,
                            columnId: columnId
                        });
                        htmlText += orquestra.html;
                        hasTitle = orquestra.hasTitle;
                        hasCol = orquestra.hasCol;
                        columnId++;
                    }
                    cont++;
                    htmlText += '</div>';
                }
                htmlText += '</div>';
            }
        }

        htmlText += `
            </div>
            ${hasTitle ? "</div>" : ""}
            ${hasCol ? "</div>" : ""}
        `;

        detailView.innerHTML = htmlText;
        this.detailViewAnimate = true;
        this.util.initSelect();
        this.util.initCheckBox();

        if (btnDetalle !== null && btnDetalle.afterCall !== null) {
            await btnDetalle.afterCall?.call();
        }
        this.forms.setButtonLoading(btn, false);

        this.appRef.detectChanges();
        this.util.addEventListener(document.getElementById('onClickCloseDetailInfo'), 'click', () => {
            this.detailViewAnimate = false;
            this.appRef.detectChanges();
        });
    }

    /**
     * Genera el llamado del click de un boton en una DataTable
     */
    async clickOnTableBtn(ev: any, rowData: any) {
        return await ev.buttonService?.call(this, ev, this.getParsedObject(rowData));
    }

    getCheckboxState(row: any) {
        return (row['value'] === true || row['value'] === 'S') ? true : false;
    }

    /**
     * Emitter para realizar una acción con el botón
     */
    async handleNewItemBtn() {
        if (this.newItemFunction === null || typeof this.newItemFunction === 'undefined') {
            this.toastr.info("La pantalla no presenta la capacidad de incluir un nuevo elemento, o un error ha sido encontrado", "Información");
            return;
        }

        await this.openDetailInfoExtended(await this.newItemFunction.call(), true);
    }

    /**
     * Es el botón que habilita la edición de los campos para posteriormente ser guardados.
     * @NOTA : Las llaves primarias no deberían ser editadas por usuarios, por su parte,
     * deberán pedir el cambio a T.I.
     */
    btnHabilitarEdicion() {
        const detailViewInputs = document.querySelectorAll('.detailView input, .detailView select');
        const boton = document.getElementsByClassName('btnHabilitaEdicion')[0] as HTMLElement;
        let isVisible: any = null;

        for (let i = 0; i < detailViewInputs.length && !isVisible; i++) {
            if ((detailViewInputs[i] as any).dataset.modalvalue === 'null') {
                isVisible = detailViewInputs[i];
                break;
            }
        }

        if (boton.textContent.trim() === "lock_open" && (isVisible.disabled === true || isVisible.readOnly === true)) {
            boton.innerHTML = '<i class="material-icons d-flex btnHabilitaEdicionFix">lock</i>';
            detailViewInputs.forEach((element: any) => {
                // Las llaves primarias y los datos de modales; el usuario no las puede editar.
                if (element.dataset.modalvalue === 'null'
                    && element.dataset.ignoreclick !== 'true') {
                    element.removeAttribute('readonly');

                    if (element.tagName === 'SELECT') {
                        // los select trabaja con disabled
                        element.disabled = false;
                        element.parentElement.getElementsByClassName('select-disabled')[0]?.classList.remove('select-disabled');
                    } else if (element.type === 'checkbox') {
                        element.parentElement.getElementsByClassName('check-disabled')[0]?.classList.remove('check-disabled');
                    }
                }
            });
        } else {
            boton.innerHTML = '<i class="material-icons d-flex btnHabilitaEdicionFix">lock_open</i>';
            detailViewInputs.forEach((element: any) => {
                if (element.dataset.ignoreclick !== 'true') {
                    element.readOnly = true;
                }
                if (element.tagName === 'SELECT') {
                    element.disabled = true;
                    element.parentElement.getElementsByClassName('select-selected')[0]?.classList.add('select-disabled');
                } else if (element.type === 'checkbox') {
                    element.parentElement.getElementsByClassName('check-selected')[0]?.classList.add('check-disabled');
                }
            });
        }
    }

    /**
     * Llama al getailValueOf de forms
     * donde se desarrolla toda la lógica
     */
    getDetailValueOf(key: string) {
        return this.forms.getDetailValueOf(key, this.detailData);
    }

    setDetailValueOf(key: string, value: any) {
        return this.forms.setDetailValueOf(key, value, this.detailData);
    }

    /**
     * Resetea el valor de un objeto y su input asociado
     * puede llevar multiples llaves ejemplo nombre,apellido
     * el algoritmo limpiará ambas llaves...
     */
    cleanDetailValueOf(key: string) {
        return this.forms.cleanDetailValueOf(key, this.detailData);
    }

    /**
     * En forms retorna todos los elementos,
     * por obvios motivos en DataTables solo retorna el detailView.
     *
     * Si lo que se desea es tomar es los datos de la DataTable (convertidos en JSON) debe utilizar getParsedDataTable().
     */
    getParsedForm() {
        return this.forms.getParsedForm('detailView');
    }

    /**
     * a diferencia de getParsedForm, este parsea los campos del Data Table (nativo), no del detailView.
     * Si lo que desea es obtener los datos del DetailView (el boton de Detail) debe utilizar getParsedForm().
     */
    getParsedDataTable(): Array<any> | any {
        const dot = this.util.getDotObject();

        const arr = new Array();

        let dataTable = this.dataSource.data;

        /**
         * Si la tabla esta filtrada, utilice solo los datos filtrados...
         */
        if (this.dataSource.filteredData.length > 0)
            dataTable = this.dataSource.filteredData;

        Array.from(dataTable).forEach((row: any) => {
            const obj = Object.create(null);
            for (const key in row) {
                if (row[key].ignorejson === 'true' || row[key].ignorejsonsilence === 'true') {
                    continue;
                }

                if (row[key].name === '') {
                    console.info('[REVISAR]: Un elemento cuya propiedad "name" este vacía será omitida del objeto.');
                    console.info('Para efectos del sistema no tiene sentido que el name esté vacío, elimínelo o bien arregle el error');
                    console.info(row[key]);
                    continue;
                }

                if (typeof row[key].name === 'undefined' || row[key].type === 'detail')
                    continue;

                switch (row[key].format) {
                    case 'money':
                        row[key].value = this.util.onlyNumbers(row[key].value.toString());
                        break;
                }

                obj[row[key].name] = row[key].type === 'number' ? parseInt(row[key].value, 10) : row[key].value;
            }
            arr.push(obj);
        });

        return dot._object(arr);
    }

    /**
     * Parsea un objeto rápido
     * si lo que quiere es enviar data de formularios o DetailView, puede hacerlo con
     * getParsedForm()
     */
    getParsedObject(obj: any) {
        return this.forms.getParsedObject(obj);
    }


    /**
     * Transforma los campos editados en un objeto para ser mandado al backend.
     * si se eliminó una fila de una lista (deleteRow()) debe reacomodar los campos.
     *
     */
    btnGuardarEdicion() {
        const parsedForm = this.forms.getParsedForm('detailView');
        if (!(typeof parsedForm === 'string')) {
            this.saveRowEmitter.emit(parsedForm);
        } else {
            this.toastr.warning('Campos vacíos obligatorios encontrados, por favor verifique', 'Campos faltantes');
        }
    }

    btnGuardarNewItem() {
        if (!this.util.validateForm('.detailView')) {
            this.saveNewRowEmitter.emit(this.util.getFormData('.detailView'));
        }
    }

    /**
     * elimina una linea de una lista de elementos
     */
    deleteRow(data: any) {
        const listName = data.name.split('[')[0];
        const rowId = data.name.match(new RegExp(/\[(.*)(?=\])/g))[0].substr(1);
        const listSize = document.querySelectorAll(`[data-list="${listName}"] [data-list-position]:not([data-list-position="${rowId}"])`).length;


        if (listSize !== 0) {
            delete this.detailData[listName][rowId];
            document.querySelectorAll(`[data-list="${listName}"] [data-list-position="${rowId}"]`).forEach(e => e.parentNode.removeChild(e));
            this.forms.reorderList.pushIfNotExist(listName);
        } else {
            /**
             * no se puede eliminar el último elemento de una lista
             * en cambio hay que simular que se elimina la linea
             */
            for (const key of (Object.keys(this.detailData[listName][rowId]))) {
                const ele = this.detailData[listName][rowId][key];

                if (ele.type !== 'hidden') {
                    ele.value = null;
                }
            }
            const selector = document.querySelector(`[data-list="${listName}"] [data-list-position="${rowId}"]`);
            selector.classList.add('mustHide');

            selector.querySelectorAll('input').forEach(e => {
                if (e.type !== 'hidden') {
                    e.value = '';
                }

                /**
                 * data-ignorejsonsilence es para que no mande al backend el elemento escondido
                 * Y para no confundirlo con el ignoreJson normal
                 */
                e.setAttribute('data-ignorejsonsilence', 'true');
            });
        }
    }

    getLastRow(listName: string, lastPosition: number): [Element, number] {
        const lastRow = document.querySelector(`[data-list="${listName}"] [data-list-position="${lastPosition}"]`);

        if (lastRow !== null) {
            return [lastRow, lastPosition];
        } else {
            return this.getLastRow(listName, lastPosition - 1);
        }
    }

    /**
     * Crea una linea nueva a partir de la última fila agregada (siempre debe haber una linea disponible).
     * se prueba el regex para la creación de listas en: https://regex101.com/r/fE9lR9/21
     *
     * no creo que sea necesario insertar la nueva linea en el detailData
     * ya que al final el detailData es para descomprimir a HTML y aquí ya se hizo.
     * @param listName
     */
    newRow(listName: any) {

        const newPosition = this.detailData[listName].length;
        let lastPosition = newPosition - 1;

        const l = document.querySelectorAll(`[data-list="${listName}"] [data-list-position]`);
        if (l.length === 1 && l[0].classList.contains('mustHide')) {
            const selector = document.querySelector(`[data-list="${listName}"] [data-list-position]`);
            selector.classList.remove('mustHide');
            selector.querySelectorAll('input').forEach(e => e.removeAttribute('data-ignorejsonsilence'));
            return;
        }

        const lastRow = this.getLastRow(listName, lastPosition)[0];
        lastPosition = this.getLastRow(listName, lastPosition)[1];

        const newRow: any = lastRow.cloneNode(true);

        newRow.setAttribute('data-list-position', newPosition);

        newRow.querySelectorAll('input, button').forEach((ele: any) => {
            ele.setAttribute('data-rowid', newPosition);
            ele.setAttribute('name', ele.name.replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`));
            if (ele.hasAttribute('data-modalvalue')) {
                ele.setAttribute('data-modalvalue', ele.getAttribute('data-modalvalue').replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`));
            }
            if (ele.hasAttribute('modalvalue')) {
                ele.setAttribute('modalvalue', ele.getAttribute('modalvalue').replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`));
            }
            if (ele.hasAttribute('data-column')) {
                ele.setAttribute('data-column', ele.getAttribute('data-column').replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`));

            }
            ele.setAttribute('value', '');
        });

        this.detailData[listName][newPosition] = this.util.deepCopy(this.detailData[listName][lastPosition]);

        for (const key of (Object.keys(this.detailData[listName][newPosition]))) {
            const ele = this.detailData[listName][newPosition][key];
            if (ele.modalValue !== null) {
                ele.modalValue = ele.modalValue.replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`);
            }

            if (ele.modalService !== null) {
                ele.modalService = (ele.modalService as Function).clone();
            }

            ele.name = ele.name.replace(new RegExp(/\[(.*?)\]/g), `[${newPosition}]`);

            if (ele.type !== 'hidden') {
                ele.value = null;
            }
        }

        lastRow.parentElement.append(newRow);
    }

    /**
     * Retorna el nombre de la lista en que se encuentra el objeto
     */
    getListName(data: any) {
        return this.forms.getListName(data);
    }

    /**
     * Retorna el index de la lista en que se encuentra
     */
    getListIndex(data: any) {
        return this.forms.getListIndex(data);
    }

    /**
     * Los elemntos input dentro de una DT se crean y se mandan al forms con un flag:
     * isAutomatic: true (el dt los creo automáticamente).
     */
    public createDefaultInput(data: any, rowId: any, newItem: boolean, key: any) {
        this.dataSource.data[rowId][key] = data;

        return this.forms.createDefaultInput(data, rowId, newItem, key, 0, true);
    }

    public createCheckBox(data: any, rowId: any, newItem: boolean, key: string) {
        this.dataSource.data[rowId][key] = data;
        this.dataSource.data[rowId][key].uncheckLabel = '';
        this.dataSource.data[rowId][key].checkLabel = '';

        const check = this.forms.createCheckBox(data, rowId, newItem, key, 0, true);
        const pageLen = Math.min(this.dataSource.data.length - 1, this.dataSource.paginator.pageSize - 1);
        const rowIndex = rowId < 10 ? rowId : rowId - (this.dataSource.paginator.pageSize * this.dataSource.paginator.pageIndex);

        if (pageLen === rowIndex) {
            setTimeout(() => {
                this.util.initCheckBox();
            }, 100);
        }
        return check;
    }

    /**
     * los inputs con formato se resetean por medio de esta función
     */
    resetClickedElement() {
        if (this.clickedElement !== null && typeof this.clickedElement !== 'undefined') {
            if (this.clickedElement.dataset.format === 'money') {
                this.clickedElement.value = this.util.moneyFormat(this.clickedElement.value);
                this.clickedElement = null;
            }
        }
    }

    /**
     * Cuando se teclea en un input hay que actualizar los datos en el detailData
     * admite campos name básicos como lista.
     * Un ejemplo de una lista sería:
     *  consolelog(this.DataTableComponent.getDetailValueOf(`list[${indx}].id.monto`));
     */
    onInput(inpt: any) {
        let data: any;

        if (inpt.classList.contains('inputSearch') || inpt.closest("app-data-table") === null) {
            return;
        }

        this.toastr.clear();

        if (inpt.dataset.isautomatic === "true") {
            // si el input es generado automáticamente significa que fue creado por una datatable
            // por lo que debemos buscarlo en e datasource, de lo contrario se debe buscar en el detail Data
            data = this.dataSource.data[inpt.dataset.rowid];
        } else {
            data = this.detailData;
        }

        const dData = this.forms.getRealPath(inpt.name, inpt, data);

        if (typeof dData !== 'undefined' && dData !== null) {
            dData.value = inpt.value;
        }
    }

    /**
     * este se ejecuta cuando cambia un valor de un input.
     * si el valor se mantiene no se ejecutará la acción
     * @param inpt
     */
    async onMouseLeave(inpt: any) {
        let data: any;

        if (inpt.classList.contains('inputSearch') || inpt.closest("app-data-table") === null) {
            return;
        }

        this.toastr.clear();
        const inptcls = inpt.classList;


        if (inpt.dataset.isautomatic === "true") {
            // si el input es generado automáticamente significa que fue creado por una datatable
            // por lo que debemos buscarlo en e datasource, de lo contrario se debe buscar en el detail Data
            data = this.dataSource.data[inpt.dataset.rowid];
        } else {
            data = this.detailData;
        }


        switch (true) {
            case (inptcls.contains('defaultInput')):
                let dData = this.forms.getRealPath(inpt.name, inpt, data);
                return await dData.onChange?.call(this, dData);
        }
    }

    onKeyDown(e: any) {
        if (e.target.closest("app-data-table") === null) {
            return;
        }
        if (e.keyCode == 9) { // tab
            this.resetClickedElement();
        }

        /**
         * pasa a la línea siguiente o anterior de una lista de valores.
         */
        if (e.target.classList.contains("onInputClick") && (e.keyCode === 40 || e.keyCode === 38) && this.forms.isList(e.target.name)) {
            const listName = this.getListName(e.target);
            const listIndx = parseInt(this.getListIndex(e.target), 10);
            const listPath = this.forms.getListPath(e.target);
            const next = `${listName}[${(listIndx + 1)}]${listPath}`;
            const prev = `${listName}[${(listIndx - 1)}]${listPath}`;

            const n = document.getElementsByName(e.keyCode === 40 ? next : prev)[0];

            if (typeof n !== 'undefined') {
                this.toastr.clear();
                n.click();

                this.keyDownUpDownEmmitter.emit({
                    oldTarget: e.target,
                    newTarget: n
                });
            }
        }
    }

    onClick(btn: any) {
        let data = this.detailData;

        if (btn.closest("app-data-table") === null) {
            return;
        }

        this.toastr.clear();

        const fixClass = ['openModalIconFix', 'btn-detail-icon', 'btnDownElementFix', 'btnUpElementFix', 'btnHabilitaEdicionFix',
            'btnGuardarEdicionFix', 'btnNuevoRegistroFix', "span-box"];

        if (btn.classList.contains('label-hover')) {
            btn = btn.getElementsByClassName('openModal')[0] ?? null;
        } else if (fixClass.some(className => btn.classList.contains(className))) {
            btn = btn.parentElement;
        } else if (btn.classList.contains("checkSelectedFix")) {
            btn = btn.parentElement.parentElement;
        }
        const btncls = btn.classList;

        this.resetClickedElement();

        if (btn.dataset.isautomatic === "true") {
            // si el input es generado automáticamente significa que fue creado por una datatable
            // por lo que debemos buscarlo en e datasource, de lo contrario se debe buscar en el detail Data
            data = this.dataSource.data[btn.dataset.rowid];
        }

        switch (true) {
            case (btncls.contains('openModal')):
                this.openModal(btn.dataset.column);
                break;
            case btncls.contains("openBasicModal"):
                this.openBasicModal(this.forms.getRealPath(btn.dataset.key, btn, data));
                break;
            case (btncls.contains('btnHabilitaEdicion')):
                this.btnHabilitarEdicion();
                break;

            case (btncls.contains('btnGuardarEdicion')):
                this.btnGuardarEdicion();
                break;

            case (btncls.contains('btn-function')):
                this.parseBtnAction(this.forms.getRealPath(btn.dataset.key, btn, data));
                break;

            case btncls.contains("onInputClick"):
                btn.focus();
                this.parseInputClickAction(this.forms.getRealPath(btn.dataset.key, btn, data));

                if (btn.dataset.format === 'money') {
                    btn.value = this.util.onlyNumbers(btn.value);
                    this.clickedElement = btn;
                }
                break;

            case (btncls.contains('btnDownElement')):
                this.findDetailAndHandle(parseInt(btn.dataset.rowid, 10), 1);
                break;

            case (btncls.contains('btnUpElement')):
                this.findDetailAndHandle(parseInt(btn.dataset.rowid, 10), -1);
                break;

            case (btncls.contains('btnNuevoRegistro')):
                this.btnGuardarNewItem();
                break;

            case (btncls.contains('detail-collapse')):
                this.forms.collapseTab(btn);
                break;

            case (btncls.contains('defaultInput') && btn.dataset.format === 'money'):
                btn.value = this.util.onlyNumbers(btn.value);
                this.clickedElement = btn;
                break;

            case btncls.contains("check-selected"):
                this.parseCheckboxAction(this.forms.getRealPath(btn.dataset.key, btn, data));
                break;
        }
    }

    /**
     * Cierra el DetailView completo!
     * Si lo que se desea es cerrar un tab, es con collapseTab
     */
    closeDetailView() {
        this.detailViewAnimate = false;
        this.appRef.detectChanges();
    }

    /**
     * genera una lista vacía de datos
     */
    setListMinLenght(list: Array<any>, len: number) {
        return this.forms.setListMinLenght(list, len);
    }

    selectAddOptions(key: string, arr: Array<Array<string | number>>) {
        return this.forms.selectAddOptions(key, arr);
    }



    deleteAllSelectOptions(key: string) {
        return this.forms.deleteAllSelectOptions(key);
    }

}
