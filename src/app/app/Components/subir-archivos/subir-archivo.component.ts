import { Component,ViewChild,ElementRef, Output, EventEmitter} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'subir-archivo',
    template: `
        <div *ngIf="currentFile" class="progress">
            <div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar"
                attr.aria-valuenow="{{ progress }}" aria-valuemin="0" aria-valuemax="100" [ngStyle]="{ width: progress + '%' }">
                {{ progress }}%
            </div>
        </div>

        <label class="btn btn-default">
            <input #myInput type="file" (change)="recuperarArchivo($event)" />
        </label>

        <div class="alert alert-light" role="alert">{{ message }}</div>

        <div class="card">
            <div class="card-header">List of Files</div>
            <ul class="list-group list-group-flush" *ngFor="let file of fileInfos | async">
                <li class="list-group-item">
                    <a href="{{ file.url }}">{{ file.name }}</a>
                </li>
            </ul>
        </div>
        `,
})
export class SubirArchivo
{
    toastr: ToastrService;
    progress = 0;
    currentFile: any;
    message = "";
    fileInfos: any;

    @Output() public selectedFile = new EventEmitter<any>();

    @ViewChild('myInput',{static:false}) myInputVariable:ElementRef;
    constructor(toastr: ToastrService)
    {
        this.toastr = toastr;
    }

    public recuperarArchivo(event) {
        const archivo_recuperado = event.target.files[0];
            if (archivo_recuperado.type === 'application/vnd.ms-excel'){
                this.selectedFile.emit({archivo:archivo_recuperado})
            }else{
                this.toastr.warning('Formato de archivo no valido, debe ingresar un archivo .csv');
                this.myInputVariable.nativeElement.value = "";
                this.selectedFile = null;
            }
    }

    public limpiarInput()
    {
        this.myInputVariable.nativeElement.value = "";
    }
}
