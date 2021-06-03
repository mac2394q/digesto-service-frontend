import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { stringify } from '@angular/compiler/src/util';

@Component({
    selector: 'app-subcategoria',
    template: `
    <div class="formControl"></div>
  <h2>Informaci&oacute;n de subcategoria</h2>
  <app-data-table [newItemVisible]="true"  (saveRowEmitter)="updateSubCategoria($event)" (saveNewRowEmitter)="saveSubCategoria($event)"></app-data-table>
`
})
export class SubcategoriaComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoSubcategoria());



        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nueva Subcategoría',
                    titleUnHide: true
                }),
                DESCRIPCION_SUBCATEGORIA: new HTMLInput({
                    type: 'text',
                    alias: 'Descripción',
                    columnClass: "col-6",
                    required: true
                }),

                CODIGO_CATEGORIA: new HTMLInput({
                    type: 'select',
                    selectService: () => this.getCategorias(),
                    alias: 'Código de categoría',
                    columnClass: "col-3",
                    required: true
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


    async loadInfoSubcategoria() {
        const dTable: any[] = [];
        const data = await this.apiRest.getSubCategoriasAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({

                codigoSubCategoria: new HTMLInput({
                    alias: 'Código de sub categoría',
                    value: ele["CODIGO_SUBCATEGORIA"],
                    columnClass: "col-3",
                }),
                descripcion: new HTMLInput({
                    alias: 'Descripción',
                    value: ele["DESCRIPCION_SUBCATEGORIA"],
                    columnClass: "col-6",
                }),
                codigoCategoria: new HTMLInput({
                    alias: 'Código de categoría',
                    value: ele["CODIGO_CATEGORIA"],
                    columnClass: "col-3",
                }),
                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoSubcategoria(ele["CODIGO_SUBCATEGORIA"])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoSubcategoria(codigo) {

        const data = await this.apiRest.getSubCategoriaDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información Subcategoría'
            }),
            CODIGO_SUBCATEGORIA: new HTMLInput({
                value: dataBody["CODIGO_SUBCATEGORIA"],
                columnClass: 'col-2',
                required: true,
                alias: 'Código de sub categoría',

                readonly: true,
                forceReadonly: true,
            }),

            DESCRIPCION_SUBCATEGORIA: new HTMLInput({
                value: dataBody["DESCRIPCION_SUBCATEGORIA"],
                columnClass: 'col-6',
                required: true,
                alias: 'Descripción'
            }),

            codigoCategoria: new HTMLInput({
                type: 'select',
                selectService: () => this.getCategorias(),
                alias: 'Código de categoría',
                columnClass: "col-2",
                required: true
            }),

            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-2',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteSubCategoria(dataBody["CODIGO_SUBCATEGORIA"]),
            }),

        };
    }

    deleteSubCategoria($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteSubCategorias($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }


    updateSubCategoria($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.updateSubCategoria($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveSubCategoria($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.saveSubCategoria($ev).toPromise();
        this.DataTableComponent.reloadTable();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }



}

