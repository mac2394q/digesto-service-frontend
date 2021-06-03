import { Routes } from "@angular/router";
import { AuthGuard } from "../../../Utils/Helpers/auth.guard";
import { EjemploComponent } from "../Views/movimientos/empleados/ejemplo-no-funcional.component";


import { CategoriasComponent } from "../Views/digesto/categorias/categorias.component";
import { SubcategoriaComponent } from "../Views/digesto/subcategoria/subcategoria.component";
import { TemasComponent } from "../Views/digesto/temas/temas.component";
import { SubtemasComponent } from "../Views/digesto/subtemas/subtemas.component";
import { DocumentosComponent } from "../Views/digesto/documentos/documentos.component";
import { InstitucionesComponent } from "../Views/digesto/instituciones/instituciones.component";


const digestoRol = {
    iconClass: 'icon-rrhh',
    isMenu: true,
    roles: ['ROLE_PUBLIC_ACCESS', 'ROLE_DIGESTO_USER', 'LAS_QUE_OCUPEN']
};


export const routesDIGESTO: Routes = [
    {
        path: 'digesto/categorias',
        component: CategoriasComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },
    {
        path: 'digesto/subcategorias',
        component: SubcategoriaComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },
    {
        path: 'digesto/temas',
        component: TemasComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },
    {
        path: 'digesto/subtemas',
        component: SubtemasComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },
    {
        path: 'digesto/documentos',
        component: DocumentosComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },
    {
        path: 'digesto/instituciones',
        component: InstitucionesComponent,
        canActivate: [AuthGuard],
        data: {
            iconClass: 'icon-rrhh',
            isMenu: true,
            roles: ['ROLE_PUBLIC_ACCESS']
        }
    },

];


