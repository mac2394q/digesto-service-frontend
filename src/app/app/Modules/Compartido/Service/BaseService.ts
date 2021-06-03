import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

export interface IRequestOptions {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
    body?: any;
}

export interface IRequestOptions2 {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType: 'arraybuffer';
    withCredentials?: boolean;
}


export function applicationHttpClientCreator(http: HttpClient, toastr: ToastrService) {
    return new BaseService(http, toastr);
}

@Injectable({
    providedIn: 'root',
    useFactory: applicationHttpClientCreator,
    deps: [HttpClient, ToastrService]
})
export class BaseService {

    private api = environment.apiService;  //Descomentar para hacer Pruebas servicios

    //private api = environment.apiCall;  //Descomentar para hacer Login

    public constructor(public http: HttpClient, public toastr: ToastrService) { }


    public GET<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
        return this.http.get<T>(this.api + endPoint, options).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    // tslint:disable-next-line: ban-types
    public POST<T>(endPoint: string, params: Object = {}, options?: IRequestOptions): Observable<T> {
        return this.http.post<T>(this.api + endPoint, this.getFormatedParams(params), options).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    public PDF<T>(endPoint: string, params: Object): Observable<ArrayBuffer> {
        return this.http.post(this.api + endPoint, this.getFormatedParams(params), {
            responseType: 'arraybuffer'
        }).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }


    // tslint:disable-next-line: ban-types
    getFormatedParams(params: Object) {
        return (Array.isArray(params) && params.length === 1 ? params[0] : params);
    }

    handleError(error: any) {
        // [FIX]: Debeemos limpiar los botones cuando falla el sistema
        // ya que los botones cuando están cargando y falla la ejecución, quedan como cargando...
        const btns: NodeListOf<any> = document.querySelectorAll('[data-isloading]');
        btns.forEach((btn) => {
            btn.innerHTML = btn.tmp;
            btn.disabled = false;
            btn.dataset.isloading = false;
        });

        if (error.error instanceof ErrorEvent) {
            console.info(error);
        } else {
            switch (error.status) {
                case 404:
                    this.toastr.error(`No se encontró la dirección de destino, por favor
                        intente recargar la página si el error continua reporte a T.I.
                        para más información: revise el DevTools`, 'Error');
                    return throwError(`[${error.status}]: No se encontró la dirección \n
                         RESPUESTA: ${error.message}`);

                case 500:
                    this.toastr.error(`Se encontró un error del lado del servidor porfavor, reportar a T.I.`, 'Atención');
                    return throwError(`[${error.status}]: Error en el servidor, favor revisar el log del Back end \n
                         RESPUESTA: ${error.message}`);

                case 0:
                    this.toastr.info(`No hubo comunicación con el servidor, espere unos instantes y vuelva a intentar, normalmente se debe a actualizaciones de T.I, de persistir
                                   después de unos minutos comuniquese con T.I.`, 'Atención');
                    return throwError(`[${error.status}]: Error en el servidor, parece ser que está caido`);

                case 405:
                    this.toastr.warning(`La operación fue realizada con éxito, sin embargo, el servidor no está devolviendo una respuesta.
                    En este caso, por favor verifique que el registro fue procesado.`, 'Alerta');
                    return throwError(`[${error.status}][OK]: Sin embargo, el backend no está devolviendo un ResponseEntity \n
                         RESPUESTA: ${error.message}`);
                case 400:
                    this.toastr.warning(`El servidor parece no encontrar un parámetro de búsqueda, he visto que pasa con un GetDetailValueOf('element') sin el .value`, 'Alerta');
                    return throwError(`[${error.status}][OK]: El servidor parece no encontrar un parámetro de búsqueda.. \n
                         RESPUESTA: ${error.message}`);

                default:
                    if (localStorage.getItem('userData') !== null) {
                        localStorage.removeItem('userData');
                        location.reload();
                    }

                    this.toastr.warning(`Error desconocido (no controlado), favor notificar a T.I`);
                    return throwError(`[${error.status}][UKNOWN]: Error desconocido. \n
                         RESPUESTA: ${error.message}`);
            }
        }
    }
}
