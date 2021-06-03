import { Component, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GeneralService } from '../../Service/GeneralService';
import { UserData } from 'src/app/Utils/Globals/userData';
import { Utils } from 'src/app/Utils/Util';
import { bounceIn } from 'src/app/Utils/Helpers/animation';

@Component({
    selector: 'app-login',
    template: `
        <div class="gradiant-overlay">
            <div class="container">
                <div class="loginContainer">
                    <div class="loginHContainer">
                        <h1 class="siamTitle" [@bounceAnimation]>SIAM</h1>
                        <h2 class="siamsubTitle" [@bounceAnimation]><b>S</b>istema <b>I</b>ntegrado de <b>A</b>dministraci&oacute;n <b>M</b>unicipal</h2>
                    </div>
                    <div [@bounceAnimation] class="loginForm">
                        <div id='loginForm'>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="label-hover">
                                        <label>Usuario</label>
                                        <input name='user' class="defaultInput w100 mb-2" placeholder="Digite su usuario, no distingue mayúsculas y minúsculas">
                                        <mat-icon class="mat-icon-right">account_box</mat-icon>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="label-hover">
                                        <label>Contraseña</label>
                                        <input type='password' name='password' class="defaultInput w100 mb-2" placeholder="Digite su contraseña, no distingue mayúsculas y minúsculas">
                                        <mat-icon class="mat-icon-right">lock</mat-icon>
                                    </div>
                                </div>
                            </div>
                            <button class="btn mt-2" id='focusSubmit' (click)="onSubmit()" color="primary" [disabled]="submitted">
                                <mat-icon>{{btnIcon}}</mat-icon>
                                {{btnText}}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./login.component.scss'],
    animations: [bounceIn],
})
export class LoginComponent {

    submitted = false;
    btnText = 'Entrar';
    btnIcon = 'send';

    constructor(
        private toastr: ToastrService,
        public restApi: GeneralService,
        public util: Utils
    ) { }

    @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.onSubmit();
    }

    onAfterLoadBtn() {
        this.btnText = 'Entrar';
        this.btnIcon = 'send';
        this.submitted = false;
    }

    async onSubmit() {
        this.submitted = true;
        this.btnText = 'Cargando...';
        this.btnIcon = 'sync';

        if (this.util.validateForm('#loginForm')) {
            this.toastr.warning('Campos vac&iacute;os encontrados', 'Error');
            this.onAfterLoadBtn();
            return;
        }

        try {
            const data: any = await this.restApi.getLogin(
                (this.util.getInput('#loginForm [name="user"]').value as string).toUpperCase(),
                (this.util.getInput('#loginForm [name="password"]').value as string).toUpperCase()
            ).toPromise();

            if (!data) {
                this.toastr.error('Contraseña o usuario incorrecto', 'Error');
                this.onAfterLoadBtn();
            } else {
                this.util.setUserData(
                    new UserData(
                        data.userDetails.username,
                        data.userDetails.password,
                        data.userDetails.authorities,
                        data.bearerData,
                        new Date().getTime(),
                        (this.util.getInput('#loginForm [name="user"]').value as string).toUpperCase()
                    )
                );
                location.reload();
            }
        } catch (error) {
            this.onAfterLoadBtn();
        }
    }
}
