import { Injectable } from '@angular/core';
import { JSONResponse } from 'src/app/Utils/Interfaces';

@Injectable({ providedIn: 'root' })
export class Constants {

    /**
     * Estados de JSON
     */
    public STATE_OK      = 0; // TODO SALIÓ BIEN
    public STATE_FAIL    = 1; // FALLÓ LA CONSULTA TRAE MENSAJE DE ERROR
    public DUPLICATE_KEY = 2; // LLAVE PRIMARIA ENCONTRADA
    public FOREING_KEY   = 3; // ERROR EN LLAVE FORANEA
    public NO_DATA_FOUND = 4; // NO CONTIENE DATOS
    public STATE_FAIL_SP = 5; //

    /**
     * TIPO DE EJECUCIÓN DE SP
     */
    public EXTECUTE_NONE_SP  =      10;  // NO EJECUTA SP
    public EXTECUTE_APROB_SP =      11;  // EJECUTA UN SP DE APROBACIÓN
    public EXTECUTE_ANU_SP   =      12; // EJECUTA UN SP DE ANULACIÓN
    public EXTECUTE_LIQUIDA_SP =    13; // EJECUTA UN SP DE LIQUIDACION

    getJSONState(data: JSONResponse | any[]) {
        if (data[0] === null || typeof data[0] === 'undefined') {
            console.error('No hay estado de respuesta....');
            return null;
        }
        return data[0];
    }

    getJSONResponse(data: JSONResponse | any[]) {
        if (data[1] === null || typeof data[1] === 'undefined') {
            if (data[0] !== null)
                return data[0] == 0 ? "Proceso exitoso" : "Proceso fallido";

            return 'No hay mensaje de respuesta';
        } else
            return data[1];
    }
}
