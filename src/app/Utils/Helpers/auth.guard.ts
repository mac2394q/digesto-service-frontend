import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Utils } from '../Util';
import { UserData } from '../Globals/userData';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private util: Utils,
        private toastr: ToastrService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.util.getUserData() != null) {
            const roles: string[] = route.routeConfig.data.roles;
            const userRoles: string[] = this.util.getUserData().roles;

            // El módulo no tiene roles de seguridad - obligamos que tenga al menos un rol
            if (roles.length === 0) {
                return false;
            }

            const hasAccess = this.util.indexOfAny(roles, userRoles);
            if (hasAccess === false) {
                this.toastr.error('Acceso denegado: No tiene acceso a: '
                + this.util.toHTML('m&oacute;dulo') + ', favor reportar a T.I.', 'Error');
                return false;
            } else {
                return true;
            }


        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}
