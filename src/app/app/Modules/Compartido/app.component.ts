import { Component, OnInit } from '@angular/core';
import { Utils } from '../../Utils/Util';

@Component({
    selector: 'app-root',
    template: `
        <app-login *ngIf="!isLoggedIn"></app-login>
        <app-header *ngIf="isLoggedIn"></app-header>
    `
})
export class AppComponent implements OnInit {

    isLoggedIn: boolean;
    constructor(private util: Utils) { }

    ngOnInit() {
        if (this.util.getUserData() !== null) {
            if ((new Date()).getTime() > this.util.getUserData().sessionExpire) {
                this.isLoggedIn = false;
            } else {
                this.isLoggedIn = true;
            }
        } else {
            this.isLoggedIn = false;
        }
    }

}
