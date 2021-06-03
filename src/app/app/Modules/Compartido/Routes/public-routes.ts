import { Routes } from '@angular/router';

import { InicioComponent } from '../../Compartido/Views/Inicio/Inicio.component';

import { AuthGuard } from "../../../Utils/Helpers/auth.guard";
import { routesDIGESTO} from '../../Digesto/Routes/digesto-routes';

export const routesPublic: Routes = [
    {
        path: 'inicio',
        component: InicioComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-inicio',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        },
    },
    ...routesDIGESTO,
];
