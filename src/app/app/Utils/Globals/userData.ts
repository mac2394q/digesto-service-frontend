export class UserData {
    /**
     * @param username = Sera el usuario sin codificar (sin _ o caracteres especiales)
     * usado para mostrar el nombre completo del usuario.
     * Ejemplo: JORGE VASQUEZ
     */
    public username: string;

    /**
     * @param password = almacena la clave codificada del usuario (no se puede descodificar)
     * utilizada solo para validación de JWT
     */
    private password: string;

    /**
     * @param roles = almacena los roles que presenta el usuario
     */
    public roles: string[];

    /**
     * Representa la sesión activa con el backend
     */
    public jwtToken: string;

    /**
     * Indica el estado de la sesión
     */
    public sessionExpire: number;

    /**
     * @param realUserName = usuario de logueo ej. JORGE_VASQUEZ
     */
    public realUserName: string;

    /**
     * 8 Horas, en el backend, se setea 30000000 para redondear 8:30 horas..
     * Indica el Time to live (TTL) del jwtToken
     */
    private TTL = 28800000;

    constructor(username: string, password: string, roles: any[], token: string, sessionExpire: number, realUser: string) {
        this.username = username;
        this.password = password;
        this.roles = roles.map(obj => obj.role);
        this.roles.push('ROLE_PUBLIC_ACCESS');
        this.jwtToken = token;
        this.sessionExpire = (sessionExpire + this.TTL);
        this.realUserName = realUser;
    }
}

