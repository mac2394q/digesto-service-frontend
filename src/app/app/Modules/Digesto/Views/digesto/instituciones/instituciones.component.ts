import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-instituciones',
    template: `
  <h2>Informaci&oacute;n de instituciones</h2>
  <app-data-table [newItemVisible]="true" (saveRowEmitter)="updateInstitucion($event)" (saveNewRowEmitter)="saveInstitucion($event)"></app-data-table>
`
})
export class InstitucionesComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoInstituciones());
        

        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nueva Institucion',
                    titleUnHide: true
                }),
                NOMBRE: new HTMLInput({
                    type: 'text',
                    alias: 'Nombre de la institución',
                    columnClass: "col-6",
                    required: true
                }),
                NOMBRE_CONTACTO: new HTMLInput({
                    type: 'text',
                    alias: 'Nombre de Contacto',
                    columnClass: "col-4",
                    required: true
                }),
                TELEFONO: new HTMLInput({
                    type: 'text',
                    alias: 'Número de Teléfono',
                    columnClass: "col-2",
                    required: true
                }),

            };
        }


    }

    async loadInfoInstituciones() {
        const dTable: any[] = [];
        const data = await this.apiRest.getInstitucionAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({

                CODIGO_INSTITUCION: new HTMLInput({
                    alias: 'Código',
                    value: ele["CODIGO_INSTITUCION"]
                }),
                NOMBRE: new HTMLInput({
                    alias: 'Nombre de la institución',
                    value: ele["NOMBRE"]
                }),
                NOMBRE_CONTACTO: new HTMLInput({
                    alias: 'Nombre del Contacto',
                    value: ele["NOMBRE_CONTACTO"]
                }),
                TELEFONO: new HTMLInput({
                    alias: 'Número de Teléfono',
                    value: ele["TELEFONO"]
                }),
                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoInstituciones(ele["CODIGO_INSTITUCION"])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoInstituciones(codigo) {

        const data = await this.apiRest.getInstitucionDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información Institucion'
            }),

            CODIGO_INSTITUCION: new HTMLInput({
                value: dataBody["CODIGO_INSTITUCION"],
                columnClass: 'col-3',
                required: true,
                alias: 'Código',
                readonly: true,
                forceReadonly: true,

            }),
            NOMBRE: new HTMLInput({
                value: dataBody["NOMBRE"],
                columnClass: 'col-9',
                required: true,
                alias: 'Nombre de la institución'
            }),
            NOMBRE_CONTACTO: new HTMLInput({
                value: dataBody["NOMBRE_CONTACTO"],
                columnClass: 'col-4',
                required: true,
                alias: 'Nombre del Contacto'
            }),
            TELEFONO: new HTMLInput({
                value: dataBody["TELEFONO"],
                columnClass: 'col-3',
                required: true,
                alias: 'Número de Teléfono'
            }),

            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-2',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteInstitucion(dataBody["CODIGO_INSTITUCION"]),
            }),
        };
    }

    deleteInstitucion($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteInstitucion($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    updateInstitucion($ev: any) {

        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.updateInstitucion($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveInstitucion($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.saveInstitucion($ev).toPromise();
        this.DataTableComponent.reloadTable();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }


}

