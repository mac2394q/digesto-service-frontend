import { RouterModule, PreloadAllModules } from '@angular/router';
import { routesPublic } from './public-routes';

/**
 * @Fecha Jueves 07 de Noviembre, 2019 | 19/11/2020
 * -------------------------------------------------------------------------------------
 * @iconClass debe existir en el CSS -> general.scss
 * @isMenu = identificará si debe ser mostrado en el menu izquierdo
 * @ComposiciónMenu
 * ¿Cómo se compone el texto?
 *  - Primero es importante saber:
 *      1. La estructura de 3 niveles como máximo se define de la siguiente manera:
 *          <modulo>/<segundo_menu>/<elemento>
 *
 *  - El text se compone siguiendo la anterior estructura:
 *      1. Si no la respeta, no funcionará.
 *      2. Se transforma la primera letra en mayúscula
 *      3. Se cambiará los _ por espacios para texto
 *
 *  - @Ejemplo
 *      path: 'talento_humano/mantenimiento/periodos'
 *
 *      hará un menú:
 *          -> Talento Humano
 *                  -> Manteniemiento
 *                          -> Periodos
 *  @canActivate
 *      Este almacena la clase de seguridad que se desea aplicar
 *      Eliminar este parámetro @NO dejará vulnerable el menu -
 *      pero @SI posibles intruciones por URL
 */

export const AppRoutes = RouterModule.forRoot(
    routesPublic,
    {
        // enableTracing: true // sirve para debugear rutas activar en caso de que algo falle
        preloadingStrategy: PreloadAllModules,
        useHash: true,
        relativeLinkResolution: 'legacy'
    },
);
