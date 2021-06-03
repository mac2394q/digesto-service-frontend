import { Component, OnDestroy, HostListener } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout/';
import { GeneralService } from '../../../Service/GeneralService';
import { Subscription } from 'rxjs';
import { fadeAnimation } from 'src/app/Utils/Helpers/animation';
import { Utils } from 'src/app/Utils/Util';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    template: `
        <div class="header-container">
            <mat-sidenav-container class="header-sidenav-container">
                <mat-sidenav id="drawerId" #snav [(mode)]="over" [disableClose]="true" fixedTopGap="56" opened="true">
                    <div #viewLogo class="logoHeader">
                        <h1>
                            <div class="row nomargin">
                                <div class="col-3 nopadding notlogospan">
                                    <div class="logo"></div>
                                </div>
                                <div class="col-6 nopadding text-center logospan">SIAM &copy;</div>
                                <div class="col-3 nopadding text-right hidespan">
                                    <button class="iconCerrar" mat-icon-button (click)="snav.toggle()">
                                        <mat-icon>more_vert</mat-icon>
                                    </button>
                                </div>
                            </div>
                        </h1>
                    </div>
                    <div class="coverFoto"></div>
                    <app-menu></app-menu>

                </mat-sidenav>

                <mat-sidenav-content>
                    <mat-toolbar color="primary" class="header-toolbar" id="navbarTop">
                        <div class="row nomargin icon-topbar-parent">
                            <div class="col-lg-3 col-sm-6 nopadding-right">
                                <div class="row w100 h100">
                                    <div class="nopadding icon-topbar">
                                        <button class="iconCerrar" mat-icon-button (click)="snav.toggle()">
                                            <mat-icon>more_vert</mat-icon>
                                        </button>
                                    </div>
                                    <div class="nopadding icon-topbar d-sm-none d-md-block">
                                        <button class="iconCerrar h100" onclick="window.history.go(-1); return false;" mat-icon-button>
                                            <mat-icon>navigate_before</mat-icon>
                                        </button>
                                    </div>
                                    <div class="nopadding icon-topbar d-sm-none d-md-block">
                                        <button class="iconCerrar h100" onclick="window.history.go(1); return false;" mat-icon-button>
                                            <mat-icon>navigate_next</mat-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-9 col-sm-6 nopadding-right">
                                <div class="d-flex justify-content-end h100">
                                    <div class="userContainer">
                                        <div class="nopadding d-flex wauto h100">
                                            <div class="row m-0 w100">
                                                <div class="col-9 textUser nopadding">
                                                    <button class="h100 wauto d-sm-none d-md-block" mat-icon-button [matMenuTriggerFor]="userMenu">
                                                        {{ getUser() }}
                                                    </button>
                                                </div>
                                                <div class="col-3 nopadding iconUser">
                                                    <button class="iconCerrar" mat-icon-button [matMenuTriggerFor]="userMenu">
                                                        <mat-icon>account_circle</mat-icon>
                                                    </button>
                                                </div>

                                                <mat-menu #userMenu="matMenu">
                                                    <button mat-menu-item disabled>
                                                        <mat-icon>face</mat-icon>
                                                        <span>Perfil</span>
                                                    </button>
                                                    <button mat-menu-item (click)="logoutEvent()">
                                                        <mat-icon>wifi_off</mat-icon>
                                                        <span>Salir del sistema</span>
                                                    </button>
                                                </mat-menu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </mat-toolbar>
                    <div class="container-fluid">
                        <app-breadcrumb></app-breadcrumb>
                        <div class="content">
                            <div [@fadeAnimation]="o.isActivated ? o.activatedRoute : ''">
                                <router-outlet #o="outlet"></router-outlet>
                            </div>
                        </div>
                    </div>
                </mat-sidenav-content>

            </mat-sidenav-container>
        </div>

    `,
    styleUrls: ['./header.component.scss'],
    animations: [fadeAnimation]

})
export class HeaderComponent implements OnDestroy {

    opened = true;
    over = 'side';
    expandHeight = '42px';
    collapseHeight = '42px';
    displayMode = 'flat';
    watcher: Subscription;

    constructor(
        media: MediaObserver,
        public restApi: GeneralService,
        public util: Utils
    ) {

        this.watcher = media.asObservable()
            .pipe(
                filter((changes: MediaChange[]) => changes.length > 0),
                map((changes: MediaChange[]) => changes[0])
            ).subscribe((change: MediaChange) => {
                if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
                    this.opened = false;
                    this.over = 'over';
                } else {
                    this.opened = true;
                    this.over = 'side';
                }
            });
    }

    @HostListener('window:resize', ['$event']) onResize(event) {
        console.info(`width: ${event.target.innerWidth}`);
    }

    ngOnDestroy(): void {
        this.watcher.unsubscribe();
        this.watcher = null;
    }

    getUser() {
        const splited = this.util.getUserData() !== null ? this.util.getUserData().username.split(' ') : [];
        if (splited.length === 3) {
            return splited[0] + ' ' + splited[1];
        } else {
            return this.util.getUserData() !== null ? this.util.getUserData().username : 'Saliendo...';
        }
    }

    logoutEvent() {
        this.util.setUserData(null);
        location.reload();
    }
}
