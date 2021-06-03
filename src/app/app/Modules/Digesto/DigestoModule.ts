import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EjemploComponent } from './Views/movimientos/empleados/ejemplo-no-funcional.component';
import { DigestoService } from "./Service/digesto";
import { SharedModule } from '../Compartido/sharedModule';



import { CategoriasComponent } from "./Views/digesto/categorias/categorias.component";
import { SubcategoriaComponent } from "./Views/digesto/subcategoria/subcategoria.component";
import { TemasComponent } from "./Views/digesto/temas/temas.component";
import { SubtemasComponent } from "./Views/digesto/subtemas/subtemas.component";
import { DocumentosComponent } from "./Views/digesto/documentos/documentos.component";
import { InstitucionesComponent } from "./Views/digesto/instituciones/instituciones.component";


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
    ],
    declarations: [

        
        EjemploComponent,
       
         CategoriasComponent,
 
         SubcategoriaComponent,
 
         TemasComponent,
 
         SubtemasComponent,
 
         DocumentosComponent,
 
         InstitucionesComponent,
 
    ],
    providers: [DigestoService]
})
export class DigestoModule { }

