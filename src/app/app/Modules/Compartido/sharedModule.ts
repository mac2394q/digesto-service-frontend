import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material-module';
import { AppRoutes } from './Routes/main-routes';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InicioComponent } from './Views/Inicio/Inicio.component';
import { MenuComponent } from '../../Components/menu/menu.component';
import { LoginComponent } from './Views/Login/login.component';
import { HeaderComponent } from './Views/Template/header/header.component';
import { BreadcrumbComponent } from '../../Components/breadcrumb/breadcrumb.component';
import { DataTableComponent } from '../../Components/data-table/data-table.component';
import { ModalComponent } from '../../Components/modal/modal.component';
import { SubirArchivo } from '../../Components/subir-archivos/subir-archivo.component';
import { SanitizeHtmlPipe } from "../../Components/data-table/dt-pipe";
import { PopupComponent } from '../../Components/popup/popup/popup.component';
import { ToastrModule } from 'ngx-toastr';
import { MatTableExporterModule } from 'mat-table-exporter';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        AppRoutes,
        ToastrModule.forRoot({
            timeOut: 40000,
            extendedTimeOut: 40000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            closeButton: true,
            progressBar: true,
            enableHtml: true,
            resetTimeoutOnDuplicate: true,
            maxOpened: 1,
            autoDismiss: true,
            messageClass: 'text-justify mt-3 mb-2'
        }),
        MatTableExporterModule
    ],
    declarations: [
        InicioComponent,
        MenuComponent,
        LoginComponent,
        HeaderComponent,
        BreadcrumbComponent,
        DataTableComponent,
        PopupComponent,
        ModalComponent,
        SubirArchivo,
        SanitizeHtmlPipe,
    ],
    exports: [
        CommonModule,
        BreadcrumbComponent,
        DataTableComponent,
        ModalComponent,
        SubirArchivo,
        SanitizeHtmlPipe,
        HeaderComponent,
        LoginComponent,
        MaterialModule,

        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,

        MatTableExporterModule,
        ToastrModule,
    ]
})
export class SharedModule { }
