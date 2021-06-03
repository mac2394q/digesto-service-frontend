import { Utils } from "src/app/Utils/Util";

type InputType =
    | {
          type?: "text" | "hidden" | "number" | "date" | "textarea";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstrap y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {any} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Determina el valor por defecto de un input
           */
          value?: any;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {string} modalValue
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Los tipos modales en ocaciones ocupan este campo para setear valores seleccionados
           */
          modalValue?: string;

          /**
           * @param {boolean} required
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En datatables hace que un campo sea de obligatorio antes de modificarse o guardar.
           * En forms la aplicación debe ser manual
           */
          required?: boolean;

          /**
           * @param {boolean} readonly
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Solo funciona en DATATABLES, hace que un campo no se pueda modificar
           * si busca para FORMS, debe utilizar forceReadOnly en cambio.
           */
          readonly?: boolean;

          /**
           * @param {boolean} forceReadOnly
           * @param {tipo} opcional
           * @param {Uso} Forms
           * Solo funciona en FORMS y se usa para que un campo no sea utilizable.
           * Si desea usarlo en DATATABLES puede usar readonly en cambio.
           */
          forceReadonly?: boolean;

          /**
           * @param {string} style
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un style='' igual como si fuera HTML plano.
           */
          style?: string;

          /**
           * @param {boolean} ignoreJson
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Ignora un valor (no lo mandará en el objeto final al backend)
           */
          ignoreJson?: boolean;

          /**
           * @param {string} format
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un campo de una manera estructurada EJ:
           * money: 5000000 => 5.000.000 align right
           */
          format?: "none" | "money" | "cedula";

          /**
           * @param {number} textMaxSize
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea la cantidad máxima de caracteres que se puede escribir en un input
           */
          textMaxSize?: number;

          /**
           * @param {number} textMinSize
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea la cantidad mínima de caracteres que se puede escribir en un input
           */
          textMinSize?: number;

          /**
           * @param {Function} onChange
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al modificar un valor
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          onChange?: (cntxt?: any) => any;

          /**
           * @param {Function} onClick
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al presionar un input.
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          onClick?: (cntxt?: any) => any;

          /**
           * @param {boolean} clickOnLock
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * En Data Table no se puede clickear un boton sin antes desblockear el Detail view, este permite saltar esa limitación.
           */
          clickOnLock?: boolean;

          /**
           * @param {boolean} forceInputMode
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * En Data Tables los input son simplemente TEXTO PLANO, esto para no hacer más pesada la aplicación.
           * Sin embargo, en algunas ocaciones necesitamos que tenga SI o SI un campo input, esto forza la aplicación a renderizarlo.
           */
          forceInputMode?: boolean;

          /**
           * @param {boolean} dateTimeFormat
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * si se elige el formato @Java devolverá una fecha compatible con el DateFormat de Java (YYYY-MM-DDT00:00:00-ZONE)
           * si se elige el formato @Javascript devolverá un String plano que el backend no reconocerá (YYYY-MM-DD)
           * Por defecto se aplica el formato Java, de requerirse el normal debe setearse manualmente en cada HTMLInput.
           */
          dateTimeFormat?: "Java" | "JavaScript";
      }
    | {
          type?: "file";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * Arreglo de los formatos aceptados en el formulario
           * Ejemplo: [".doc",".docx","application/msword"]
           */
          acceptFormats?: string[];

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {boolean} required
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En datatables hace que un campo sea de obligatorio antes de modificarse o guardar.
           * En forms la aplicación debe ser manual
           */
          required?: boolean;

          /**
           * @param {boolean} readonly
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Solo funciona en DATATABLES, hace que un campo no se pueda modificar
           * si busca para FORMS, debe utilizar forceReadOnly en cambio.
           */
          readonly?: boolean;
      }
    | {
          type?: "button";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * @param {Function} buttonService
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al presionar un boton.
           * El contexto (opcional) devolverá la información del objeto que activó el Evento.
           * rowData: en Data Tables, devolverá la data de la fila seleccionada
           */
          buttonService?: (cntxt?: any, rowData?: any) => any;

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {any} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre del boton, de no setearse, tomará el alias.
           */
          value?: any;

          /**
           * @param {string} iconName
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un ícono por su nombre de material-icons
           * lista: https://material.io/resources/icons/?style=baseline
           */
          iconName?: string;

          /**
           * @param {string} style
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un style='' igual como si fuera HTML plano.
           */
          style?: string;

          /**
           * @param {string} style
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Hace que un boton se muestre deshabilitado del todo.
           */
          disabled?: boolean;

          /**
           * @param {string} style
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * estas son clases de CSS predefinidas para cambiar la forma de mostrar un botón.
           */
          btnType?: "btn-error" | "btn-success" | "";
      }
    | {
          type?: "detail";

          /**
           * @param {Function} detail
           * @param {tipo} opcional
           * @param {Uso} DataTable
           *
           * Es el encargado de abrir un DetailView proveniente de un Data Table
           */
          detailService?: (cntxt?: any) => any;

          /**
           * @param {Function} afterCall
           * @param {tipo} opcional
           * @param {Uso} DataTable
           *
           * Es un evento que se corre automáticamente luego de abrir un DetailView
           */
          afterCall?: () => any;
      }
    | {
          type?: "bootstrapColumn";

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Integra valores de Bootstrap dentro de un ROW para encajonar las columnas.
           */
          columnClass?:
              | "col-1"
              | "col-2"
              | "col-3"
              | "col-4"
              | "col-5"
              | "col-6"
              | "col-7"
              | "col-8"
              | "col-9"
              | "col-10"
              | "col-11"
              | "col-12"
              | "col-1 pr-0 pl-0"
              | "col-2 pr-0 pl-0"
              | "col-3 pr-0 pl-0"
              | "col-4 pr-0 pl-0"
              | "col-5 pr-0 pl-0"
              | "col-6 pr-0 pl-0"
              | "col-7 pr-0 pl-0"
              | "col-8 pr-0 pl-0"
              | "col-9 pr-0 pl-0"
              | "col-10 pr-0 pl-0"
              | "col-11 pr-0 pl-0"
              | "col-12 pr-0 pl-0"
              | string;
      }
    | {
          type?: "title" | "subtitle";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * @param {boolean} titleUnHide
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Un titulo por defecto es un acordión (capaz de contraerse) con esta propiedad
           * podemos declararlo abierto o cerrado por defecto
           */
          titleUnHide?: boolean;

          /**
           * @param {boolean} titleUnHide
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Un titulo por defecto es un acordión (capaz de contraerse) con esta propiedad
           * podemos declararlo abierto o cerrado por defecto
           */
          titleCollapsed?: boolean;

          /**
           * @param {sting} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * En los titulos el value vendría a ser el 'alias', o sea, el título del acordión.
           * esto recordando que un título en SIAM es un acordión (capaz de contraerse)
           */
          value?: string;

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;
      }
    | {
          type?: "select";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * @param {Function} selectService
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al seleccionar una opción
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          selectService?: (ctxt?: any) => any;

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {any} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Determina el valor por defecto de un input
           */
          value?: any;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {boolean} required
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En datatables hace que un campo sea de obligatorio antes de modificarse o guardar.
           * En forms la aplicación debe ser manual
           */
          required?: boolean;

          /**
           * @param {boolean} readonly
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Solo funciona en DATATABLES, hace que un campo no se pueda modificar
           * si busca para FORMS, debe utilizar forceReadOnly en cambio.
           */
          readonly?: boolean;

          /**
           * @param {boolean} forceReadOnly
           * @param {tipo} opcional
           * @param {Uso} Forms
           * Solo funciona en FORMS y se usa para que un campo no sea utilizable.
           * Si desea usarlo en DATATABLES puede usar readonly en cambio.
           */
          forceReadonly?: boolean;

          /**
           * @param {boolean} ignoreJson
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Ignora un valor (no lo mandará en el objeto final al backend)
           */
          ignoreJson?: boolean;

          /**
           * @param {Function} onChange
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al modificar un valor
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          onChange?: (cntxt?: any) => any;
      }
    | {
          type?: "checkbox";

          /**
           * @param {string} tooltip
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Muestra un texto que pretende ayudar al usuario en un proceso
           */
          tooltip?: string;

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {any} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Determina el valor por defecto de un input
           */
          value?: any;

          /**
           * @param {any} filterValue
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Las DataTables, por lo general tienen una función automática de ordenamiento.
           * como los checkbox se comportan normalmente como 'S'|'N', con @param filterValue
           * podemos asignarle otro valor ej: 'Pendiente'|'Aplicado' para que puedan filtrar con estos datos.
           */
          filterValue?: any;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {string} checkedValue
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * El valor que toma al chequear el checkbox - por defecto es 'S'
           */
          checkedValue?: any;

          /**
           * @param {string} uncheckedValue
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * El valor que toma al chequear el checkbox - por defecto es 'N'
           */
          uncheckedValue?: any;

          /**
           * @param {boolean} required
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En datatables hace que un campo sea de obligatorio antes de modificarse o guardar.
           * En forms la aplicación debe ser manual
           */
          required?: boolean;

          /**
           * @param {boolean} readonly
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Solo funciona en DATATABLES, hace que un campo no se pueda modificar
           * si busca para FORMS, debe utilizar forceReadOnly en cambio.
           */
          readonly?: boolean;

          /**
           * @param {boolean} forceReadOnly
           * @param {tipo} opcional
           * @param {Uso} Forms
           * Solo funciona en FORMS y se usa para que un campo no sea utilizable.
           * Si desea usarlo en DATATABLES puede usar readonly en cambio.
           */
          forceReadonly?: boolean;

          /**
           * @param {boolean} forceInputMode
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En Data Tables los input son simplemente TEXTO PLANO, esto para no hacer más pesada la aplicación.
           * Sin embargo, en algunas ocaciones necesitamos que tenga SI o SI un campo input, esto forza la aplicación a renderizarlo.
           */
          forceInputMode?: boolean;

          /**
           * @param {boolean} ignoreJson
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Ignora un valor (no lo mandará en el objeto final al backend)
           */
          ignoreJson?: boolean;

          /**
           * @param {string} checkLabel
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * El valor del label del checkbox con check - por defecto 'Presenta'
           */
          checkLabel?: string;

          /**
           * @param {string} uncheckLabel
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * El valor del label del checkbox sin check - por defecto 'No Presenta'
           */
          uncheckLabel?: string;

          /**
           * @param {string} checkClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * en algunas ocaciones queremos que el check se vea rojo como si algo no cumpliera,
           * podemos jugar con estas clases de CSS pre-definidas para ello.
           */
          checkClass?: "check-checked-red" | "check-checked";

          /**
           * @param {Function} onChange
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al modificar un valor
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          onChange?: (cntxt?: any) => any;
      }
    | {
          type?: "DTMixture" | "modal";

          /**
           * @param {string} columnClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           *
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          columnClass?: string;

          /**
           * @param {string} inputClass
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Aplica clases bootstra y/o custom a contenedores (columnas)
           */
          inputClass?: "text-center" | "text-right" | "text-left" | string;

          /**
           * @param {any} value
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Determina el valor por defecto de un input
           */
          value?: any;

          /**
           * @param {string} alias
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Viene a ser el nombre de la columna (label)
           */
          alias?: string;

          /**
           * @param {Function} modalService
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Carga los valores que contendrá un modal
           */
          modalService?: (cntxt?: any) => any;

          /**
           * @param {Function} modalValue
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Sin un modal es un tipo Mixture podemos usar esta propiedad, para que adquiera un valor del mismo modal.
           */
          modalValue?: string;

          /**
           * @param {Function} modalWidth
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * El ancho del modal por defecto
           */
          modalWidth?: string;

          /**
           * @param {Function} modalReturnType
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * el tipo de modal que cargará:
           * Forms: un formulario dentro del modal
           * Data Table: una tabla clickeable para cargar valores en los inputs.
           * Mixture: es un Data Tabla que es llamado desde un group-button (input + modal)
           */
          modalReturnType?: "Forms" | "Data Table" | "Mixture";

          /**
           * @param {boolean} required
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * En datatables hace que un campo sea de obligatorio antes de modificarse o guardar.
           * En forms la aplicación debe ser manual
           */
          required?: boolean;

          /**
           * @param {boolean} readonly
           * @param {tipo} opcional
           * @param {Uso} DataTable
           * Solo funciona en DATATABLES, hace que un campo no se pueda modificar
           * si busca para FORMS, debe utilizar forceReadOnly en cambio.
           */
          readonly?: boolean;

          /**
           * @param {string} style
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un style='' igual como si fuera HTML plano.
           */
          style?: string;

          /**
           * @param {Function} onChange
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Evento que ocurre al modificar un valor
           * El contexto (opcional) devolverá la información del objeto que activó el Evento
           */
          onChange?: (cntxt?: any) => any;

          /**
           * @param {string} iconName
           * @param {tipo} opcional
           * @param {Uso} Forms.DataTable
           * Setea un ícono por su nombre de material-icons
           * lista: https://material.io/resources/icons/?style=baseline
           */
          iconName?: string;
      };

export class HTMLInput {
    type?:
        | "hidden"
        | "text"
        | "number"
        | "date"
        | "detail"
        | "title"
        | "subtitle"
        | "modal"
        | "select"
        | "checkbox"
        | "DTMixture"
        | "button"
        | "textarea";
    btnType?: "btn-error" | "btn-success" | "";
    columnClass?: string;
    inputClass?: "text-center" | "text-right" | "text-left" | string;

    value?: any;
    filterValue?: any;
    alias?: string;
    style?: string;
    titleUnHide?: boolean;
    titleCollapsed?: boolean;
    modalValue?: string;
    modalWidth?: number | string;
    modalReturnType?: "Forms" | "Data Table" | "Mixture";
    modalService?: (cntxt?: any) => any;
    detailService?: (cntxt?: any) => any;
    afterCall?: () => any;
    selectService?: (ctxt?: any) => any;
    buttonService?: (cntxt?: any) => any;
    checkedValue?: any;
    uncheckedValue?: any;
    checkLabel?: string;
    uncheckLabel?: string;
    checkClass?: "check-checked-red" | "check-checked";
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    forceReadonly?: boolean;
    iconName?: boolean;
    ignoreJson?: boolean;
    format?: "none" | "money" | "cedula";
    onChange?: (cntxt?: any) => any;
    onClick?: (cntxt?: any) => any;
    clickOnLock?: boolean;
    forceInputMode?: boolean;
    textMaxSize?: number;
    textMinSize?: number;
    dateTimeFormat?: "Java" | "JavaScript";
    acceptFormats?: string[];
    tooltip?: string;

    constructor(element: InputType) {
        const ele = element as any;
        this.type = ele.type ?? "text";

        this.modalValue = ele.modalValue ?? null;
        this.value = ele.value ?? "";
        this.alias = ele.alias ?? "";
        this.columnClass = ele.columnClass ?? null;
        this.inputClass = ele.inputClass ?? null;
        this.detailService = ele.detailService ?? null;
        this.afterCall = ele.afterCall ?? null;
        this.selectService = ele.selectService ?? null;
        this.buttonService = ele.buttonService ?? null;
        this.btnType = ele.btnType ?? "";
        this.modalWidth = ele.modalWidth ?? null;
        this.modalService = ele.modalService ?? null;
        this.modalReturnType = ele.modalReturnType ?? "Data Table";
        this.titleUnHide = ele.titleUnHide ?? false;
        this.titleCollapsed = ele.titleCollapsed ?? false;
        this.checkedValue = ele.checkedValue ?? "S";
        this.uncheckedValue = ele.uncheckedValue ?? "N";
        this.checkClass = ele.checkClass ?? "check-checked";
        this.required = ele.required ?? false;
        this.readonly = ele.readonly ?? false;
        this.forceReadonly = ele.forceReadonly ?? false;
        this.iconName = ele.iconName ?? null;
        this.style = ele.style ?? null;
        this.ignoreJson = ele.ignoreJson ?? false;
        this.onChange = ele.onChange ?? null;
        this.onClick = ele.onClick ?? null;
        this.clickOnLock = ele.clickOnLock ?? false;
        this.format = ele.format ?? "none";
        this.filterValue = ele.filterValue ?? null;
        this.checkLabel = ele.checkLabel ?? "Presenta";
        this.uncheckLabel = ele.uncheckLabel ?? "No presenta";
        this.disabled = ele.disabled ?? false;
        this.forceInputMode = ele.forceInputMode ?? false;
        this.textMaxSize = ele.textMaxSize ?? 4000;
        this.textMinSize = ele.textMinSize ?? 0;
        this.dateTimeFormat = ele.dateTimeFormat ?? "Java";
        this.acceptFormats = ele.acceptFormats ?? [];
        this.tooltip = ele.tooltip ?? null;
    }

    push?(push: pushObject) {
        this[`${push.key}`] = push.value;
        return push.util.deepCopy(this);
    }
}

/**
 * Llamada iterativa del openDetailInfoExtended
 * @param orquestaType: 'Data Table' | 'Form' en algunas ocaciones debemos trabajar de manera separada, esto nos ayuda para no tener que cambiar todo el codigo
 * @param key llave a buscar.
 * @param dataSource la información por defecto de la tabla
 * @param hasTitle cierra o abre un título.
 * @param primary Si es un arreglo, deberá recorrer el arreglo en lugar del objeto inicial.
 * @param newItem Si es un nuevo item o es un item a modificar.
 * @param detailData data del detalle
 */
export interface Orquesta {
    orquestaType: "Data Table" | "Form";
    key: any;
    dataSource: any;
    hasTitle: boolean;
    hasCol: boolean;
    primary: any | null;
    newItem: boolean;
    detailData: any;
    columnId: number;
}

/**
 * Interface usada para manejar formularios y/o modales.
 * en una pantalla si existen N > 0 cantidad de formularios y/o modales
 * cada uno deberá utilizar un formClass específico.
 *
 * En el caso de los modales también debe de llevar un formId específico.
 */

export interface HTMLForm {
    /**
     * @param Modales_y_Forms
     * Determina las clases que pueden ser usadas para crear modales
     */
    formClass: formClassType;

    /**
     * @param Modales_y_Forms
     * Función para llenar los forms y modales
     */
    formData: (cntxt?: any) => any;

    /**
     * @param Forms
     * Declaramos que un form esté escondido o mostrado al renderizar una pantalla
     * por defecto @show
     */
    initialState?: "show" | "hide";

    /**
     * @param Modales
     * Si son modales requiere definir el id del modal
     */
    formId?:
        | "uModal"
        | "uModal1"
        | "uModal2"
        | "uModal3"
        | "uModal4"
        | "uModal5"
        | "uModal6"
        | "uModal7"
        | "uModal8"
        | string;

    /**
     * @param Modales
     * Si son modales podemos definir el tamaño del height de este
     */
    formMaxHeight?: string;
}

export interface pushObject {
    key: string;
    value: any;
    util: Utils;
}

/**
 * JSON Object type
 * para no utilizar any
 */
export type JSONResponse = [number, string];

/**
 * Almacena las clases predeterminadas del sistema
 */
export const formClasses = [
    "formControl",
    "formControlDetail",
    "formControlDetail1",
    "formControlDetail2",
    "formControlDetail3",
    "formControlDetail4",
    "formControlDetail5",
    "formControlDetail6",
    "formControlDetail7",
    "formControlDetail8",
] as const;

/**
 * Convierte las clases predetminadas del sistema a "types"
 * para que puedan ser utilizadas como definición
 */
export type formClassType = typeof formClasses[number];

/**
 * Aquí sobreescribimos o creamos métodos a nivel nativo
 */
declare global {
    interface Array<T> {
        /**
         * Incluye un elemento en un array únicamente si este no existe en el arreglo
         */
        pushIfNotExist: (element: any) => void;
    }

    interface Function {
        clone: () => () => any;
    }

    interface Number {
        /**
         * Chequea si el substring se encuentra en el arreglo
         * (si el valor izquierdo se encuentra en el derecho)
         * const str: string = 'Hola probando in';
         * str.in(['hi', 'in']); => devolverá true ya que encontrará in
         */
        in: (arrList: Array<number>) => boolean;
    }

    interface String {
        /**
         * Transfoma un String para que la primera letra sea Mayúscula.
         */
        capitalize: Function;

        /**
         * Reemplaza todos los valores (find) por (replace)
         * colnst str: string = 'tabla_de_datos';
         * str.replaceAll(_, ' ') => devolverá 'tabla de datos'
         *
         */
        replaceAll: (find: any, replace: any) => any;

        /**
         * Chequea si el substring se encuentra en el arreglo
         * (si el valor izquierdo se encuentra en el derecho)
         * const str: string = 'Hola probando in';
         * str.in(['hi', 'in']); => devolverá true ya que encontrará in
         */
        in: (arrList: Array<any>) => boolean;

        /**
         * si es "" o no
         */
        isEmpty: () => boolean;
    }

    interface DOMTokenList {
        /**
         * Retorna si algun token del arreglo esta presente (true), o no (false)
         */
        containsAny(tokens: Readonly<any>): boolean;
    }
}

Array.prototype.pushIfNotExist = function (element) {
    if (this.indexOf(element) === -1) {
        this.push(element);
    }
};

Function.prototype.clone = function () {
    var that = this;
    var temp = function temporary() {
        return that.apply(this, arguments);
    };
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.replaceAll = function (find, replace) {
    const str = this;
    return str.replace(new RegExp(find, "g"), replace);
};

String.prototype.in = function (arrList: Array<any>): boolean {
    const str = this;
    let encontrado = false;
    if (arrList === null || typeof arrList === "undefined") return encontrado;

    for (const ele of arrList) {
        if (str.indexOf(ele) !== -1) {
            encontrado = true;
            break;
        }
    }
    return encontrado;
};

Number.prototype.in = function (arrList: Array<number>): boolean {
    const str = this;
    let encontrado = false;
    if (arrList === null || typeof arrList === "undefined") return encontrado;

    for (const ele of arrList) {
        if (str.indexOf(ele) !== -1) {
            encontrado = true;
            break;
        }
    }
    return encontrado;
};

String.prototype.isEmpty = function (): boolean {
    return this === "";
};

DOMTokenList.prototype.containsAny = function (tokens: Readonly<any>): boolean {
    let founded = false;
    for (const token of tokens as Array<any>) {
        if (this.contains(token)) {
            founded = true;
            break;
        }
    }

    return founded;
};
