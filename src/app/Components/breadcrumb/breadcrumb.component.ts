import { Component, OnInit } from '@angular/core';
import { Utils } from '../../Utils/Util';
import { fadeAnimation } from 'src/app/Utils/Helpers/animation';

interface BREADCRUMB {
    name: string;
    path: string;
}

@Component({
    selector: 'app-breadcrumb',
    styleUrls: ['./breadcrumb.component.scss'],
    template: `
        <ul id="breadcrumb">
            <li><a routerLink="/"> <mat-icon class="homeMenu">home</mat-icon></a></li>
            <li><a routerLink="inicio">Inicio</a></li>
            <li style="height: 39px;" *ngIf="util.isPanLoading()">
                <a>
                    <div id="ajaxLoader" style="padding: 0 !important; background: transparent; border: none !important;">
                        <mat-progress-spinner style="position: relative; top: 6px;"
                         [diameter]="24" color="primary" mode="indeterminate"></mat-progress-spinner>
                    </div>
                </a>
            </li>
            <ng-container *ngIf="!util.isPanLoading()">
                <li *ngFor="let crumb of util.panVal?.split('/'); let i = index">
                        <a routerLink="{{util.panVal}}" [@fadeAnimation]>{{this.getCrumbNameByPath(util.panVal, i+1)}}</a>
                </li>
            </ng-container>
        </ul>
    `,
    animations: [fadeAnimation],
})
export class BreadcrumbComponent {

    constructor(public util: Utils) { }

    getCrumbNameByPath(crumb: String, i: number) {
        return this.util.cleanURI(crumb.split('/')?.[i]?.replaceAll('_', ' ').capitalize());
    }

}
