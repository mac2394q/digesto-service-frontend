import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-temas',
    template: `
  <h2>Informaci&oacute;n de temas</h2>
  <app-data-table [newItemVisible]="true"  (saveRowEmitter)="updateTema($event)" (saveNewRowEmitter)="saveTema($event)"></app-data-table>
`
})
export class TemasComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }
    listSubCategoria = [];

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoTemas());

        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nuevo Tema',
                    titleUnHide: true
                }),
                DESCRIPCION_TEMA: new HTMLInput({
                    type: 'text',
                    alias: 'Descripción',
                    columnClass: "col-6",
                    required: true
                }),

                CODIGO_CATEGORIA: new HTMLInput({
                    type: 'select',
                    selectService: () => this.getCategorias(),
                    alias: 'Categoría',
                    columnClass: "col-3",
                    required: true,
                    onChange: (ev) => this.getSubCategorias(ev.value)
                }),

                CODIGO_SUBCATEGORIA: new HTMLInput({
                    type: 'select',
                    selectService: () => this.listSubCategoria,
                    alias: 'Sub-Categoría',
                    columnClass: "col-3",
                    required: true,
                }),
            };
        }
    }


    async getCategorias() {
        const data = await this.apiRest.getCategoriasAll().toPromise();
        var listCategoria = [];
        for (const ele of data['jsonFormatObject']['body']) {

            var nodo = [];

            nodo.push(ele["CODIGO_CATEGORIA"]);
            nodo.push(ele["DESCRIPCION_CATEGORIA"]);

            listCategoria.push(nodo);
        }
        console.log(listCategoria);
        return listCategoria;
    };


    async getSubCategorias(ev) {


        console.log(ev);
        //this.DataTableComponent.reloadTable();
        const arrSubcategorias = await this.apiRest.getSubCategoriaByCategoria(ev).toPromise();
        var listSubCategoria = [];
        for (const ele of arrSubcategorias['jsonFormatObject']['body']) {

            var nodo = [];

            nodo.push(ele["CODIGO_SUBCATEGORIA"]);
            nodo.push(ele["DESCRIPCION_SUBCATEGORIA"]);

            listSubCategoria.push(nodo);
        }

        this.DataTableComponent.deleteAllSelectOptions("CODIGO_SUBCATEGORIA");
        this.DataTableComponent.selectAddOptions('CODIGO_SUBCATEGORIA', listSubCategoria);

        //this.DataTableComponent.deleteAllSelectOptions;
        console.log(listSubCategoria);
    };





    async loadInfoTemas() {
        const dTable: any[] = [];
        const data = await this.apiRest.getTemasAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({

                CODIGO_TEMA: new HTMLInput({
                    alias: 'Código de tema',
                    value: ele["CODIGO_TEMA"]
                }),
                DESCRIPCION_TEMA: new HTMLInput({
                    alias: 'Descripción.',
                    value: ele["DESCRIPCION_TEMA"]
                }),
                CODIGO_CATEGORIA: new HTMLInput({
                    alias: 'Código de categoría.',
                    value: ele["CODIGO_CATEGORIA"]
                }),
                CODIGO_SUBCATEGORIA: new HTMLInput({
                    alias: 'Código de sub categoría.',
                    value: ele["CODIGO_SUBCATEGORIA"]
                }),
                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoTemas(ele["CODIGO_TEMA"])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoTemas(codigo) {

        const data = await this.apiRest.getTemasDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información Tema'
            }),

            CODIGO_TEMA: new HTMLInput({
                value: dataBody["CODIGO_TEMA"],
                columnClass: 'col-3',
                required: true,
                alias: 'Código tema',

                readonly: true,
                forceReadonly: true,
            }),

            DESCRIPCION_TEMA: new HTMLInput({
                value: dataBody["DESCRIPCION_TEMA"],
                columnClass: 'col-9',
                required: true,
                alias: 'Descripción'
            }),

            CODIGO_CATEGORIA: new HTMLInput({
                type: 'text',
                value: dataBody["CODIGO_CATEGORIA"],
                alias: 'Categoría',
                columnClass: "col-4",
                required: true,
                readonly: true,
                forceReadonly: true,
            }),

            CODIGO_SUBCATEGORIA: new HTMLInput({
                type: 'text',
                value: dataBody["CODIGO_SUBCATEGORIA"],
                alias: 'Sub-Categoría',
                columnClass: "col-4",
                required: true,
                readonly: true,
                forceReadonly: true,
            }),

            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-4',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteTema(dataBody["CODIGO_TEMA"]),
            }),

        };
    }



    deleteTema($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteTemas($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    updateTema($ev: any) {

        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.updateTemas($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveTema($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.saveTemas($ev).toPromise();
        this.DataTableComponent.reloadTable();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

}


