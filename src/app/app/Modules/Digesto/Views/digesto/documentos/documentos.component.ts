import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';
import { formatDate, getLocaleDateTimeFormat } from '@angular/common';


@Component({
    selector: 'app-documentos',
    template: `
  <h2>Informaci&oacute;n de documentos</h2>
  <app-data-table [newItemVisible]="true" (saveRowEmitter)="updateDocumento($event)" (saveNewRowEmitter)="saveDocumento($event)"></app-data-table>
`
})
export class DocumentosComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoDocumentos());




        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nuevo Documento',
                    titleUnHide: true
                }),

                TITULO: new HTMLInput({
                    type: 'text',
                    alias: 'Título',
                    columnClass: "col-6",
                    required: true
                }),
                CODIGO: new HTMLInput({
                    type: 'text',
                    alias: 'Codigo de documento',
                    columnClass: "col-3",
                    required: true
                }),
                NUMERO_OFICIO: new HTMLInput({
                    type: 'text',
                    alias: 'Número de oficio',
                    columnClass: "col-3",
                    required: true
                }),
                WEB: new HTMLInput({
                    type: 'text',
                    alias: 'Enlace Web',
                    columnClass: "col-6",
                    required: true
                }),
                UBICACION_DOCUMENTOS: new HTMLInput({
                    type: 'file',
                    alias: 'Ruta almacenamiento',
                    columnClass: "col-6",
                    required: true
                }),
                FECHA_EMISION: new HTMLInput({
                    type: "date",
                    alias: 'Fecha de emisión',
                    columnClass: "col-6",
                    required: true
                }),
                CODIGO_INSTITUCION: new HTMLInput({
                    type: 'select',
                    selectService: () => this.getInstitucion(),
                    columnClass: "col-3",
                    required: true,
                    alias: 'Código de institución'
                }),
                CODIGO_SUBTEMA: new HTMLInput({
                    type: 'select',
                    selectService: () => this.getSubTemas(),
                    columnClass: "col-3",
                    required: true,
                    alias: 'Código sub tema'
                }),
            };
        }


    }

    async loadInfoDocumentos() {
        const dTable: any[] = [];
        const data = await this.apiRest.getDocumentosAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({


                CODIGO: new HTMLInput({
                    alias: 'Codigo documento',
                    value: ele["CODIGO"]
                }),

                NUMERO_OFICIO: new HTMLInput({
                    alias: 'Número de oficio',
                    value: ele["NUMERO_OFICIO"]
                }),

                TITULO: new HTMLInput({
                    alias: 'Titulo',
                    value: ele["TITULO"]
                }),

                NUMERO_VERSION: new HTMLInput({
                    alias: 'Número de versión',
                    value: ele["NUMERO_VERSION"]
                }),

                FECHA_EMISION: new HTMLInput({
                    type: "date",
                    alias: 'Fecha de emision',
                    value: new Date(ele["FECHA_EMISION"])
                }),

                CODIGO_INSTITUCION: new HTMLInput({
                    alias: 'Código de Institución',
                    value: ele["CODIGO_INSTITUCION"]
                }),


                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoDocumentos(ele["CONSECUTIVO"])
                }),
            });
        }
        return dTable;
    }

    async loadDetailInfoDocumentos(codigo) {

        const data = await this.apiRest.getDocumentosDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información Documentos'
            }),
            CONSECUTIVO: new HTMLInput({
                value: dataBody["CONSECUTIVO"],
                columnClass: 'col-2',
                required: true,
                alias: 'Consecutivo',

                readonly: true,
                forceReadonly: true,
            }),
            NUMERO_OFICIO: new HTMLInput({
                value: dataBody["NUMERO_OFICIO"],
                columnClass: 'col-2',
                required: true,
                alias: 'Número de oficio',


                readonly: true,
                forceReadonly: true,
            }),

            TITULO: new HTMLInput({
                value: dataBody["TITULO"],
                columnClass: 'col-8',
                required: true,
                alias: 'Título'
            }),

            FECHA_EMISION: new HTMLInput({
                type: "date",
                value: dataBody["FECHA_EMISION"],
                columnClass: 'col-4',
                required: true,
                alias: 'Fecha de emisión'
            }),

            NUMERO_VERSION: new HTMLInput({
                value: dataBody["NUMERO_VERSION"],
                columnClass: 'col-2',
                required: true,
                alias: 'Número de versión',


                readonly: true,
                forceReadonly: true,
            }),

            WEB: new HTMLInput({
                value: dataBody["WEB"],
                columnClass: 'col-6',
                required: true,
                alias: 'Enlace Web'
            }),

            CODIGO_INSTITUCION: new HTMLInput({
                type: 'select',
                selectService: () => this.getInstitucion(),

                columnClass: "col-3",
                required: true,
                alias: 'Código de institución',


                readonly: true,
                forceReadonly: true,
            }),
            CODIGO_SUBTEMA: new HTMLInput({
                type: 'select',
                selectService: () => this.getSubTemas(),

                columnClass: "col-3",
                required: true,
                alias: 'Código sub tema',


                readonly: true,
                forceReadonly: true,
            }),
            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-2',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteDocumento(dataBody["CONSECUTIVO"]),
            }),
        };
    }



    async getInstitucion() {

        const data = await this.apiRest.getInstitucionAll().toPromise();

        var listInstitucion = [];

        for (const ele of data['jsonFormatObject']['body']) {

            var nodo = [];

            nodo.push(ele["CODIGO_INSTITUCION"]);
            nodo.push(ele["NOMBRE"]);


            listInstitucion.push(nodo);

        }

        console.log(listInstitucion);
        return listInstitucion;
    };




    async getSubTemas() {

        const data = await this.apiRest.getSubTemasAll().toPromise();

        var listSubTemas = [];

        for (const ele of data['jsonFormatObject']['body']) {

            var nodo = [];

            nodo.push(ele["CODIGO_SUBTEMA"]);
            nodo.push(ele["DESCRIPCION_SUBTEMA"]);


            listSubTemas.push(nodo);

        }

        console.log(listSubTemas);
        return listSubTemas;
    };


    deleteDocumento($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteDocumentos($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    updateDocumento($ev: any) {

        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.updateDocumento($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveDocumento($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.saveDocumento($ev).toPromise();
        this.DataTableComponent.reloadTable();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

}

