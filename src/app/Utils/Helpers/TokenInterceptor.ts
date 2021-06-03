import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utils } from '../Util';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(public util: Utils) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        request = request.clone({
            setHeaders: {
                Authorization: `${this.util.getUserData() == null ? '' : this.util.getUserData().jwtToken}`
            }
        });

        return next.handle(request);
    }
}
