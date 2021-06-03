import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-popup',
    template: `
        <h1>Confirmación</h1>
        <div class="explicacion mb-4"><div [innerHTML]="msj | sanitizeHtml"></div></div>
        <div class="row">
            <div class="col-6">
                <button class=" btn w100 btn-error" (click)="onCancelClick()">{{cancelBtnTxt}}</button>
            </div>
            <div class="col-6">
                <button class=" btn w100 btn-success" (click)="onOkClick()">{{okBtnTxt}}</button>
            </div>
        </div>
    `
})
export class PopupComponent {

    msj = '';
    cancelBtnTxt = 'Cancelar';
    okBtnTxt = 'Ok';

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<PopupComponent>) {
        this.msj = data.msj ?? this.msj;
        this.cancelBtnTxt = data.buttonText?.cancel?.alias ?? this.cancelBtnTxt;
        this.okBtnTxt = data.buttonText?.ok?.alias ?? this.okBtnTxt;
    }

    async onCancelClick() {
        await (this.data.buttonText?.cancel?.fn?.call());
        this.dialogRef.close(true);
    }

    async onOkClick() {
        await (this.data.buttonText?.ok?.fn?.call());
        this.dialogRef.close(true);
    }
}
