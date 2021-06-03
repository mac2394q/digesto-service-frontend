import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-subtemas',
    template: `
  <h2>Informaci&oacute;n de subtemas</h2>
  <app-data-table [newItemVisible]="true" (saveRowEmitter)="updateSubTema($event)" (saveNewRowEmitter)="saveSubTema($event)"></app-data-table>
`
})
export class SubtemasComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoSubtemas());
       




        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nuevo Sub-Tema',
                    titleUnHide: true
                }),

                CODIGO_TEMA: new HTMLInput({
                    type: 'select',
                    selectService: () => this.getTemas(),
                    alias: 'Código de tema',
                    columnClass: "col-4",
                    required: true
                }),
                DESCRIPCION_SUBTEMA: new HTMLInput({
                    type: 'text',
                    alias: 'Descripción',
                    columnClass: "col-8",
                    required: true
                }),

            };
        }
    }


    async getTemas() {

        const data = await this.apiRest.getTemasAll().toPromise();

        var listTemas = [];

        for (const ele of data['jsonFormatObject']['body']) {

            var nodo = [];

            nodo.push(ele["CODIGO_TEMA"]);
            nodo.push(ele["DESCRIPCION_TEMA"]);


            listTemas.push(nodo);

        }

        console.log(listTemas);
        return listTemas;
    };
 

    async loadInfoSubtemas() {
        const dTable: any[] = [];
        const data = await this.apiRest.getSubTemasAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({

                CODIGO_SUBTEMA: new HTMLInput({
                    alias: 'Código de subtema',
                    value: ele["CODIGO_SUBTEMA"]
                }),
                CODIGO_TEMA: new HTMLInput({
                    alias: 'Código de tema',
                    value: ele["CODIGO_TEMA"]
                }),
                DESCRIPCION_SUBTEMA: new HTMLInput({
                    alias: 'Descripción.',
                    value: ele["DESCRIPCION_SUBTEMA"]
                }),
                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoSubtemas(ele["CODIGO_SUBTEMA"])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoSubtemas(codigo) {

        const data = await this.apiRest.getSubTemasDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información Subtema'
            }),
            
            CODIGO_SUBTEMA: new HTMLInput({
                value: dataBody["CODIGO_SUBTEMA"],
                columnClass: 'col-2',
                required: true,
                alias: 'Código subtema',

                readonly: true,
                forceReadonly: true,
            }),
            CODIGO_TEMA: new HTMLInput({
                type: 'select',
                selectService: () => this.getTemas(),
                alias: 'Código de tema',
                columnClass: "col-2",
                required: true
            }),
            DESCRIPCION_SUBTEMA: new HTMLInput({
                value: dataBody["DESCRIPCION_SUBTEMA"],
                columnClass: 'col-6',
                required: true,
                alias: 'Descripción'
            }),

            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-2',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteSubTema(dataBody["CODIGO_SUBTEMA"]),
            }),

        };
    }

    deleteSubTema($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteSubTemas($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }


    updateSubTema($ev: any) {

        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
            this.apiRest.updateSubTemas($ev).toPromise();
            this.DataTableComponent.reloadTable();
            this.DataTableComponent.reloadDetailView();
        // } else {
          //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveSubTema($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
            this.apiRest.saveSubTemas($ev).toPromise();
            this.DataTableComponent.reloadTable();
        // } else {
          //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

}

