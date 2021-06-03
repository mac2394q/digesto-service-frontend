import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../Compartido/Service/BaseService';

@Injectable({
    providedIn: 'root'
})
export class DigestoService {

    constructor(private http: BaseService) { }

    ejemploDigesto(param?: any): Observable<any[]> {
        return this.http.POST<any[]>('/digesto/metodoBackend', {});
    }

    //Categorias

    getCategoriasAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/categorias/all');
    }

    getCategoriaDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/categorias/find/' + codigo);
    }

    updateCategoria(obj: any): Observable<any[]> {
        console.log("estoy entrando aqui");
        return this.http.POST('/digesto/categorias/update', obj);
    }

    saveCategoria(obj: any): Observable<any[]> {
        console.log("estoy entrando aqui");
        return this.http.POST('/digesto/categorias/save', obj);
    }

    getDeleteCategorias(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/categorias/delete/' + codigo);
    }


    //subcategorias

    getSubCategoriasAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subcategorias/all');
    }

    getSubCategoriaDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subcategorias/find/' + codigo);
    }

    updateSubCategoria(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/subcategorias/update', obj);
    }

    saveSubCategoria(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/subcategorias/save', obj);
    }

    getDeleteSubCategorias(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subcategorias/delete/' + codigo);
    }

    //Temas

    getTemasAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/temas/all');
    }

    getTemasDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/temas/find/' + codigo);
    }

    updateTemas(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/temas/update', obj);
    }

    saveTemas(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/temas/save', obj);
    }

    getDeleteTemas(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/temas/delete/' + codigo);
    }

    //Sub Temas

    getSubTemasAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subtemas/all');
    }

    getSubTemasDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subtemas/find/' + codigo);
    }

    updateSubTemas(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/subtemas/update', obj);
    }

    saveSubTemas(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/subtemas/save', obj);
    }

    getDeleteSubTemas(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subtemas/delete/' + codigo);
    }


    //Institucion

    getInstitucionAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/instituciones/all');
    }

    getInstitucionDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/instituciones/find/' + codigo);
    }

    updateInstitucion(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/instituciones/update', obj);
    }

    saveInstitucion(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/instituciones/save', obj);
    }

    getDeleteInstitucion(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/instituciones/delete/' + codigo);
    }


    //Documentos

    getDocumentosAll(): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/documentos/all');
    }

    getDocumentosDetalle(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/documentos/find/' + codigo);
    }

    updateDocumento(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/documentos/update', obj);
    }

    saveDocumento(obj: any): Observable<any[]> {
        return this.http.POST('/digesto/documentos/save', obj);
    }

    getDeleteDocumentos(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/documentos/delete/' + codigo);
    }

    getVersionesDocumento(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/documentos/version/' + codigo);
    }

    getObservacionesDocumento(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/observaciones/observacionesbydocumentos/' + codigo);
    }


    //Combos

    getSubCategoriaByCategoria(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subcategorias/subcategoriasbycategorias/' + codigo);
    }
    getTemaBySubcategoria(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/temas/temasbysubcategorias/' + codigo);
    }
    getSubTemaByTema(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/subtemas/subtemabytema/' + codigo);
    }
    getDocumentosByInstitucion(codigo): Observable<any[]> {
        return this.http.GET<any[]>('/digesto/documentos/documentosbyinstitucio/' + codigo);
    }


}
