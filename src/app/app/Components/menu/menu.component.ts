import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { Utils } from '../../Utils/Util';
import { filter, map } from 'rxjs/operators';

interface MENU {
    name: string;
    iconClass?: string;
    path?: string;
    secondLevel: {
        name: string;
        path?: string;
        thirdLevel: {
            name: string;
            path: string;
            fourthLevel: {
                name: string;
                path: string;
            }[];
        }[];
    }[];
}

@Component({
    selector: 'app-menu',
    styleUrls: ['./menu.component.scss'],
    template: `
        <ul id="menuId">
            <li *ngFor="let mainMenu of menu; let i = index" data-smenu='true'>
                <a
                    data-smenu='true'
                    (click)="show2ndMenu($event, i)"
                    [attr.data-path]="mainMenu.path"
                    [ngClass]="{'activeLi': firstMenuState[i], 'menuMovil': isMenuMovil}">
                        <span [className]="'icon-config ' + mainMenu.iconClass"></span>
                        {{ mainMenu.name }}
                        <i *ngIf="mainMenu.secondLevel.length > 0" class="material-icons btn-expand-menu">chevron_right</i>
                </a>
                <ul
                    id='submenu2-{{i}}'
                    data-smenu='true'
                    [attr.data-index]="i"
                    [ngClass]="{'show': firstMenuState[i], 'hide': !firstMenuState[i], 'menuMovil': isMenuMovil}">
                    <li *ngFor="let secondLevel of mainMenu.secondLevel; let j = index" data-smenu='true'>
                        <a (click)="show3dMenu($event, j, i)" [attr.data-path]="secondLevel.path"  data-smenu='true'>
                            {{secondLevel.name}}
                            <i *ngIf="secondLevel.thirdLevel.length > 0" class="material-icons btn-expand-menu" data-smenu='true'>chevron_right</i>
                        </a>
                        <ul
                            id='submenu3-{{i}}-{{j}}'
                            [attr.data-index]="j" data-smenu='true'
                            [ngClass]="{'show': secondMenuState[j], 'hide': !secondMenuState[j], 'menuMovil': isMenuMovil}">
                            <div class="alert alert-warning m-2 text-justify" role="alert" [ngClass]="{'hide': isMenuMovil}" data-smenu='true'>
                            <mat-icon>error_outline</mat-icon>Se
                            le recuerda que debe guardar la informaci&oacute;n antes de navegar a otra opción de menu.
                            </div>
                            <li *ngFor="let thirdLevel of secondLevel.thirdLevel; let k = index" data-smenu='true'>
                                <a [attr.data-path]="thirdLevel.path" (click)="show4thMenu($event, k)" data-smenu='true'>
                                    {{thirdLevel.name}}
                                    <i *ngIf="thirdLevel.fourthLevel.length > 0" class="material-icons btn-expand-menu" data-smenu='true'>chevron_right</i>
                                </a>
                                 <ul
                                    id='submenu3-{{k}}'
                                    data-smenu='true'
                                    [attr.data-index]="k"
                                    [ngClass]="{'show': thirdMenuState[k], 'hide': !thirdMenuState[k], 'menuMovil': isMenuMovil}">
                                        <li *ngFor="let fourthLevel of thirdLevel.fourthLevel; let y = index" data-smenu='true'>
                                            <a (click)="routerLinkSimulate(fourthLevel.path)" data-smenu='true'>{{fourthLevel.name}}</a>
                                        </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    `
})
export class MenuComponent implements OnInit, OnDestroy {

    firstMenuState: boolean[] = [];
    secondMenuState: boolean[] = [];
    thirdMenuState: boolean[] = [];
    public menu: MENU[] = [];
    isMenuMovil = false;
    watcher: Subscription;

    constructor(
        private router: Router,
        private util: Utils,
        media: MediaObserver
    ) {
        this.watcher =
            media.asObservable()
                .pipe(
                    filter((changes: MediaChange[]) => changes.length > 0),
                    map((changes: MediaChange[]) => changes[0])
                ).subscribe((change: MediaChange) => {
                    if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
                        this.isMenuMovil = true;
                    } else {
                        this.isMenuMovil = false;
                    }
                });
    }

    /**
     * Evento que corre al cargar la página
     */
    ngOnInit(): void {
        this.mapItems(this.router.config);

        this.util.addEventListener(document, "click", (e) =>
            this.onClick(e.target), true
        );
    }

    /**
     * Evento que corre al cerrar la página
     */
    ngOnDestroy(): void {
        this.watcher = null;
    }

    /**
     * Al hacer click en un link debemos cerrar todos los sub-menus
     * @param path dirección a cargar
     */
    routerLinkSimulate(path: string) {
        this.refreshMenu();
        this.router.navigateByUrl(path);
    }

    /**
     * Cierra un submenu o bien todos
     * @param menuLevel nivel de menu a cerrar, o bien null para todos
     */
    refreshMenu(menuLevel = null) {
        if (!menuLevel) {
            this.firstMenuState = this.firstMenuState.map(_ => false);
            this.secondMenuState = this.secondMenuState.map(_ => false);
            this.thirdMenuState = this.thirdMenuState.map(_ => false);
        } else {
            switch (menuLevel) {
                case 1:
                    this.firstMenuState = this.firstMenuState.map(_ => false);
                    break;
                case 2:
                    this.secondMenuState = this.secondMenuState.map(_ => false);
                    break;
                case 3:
                    this.thirdMenuState = this.thirdMenuState.map(_ => false);
                    break;
            }
        }
    }

    /**
     * Centro del SubMenu
     * @Attribute {Integer} mH = menu item Height
     * @Attribute {Integer} eH = element Height
     * @Attribute {Integer} menuCenter = trata de centrar el submenu al menu principal
     */
    getBestPostion(ulId: string) {
        setTimeout(() => {
            const ul: HTMLElement = document.getElementById(ulId);
            if (ul === null)
                return;

            const mH = (ul.parentElement.childNodes[0] as HTMLElement).offsetHeight;
            const eH = ul.offsetHeight;
            const menuCenter = (((eH / 2) + (mH / 2)) * -1) + 'px'; /*centra perfectamente*/

            ul.style.marginTop = menuCenter;
            this.pushPositionBasedOnViewPort(ulId);
        }, 100);
    }

    /**
     * Aun con el getBestPostion no es suficiente, se debe recalcular
     * con base a la vista del usuario
     * @return {undefined}
     */
    pushPositionBasedOnViewPort(ulId: string) {
        setTimeout(() => {

            const ul: HTMLElement = document.getElementById(ulId);
            if (ul === null)
                return;

            const actualMargin = parseInt((ul.style.marginTop).split('px')[0],10);
            const eleH = ul.offsetHeight;
            const eleY = (ul.parentElement.childNodes[0] as HTMLElement).getBoundingClientRect().y;
            const windowH = window.innerHeight;
            const scrollOffset = document.scrollingElement.scrollTop;
            const totalH = eleY + eleH - scrollOffset;
            const newMargin = -(totalH - windowH) + (actualMargin / 2);

            if (windowH >= totalH)
                return;

            ul.style.marginTop = newMargin + 'px';
        }, 200);
    }

    /**
     * Muestra el 2ndo submenu
     * @param $ev evento caller
     * @param idx índice del submenu
     */
    show2ndMenu($ev: any, idx: number) {
        if ($ev.target.parentNode.querySelector('ul').querySelector('li') === null && $ev.target.dataset.path) {
            this.routerLinkSimulate($ev.target.dataset.path);
        } else {
            this.refreshMenu();
            this.firstMenuState[idx] = !this.firstMenuState[idx];
            this.getBestPostion(`submenu2-${idx}`);
        }
    }

    /**
     * Muestra el 3er submenu
     * @param $ev evento caller
     * @param idx índice del submenu
     */
    show3dMenu($ev: any, idx: number, parentIdx: number) {
        if ($ev.target.parentNode.querySelector('ul').querySelector('li') === null && $ev.target.dataset.path) {
            this.routerLinkSimulate($ev.target.dataset.path);
        } else {
            this.refreshMenu(3);
            this.refreshMenu(2);
            this.secondMenuState[idx] = !this.secondMenuState[idx];

            this.getBestPostion(`submenu3-${parentIdx}-${idx}`);
        }
    }

    /**
     * Muestra el 4to submenu
     * @param $ev evento caller
     * @param idx índice del submenu
     */
    show4thMenu($ev: any, idx: number) {
        if ($ev.target.parentNode.querySelector('ul').querySelector('li') === null && $ev.target.dataset.path) {
            this.routerLinkSimulate($ev.target.dataset.path);
        } else {
            this.refreshMenu(3);
            this.thirdMenuState[idx] = !this.thirdMenuState[idx];
            this.getBestPostion(`submenu4-${idx}`);
        }
    }

    /**
     * Un pequeño atajo para cerrar los submenu con la tecla scape
     * @param event
     */
    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.refreshMenu();
    }

    /**
     * Si clickea afuera del menu, debe cerrarlo.
     * @param $ev
     */
    onClick($ev: any) {
        if (typeof $ev.dataset.smenu === 'undefined')
            this.refreshMenu();
    }

    /**
     * Parsea el cuarto nivel del menu,
     * el parseo se hace por /, ademas los _ del router son convertidos a espacio
     * como este es el último nivel solo acepta clicks, no submenu
     */
    fourthLevelParse(fourthMenu: any, menuName: string, realPath: string) {
        if (typeof menuName === 'undefined') {
            return;
        }

        menuName = menuName.replace(/\_/gi, ' ');
        fourthMenu.push({
            name: menuName,
            path: realPath
        });
    }

    /**
     * Parsea el tercer nivel del menu,
     * el parseo se hace por /, ademas los _ del router son convertidos a espacio
     */
    thirdLevelParse(thirdMenu: any, menuName: string, fourthMenu: string, realPath: string) {
        if (typeof menuName === 'undefined') {
            return;
        }
        let indx: number = thirdMenu.findIndex(p => p.name === menuName);
        if (indx === -1) {
            menuName = menuName.replace(/\_/gi, ' ');
            indx = thirdMenu.push({
                name: menuName,
                fourthLevel: [],
                path: realPath
            }) - 1;
        }
        if (typeof fourthMenu !== 'undefined') {
            this.fourthLevelParse(thirdMenu[indx].fourthLevel, fourthMenu, realPath);
        }
    }

    /**
     * Parsea el segundo nivel del menu,
     * el parseo se hace por /, ademas los _ del router son convertidos a espacio
     */
    secondLevelParse(secondMenu: any, menuName: string, thirdMenu: string, fourthMenu: string, realPath: string): void {
        let indx: number = secondMenu.findIndex(p => p.name === menuName);

        if (indx === -1) {
            menuName = menuName.replace(/\_/gi, ' ');
            indx = secondMenu.push({
                name: menuName,
                thirdLevel: []
            }) - 1;
        }

        if (typeof thirdMenu !== 'undefined')
            this.thirdLevelParse(secondMenu[indx].thirdLevel, thirdMenu, fourthMenu, realPath);
        else
            secondMenu[indx].path = realPath;
    }

    /**
     * Parsea el primer nivel del menu,
     * el parseo se hace por /, ademas los _ del router son convertidos a espacio
     */
    parseMenuByLevel(
        firstMenu: string,
        secondMenu: string,
        thirdMenu: string,
        fourthMenu: string,
        realPath: string,
        iconClass: string
    ): void {
        firstMenu = firstMenu.replace(/\_/gi, ' ');
        let indx: number = this.menu.findIndex(p => p.name === firstMenu);
        if (indx === -1) {
            indx = this.menu.push({
                name: firstMenu,
                secondLevel: [],
                iconClass: iconClass ?? null,
            }) - 1;
        } else {
            if (typeof iconClass !== 'undefined' && typeof this.menu[indx] !== 'undefined') {
                this.menu[indx].iconClass = iconClass;
            }
        }

        if (typeof secondMenu !== 'undefined') {
            this.secondLevelParse(this.menu[indx].secondLevel, secondMenu, thirdMenu, fourthMenu, realPath);
        } else {
            this.menu[indx].path = realPath;
        }
    }

    /**
     * Este método mapea todas las rutsas y las convierte en un menu automáticamente,
     * siempre y cuando la ruta tenga la propiedad isMenu
     * @param routes
     * @param path
     */
    private mapItems(routes: any[], path?: string) {
        routes.forEach((item) => {
            if (item.data.isMenu === false) {
                return;
            }

            const hasAccess = this.util.indexOfAny(item.data.roles, this.util.getUserData().roles);

            if (hasAccess && item.data.isMenu === true) {
                const mSplit = item.path.split('/');
                this.parseMenuByLevel(mSplit[0], mSplit[1], mSplit[2], mSplit[3], item.path, item.data.iconClass);
            }
        });
    }
}
