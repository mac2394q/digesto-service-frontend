import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { DigestoService } from 'src/app/Modules/Digesto/Service/digesto';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-categorias',
    template: `
    <div class="formControl"></div>
  <h2>Informaci&oacute;n de categorias</h2>
  <app-data-table [newItemVisible]="true" [deleteItemVisible]="true"  (saveRowEmitter)="updateCategoria($event)" (saveNewRowEmitter)="saveCategoria($event)"></app-data-table>
`
})
export class CategoriasComponent implements AfterViewInit {


    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(public apiRest: DigestoService, public utils: Utils, public toastr: ToastrService) { }

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoCategorias());
        
        this.DataTableComponent.newItemFunction = () => {

            return {
                title1: new HTMLInput({
                    type: 'title',
                    value: 'Nueva Categoria',
                    titleUnHide: true
                }),
                DESCRIPCION_CATEGORIA: new HTMLInput({
                    type: 'text',
                    alias: "Descripción",
                    columnClass: "col-3",
                    required: true
                }),

            };
        }
    }

    async loadInfoCategorias() {
        const dTable: any[] = [];
        const data = await this.apiRest.getCategoriasAll().toPromise();
        console.log(data);

        for (const ele of data['jsonFormatObject']['body']) {
            dTable.push({
                CODIGO_CATEGORIA: new HTMLInput({
                    alias: 'Código',
                    value: ele["CODIGO_CATEGORIA"],
                    columnClass: "col-2",
                }),
                DESCRIPCION_CATEGORIA: new HTMLInput({
                    alias: 'Descripción',
                    value: ele["DESCRIPCION_CATEGORIA"],
                    columnClass: "col-8",
                }),
                btnInfo: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoCategoria(ele["CODIGO_CATEGORIA"])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoCategoria(codigo) {

        const data = await this.apiRest.getCategoriaDetalle(codigo).toPromise();

        const dataBody = data["jsonFormatObject"]["body"];

        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información categoria'
            }),

            CODIGO_CATEGORIA: new HTMLInput({
                value: dataBody["CODIGO_CATEGORIA"],
                columnClass: 'col-3',
                required: true,
                alias: 'Código',

                readonly: true,
                forceReadonly: true,
            }),
            DESCRIPCION_CATEGORIA: new HTMLInput({
                value: dataBody["DESCRIPCION_CATEGORIA"],
                columnClass: 'col-7',
                required: true,
                alias: 'Descripción'
            }),

            delet: new HTMLInput({
                type: 'button',
                columnClass: 'col-2',
                alias: 'Eliminar',
                buttonService: (ev) => this.deleteCategoria(dataBody["CODIGO_CATEGORIA"]),
            }),

        };
    }


    deleteCategoria($ev: any) {
        console.log($ev);
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.getDeleteCategorias($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    updateCategoria($ev: any) {

        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.updateCategoria($ev).toPromise();
        this.DataTableComponent.reloadTable();
        this.DataTableComponent.reloadDetailView();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }

    saveCategoria($ev: any) {
        console.log($ev);
        // if (this.utils.validateForm('.detailView')) {
        this.apiRest.saveCategoria($ev).toPromise();
        this.DataTableComponent.reloadTable();
        // } else {
        //   this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        // }
    }



}

