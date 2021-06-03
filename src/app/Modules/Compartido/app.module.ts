/**
 * Core imports de Angular
 */
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../../Utils/Helpers/TokenInterceptor';

/**
 * Componentes 3rd-party
 * Necesarios para alguna funcionalidad
 */
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopupComponent } from '../../Components/popup/popup/popup.component';

/**
 * SIAM Modules
 */
import { DigestoModule } from "../Digesto/DigestoModule";
import { SharedModule } from './sharedModule';

import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        SharedModule,
        DigestoModule,
        NgxDocViewerModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
    ],
    bootstrap: [AppComponent],
    entryComponents: [PopupComponent]
})
export class AppModule { }
