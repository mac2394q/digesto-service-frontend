import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './BaseService';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeneralService {

    constructor(private http: BaseService, public toastr: ToastrService) {}

    getLogin(u: string, p: string) {
        return this.http.GET<any>('/general/login', {
            params: {
                username: u,
                password: p
            },
        });
    }
}
