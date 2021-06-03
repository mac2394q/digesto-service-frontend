import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableComponent } from 'src/app/Components/data-table/data-table.component';
import { HTMLInput } from 'src/app/Utils/Interfaces';
import { Utils } from 'src/app/Utils/Util';
import { ToastrService } from 'ngx-toastr';
import { DigestoService } from '../../../Service/digesto';

@Component({
    selector: 'app-empleados',
    template: `
        <h2>Informaci&oacute;n de colaboradores</h2>
        <app-data-table (saveRowEmitter)="saveEmpleado($event)"></app-data-table>
    `
})
export class EjemploComponent implements AfterViewInit {

    @ViewChild(DataTableComponent, { static: true }) DataTableComponent: DataTableComponent;

    constructor(
        public apiRest: DigestoService,
        public utils: Utils,
        public toastr: ToastrService
    ) {}

    ngAfterViewInit() {
        this.DataTableComponent.createTable(() => this.loadInfoEmpleados());
    }

    async loadInfoEmpleados() {
        const dTable: any[] = [];
        const data = await this.apiRest.ejemploDigesto().toPromise();

        for (const ele of data) {
            dTable.push({
                campo1: new HTMLInput({
                    alias: 'No. Colaborador',
                    value: ele[0]
                }),
                campo2: new HTMLInput({
                    alias: 'Apellido Paterno',
                    value: ele[1]
                }),
                campo3: new HTMLInput({
                    alias: 'Apellido Materno',
                    value: ele[2]
                }),
                campo4: new HTMLInput({
                    alias: 'Nombre',
                    value: ele[3]
                }),
                campo5: new HTMLInput({
                    type: 'detail',
                    detailService: () => this.loadDetailInfoEmpleado(ele[0])
                })
            });
        }
        return dTable;
    }

    async loadDetailInfoEmpleado(cedula: number) {

        const data = await this.apiRest.ejemploDigesto(/*cedula */).toPromise();
        return {
            title1: new HTMLInput({
                type: 'title',
                value: 'Información General',
                titleUnHide: true
            }),

            subtitle1: new HTMLInput({
                type: 'subtitle',
                value: 'Información personal'
            }),
            'id.campo1': new HTMLInput({
                alias: 'Cédula',
                value: data[0],
                columnClass: 'col-3',
                required: true
            }),
            campo2: new HTMLInput({
                type: 'hidden',
                value: data[0]
            }),
            'id.campo3': new HTMLInput({
                value: 1,
                type: 'hidden',
                required: true
            }),
            campo4: new HTMLInput({
                value: data[1],
                columnClass: 'col-2',
                required: true,
                alias: 'Nombre'
            }),
            campo5: new HTMLInput({
                value: data[2],
                columnClass: 'col-2',
                required: true,
                alias: 'Apellido paterno'
            }),
            campo6: new HTMLInput({
                value: data[3],
                columnClass: 'col-2',
                required: true,
                alias: 'Apellido materno'
            }),
            campo7: new HTMLInput({
                alias: 'Nacionalidad',
                type: 'select',
                selectService: () => this.getNacionalidades(),
                value: data[57],
                columnClass: 'col-3',
                required: true
            }),

        };
    }

    async getNacionalidades() {
        return await this.apiRest.ejemploDigesto(400).toPromise();
    }

    async getEstadoEmpleadoList() {
        return await this.apiRest.ejemploDigesto(202).toPromise();
    }

    async getEmpleadoGradoAcademicoList() {
        return await this.apiRest.ejemploDigesto(203).toPromise();
    }

    async getEmpleadoNombramientoList() {
        return await this.apiRest.ejemploDigesto(201).toPromise();
    }

    async getFormaPagoList() {
        return await this.apiRest.ejemploDigesto(204).toPromise();
    }

    async getTipoPlanillaList() {
        return await this.apiRest.ejemploDigesto(209).toPromise();
    }

    async getTipoCtaBanco() {
        return [
            [1, 'Corriente'],
            [2, 'Ahorros']
        ];
    }

    getEvaluacionDesempeno() {
        return [
            ['EX', 'Excelente'],
            ['MB', 'Muy bueno'],
            ['BU', 'Bueno'],
            ['RG', 'Regular'],
            ['ML', 'Malo'],
            ['MM', 'Muy malo']
        ];
    }

    async getEstadoCivil() {
        return await this.apiRest.ejemploDigesto(205).toPromise();
    }


    getSexo() {
        return [
            ['F', 'Femenino'],
            ['M', 'Masculino']
        ];
    }

    async getAreas() {
        const data = await this.apiRest.ejemploDigesto().toPromise();
        const obj: any[] = [];

        this.DataTableComponent.cleanDetailValueOf('numProceso, diDesProceso, numSubproceso, diDesSubproceso');

        for (const ele of data) {
            obj.push({
                codAreaModal: new HTMLInput({
                    value: ele[0]
                }),
                descAreaModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getProcesos() {
        const area = this.DataTableComponent.getDetailValueOf('numArea').value;
        const data = await this.apiRest.ejemploDigesto(area).toPromise();
        const obj: any[] = [];

        this.DataTableComponent.cleanDetailValueOf('numSubproceso, diDesSubproceso');

        for (const ele of data) {
            obj.push({
                codProcesoModal: new HTMLInput({
                    value: ele[0]
                }),
                descProcesoModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getSubProcesos() {
        const area = this.DataTableComponent.getDetailValueOf('numArea').value;
        const proceso = this.DataTableComponent.getDetailValueOf('numProceso').value;
        const data = await this.apiRest.ejemploDigesto(area).toPromise();
        const obj: any[] = [];

        for (const ele of data) {
            obj.push({
                codSubProcesoModal: new HTMLInput({
                    value: ele[0]
                }),
                descSubProcesoModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getAllClases() {
        const data = await this.apiRest.ejemploDigesto().toPromise();
        const obj: any[] = [];

        for (const ele of data) {
            obj.push({
                codClase: new HTMLInput({
                    value: ele[0]
                }),
                descClase: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getAllProvincias() {
        const data = await this.apiRest.ejemploDigesto().toPromise();
        const obj: any[] = [];

        this.DataTableComponent.cleanDetailValueOf('numCantonDomicilio, fDescanton, numDistritoDomicilio, fDesdistrito');

        for (const ele of data) {
            obj.push({
                codProvModal: new HTMLInput({
                    value: ele[0]
                }),
                descProvModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getCantones() {
        const provincia = this.DataTableComponent.getDetailValueOf('numProvinciaDomicilio').value;
        const data = await this.apiRest.ejemploDigesto(provincia).toPromise();
        const obj: any[] = [];

        this.DataTableComponent.cleanDetailValueOf('numDistritoDomicilio, fDesdistrito');

        for (const ele of data) {
            obj.push({
                codCantonModal: new HTMLInput({
                    value: ele[0]
                }),
                descCantonModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    async getDistritos() {
        const provincia = this.DataTableComponent.getDetailValueOf('numProvinciaDomicilio').value;
        const canton = this.DataTableComponent.getDetailValueOf('numCantonDomicilio').value;
        const data = await this.apiRest.ejemploDigesto(provincia).toPromise();
        const obj: any[] = [];

        for (const ele of data) {
            obj.push({
                codDistritoModal: new HTMLInput({
                    value: ele[0]
                }),
                descDistritoModal: new HTMLInput({
                    value: ele[1]
                })
            });
        }
        return obj;
    }

    saveEmpleado($ev: any) {
        if (this.utils.validateForm('.detailView')) {
            this.apiRest.ejemploDigesto($ev).toPromise();
        } else {
            // this.toastr.error('Hay errores en el formulario, revíse los campos marcados en rojo', 'Error');
        }
    }

}
