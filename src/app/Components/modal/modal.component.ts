import { Component, ViewChild, TemplateRef, Input, AfterViewInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataTableComponent } from '../data-table/data-table.component';
import { formClassType, HTMLInput, formClasses } from '../../Utils/Interfaces';
import { Forms } from '../forms/Forms';
import { Utils } from 'src/app/Utils/Util';

export interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: 'app-modal',
    template: `
        <ng-container *ngIf="this.createButtonAutomatically">
            <button  class="btn w100" type="button" (click)="openModal($event, null, 'formControlDetail')" data-open-modal="true">
                <mat-icon>open_in_new</mat-icon> {{modalText}}
            </button>
        </ng-container>

        <!-- ng-template es un componente digamos "escondido" esperando alguna instrucción -->
        <ng-template #modalEelement>
            <div id="{{this.id}}">
                <div class="closeContainer">
                    <button mat-mini-fab class="modal-close-btn" matDialogClose="no">
                        <i class="material-icons">close</i>
                    </button>
                </div>
                <ng-container *ngIf="modal.modalReturnType === 'Data Table' || modal.modalReturnType === 'Mixture'">
                    <h2 matDialogTitle>Seleccione un elemento con doble clic</h2>

                    <app-data-table (doubleClickRowEmitter)="modalEventReciver($event)" [newItemVisible]="false" [DTTitle]="'modal'"
                        [deleteItemVisible]="false" [filterVisible]="false" [exportVisible]="false">
                    </app-data-table>
                </ng-container>
                <ng-container *ngIf="modal.modalReturnType === 'Forms'">
                    <ng-container *ngFor="let clazz of modalClasses">
                        <div class="{{clazz}} modalform b-0"></div>
                    </ng-container>

                </ng-container>
            </div>
        </ng-template>
    `
})
export class ModalComponent implements AfterViewInit, OnDestroy {

    @ViewChild('modalEelement', { read: TemplateRef, static: true }) modalEelement: TemplateRef<any>;
    @ViewChild(DataTableComponent) modalServiceTable: DataTableComponent;

    /**
     * Almacena la información del Modal llamado para evitar memory leaks
     */
    private modalServiceSingleton: any[] = [];

    /**
     * HTMLInput de tipo modal
     * que ejecutará el proceso
     */
    @Input() modal: HTMLInput = null;
    @Input() id: string = null;

    /**
     * Para questiones de Forms. crear el boton automáticamente no es una opción
     *  así que debemos descativarla.
     */
    @Input() createButtonAutomatically = true;

    /**
     * Event emmitter
     */
    @Output() modalOnDblClickEmmiter: EventEmitter<any> = new EventEmitter<any>();


    /**
     * Almacena el título del Modal (alias)
     */
    modalText = 'Modal';

    /**
     * Almacena el evento que propagó la acción
     */
    caller = null;

    /**
     * Almacenamos las clases predeterminadas del sistema
     * para poder utilizarlas en modales
     */
    modalClasses = formClasses;

    constructor(
        public dialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        public util: Utils,
        public formsModal: Forms
    ) {}

    ngAfterViewInit(): void {
        if (typeof this.modal !== 'undefined' && this.modal?.alias !== '') {
            this.modalText = this.modal.alias;
            this.cdRef.detectChanges();
        }
    }

    ngOnDestroy() {
        // falta...
        this.modalOnDblClickEmmiter = null;
        this.modalServiceSingleton = null;
        this.cdRef = null;
        this.modal = null;
        this.modalOnDblClickEmmiter = null;
        this.modalText = null;
        this.modalEelement = null;
        this.dialog = null;
    }

    /**
     * Este es un método único de la clase (privado)
     * aquí realiza la lógica para asignar un modal a inputs.
     * @param $event recibe el objeto seleccionado
     */
    public modalEventReciver($ev: any) {
        this.modalOnDblClickEmmiter.emit(this.parseColumns($ev));
        // simulamos un click a cerrar
        (((document.getElementById(this.id)).getElementsByClassName('modal-close-btn'))[0] as any).click();
    }

    public closeModal() {
        (((document.getElementById(this.id)).getElementsByClassName('modal-close-btn'))[0] as any).click();
    }

    /**
     * Realiza la apertura del boton de modal
     * Retorna un Promise (esto por si se requiere hacer un .then() para realizar otra acción)
     *
     * @param dataSource recibe el objeto propio de la tabla
     * @param event es el elemento que ha llamado esta funcion
     * @param formControlClass la clase de modal a la que debemos insertar los datos.
     * @param forceReload por defecto un modal se carga en cache para multiples clicks, sin embargo, algunas pantallas necesitan que el modal se cargue desde 0 siempre.
     */
    async openModal(
        dataSource: (cntxt?: any) => any,
        event: any,
        formControlClass: formClassType = 'formControlDetail',
        forceReload = false) {

        if (this.id === null) {
            console.error('Un modal debe tener la propiedad [id] para poder trabajar correctamente');
            return;
        }

        const btn = document.querySelector(`button[name="${event.name}"]`);
        await this.formsModal.setButtonLoading(btn, true);
        setTimeout(async () => {

            /**
             * Debemos poner un timeOut para que el boton
             * pueda bloquearse y no permita clickear 2 veces de la manera correcta.
             * cabe recordar que un tiemout no es necesario limpiarlo.
             */
            const parsedDS = this.util.deepCopy(await dataSource.call(this));
            if (typeof parsedDS === 'undefined') {
                await this.formsModal.setButtonLoading(btn, false);
                return;
            }

            return new Promise((resolve: any) => {
                if (this.modal === null || typeof this.modal === 'undefined') {
                    console.error('Modal Object null / undefined - se espera un HTMLModal; revisar modal.component.ts (linea 60 aprox.)');
                    return;
                }

                let dialogRef = this.dialog.open(this.modalEelement, {
                    width: this.modal.modalWidth + 'px' ?? '500px',
                    maxHeight: '90vh',
                    restoreFocus: true
                });

                dialogRef.afterOpened().subscribe(async r => {
                    if (this.modal.modalReturnType === 'Data Table' || this.modal.modalReturnType === 'Mixture') {
                        if (this.modalServiceSingleton.length === 0 || forceReload) {
                            this.modalServiceSingleton = parsedDS;
                        }

                        this.modalServiceTable?.elementRef.nativeElement.setAttribute('rowId', parsedDS.rowId);
                        this.caller = event;

                        // La data, si ya se cargó anteriormente para poder ser procesada, debe ser enviada como copia.
                        // baja el tiempo de carga..
                        this.modalServiceTable?.handleData(JSON.parse(JSON.stringify(this.modalServiceSingleton)));
                        dialogRef = null;
                    } else if (this.modal.modalReturnType === 'Forms') {
                        this.formsModal.createForm({
                            formClass: formControlClass,
                            formData: async () => await parsedDS,
                            formId: this.id
                        }, true);
                    }

                    resolve("ok");
                    this.formsModal.setButtonLoading(btn, false);
                });
            });
        }, 200);
    }

    /**
     * Elimina objetos innecesarios de la memoria, que no tienen importancia para
     * el desarrollador.
     */
    parseColumns($ev: any): string[] {
        const fakeRows = JSON.parse(JSON.stringify($ev));

        Object.keys(fakeRows).forEach(key => {
            if (typeof fakeRows[key] !== 'undefined' && typeof fakeRows[key] === 'object') {
                switch (fakeRows[key].type) {
                    case 'text':
                    case 'date':
                        if (typeof fakeRows[key].value === 'undefined') {
                            fakeRows[key] = '';
                        } else {
                            fakeRows[key] = fakeRows[key].value;
                        }
                        break;
                }
            }
        });

        fakeRows['caller'] = this.caller;

        return fakeRows;
    }
}
