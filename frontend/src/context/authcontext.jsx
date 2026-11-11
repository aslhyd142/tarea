/**
 * contexto global de autenticacion permite que cualquier
 * componente de la app (sidebar, navbar, paginas protegidas y demas)
 * sepa si hay un usuario logueado quien es y pueda cerrar sesion
 * sin tener que pasar esa info "a mano" del componente en
 * componente (eso se llama "prop drilling" y el context lo evita)
 */

// createContext: crea el contexto; useContext: lo consume; useEffect:
// codigo que corre en momentos especificos del ciclo de vida; useState:
// estado local del componente
import {createContext,useContext,useEffect,useState }from"react";

// Funcion que llama al backend para validar email/password
import { iniciarSesion }from"../api/authService";

// 1) creamos el contexto (una especie de caja compartida)
const AuthContext = createContext(null);
// 2) componente proveedor: envuelve la app y le da acceso
// // Hijos acceso al valor de autenticacion actual
export function AuthProvider({ children }) {
    // //Guardar datos publicos del usuario logueado (o null si no hay sesion)
    const[usuario, setUsuario]=useState(null);
}
//cargando: true mientras revisamos si ya haba una sesion guardada 
//en el localStorage (por ejemplo al recargar la pagina con F5)
const[cargando, setCargando]=useState(true);
//useEffect con arreglo vacio[]-> se ejecuta UNA sola vez,
//justo cuando la app arranca 
useEffect(()=>{
 const usuarioGuardado = 
 localStorage.getItem('usuario');
 const tokenGuardado = localStorage. getItem('token');
 //si el localstorage hay usuario y token de una sesion anterior,
//restauramos esa sesion sin obligar a volver a hacer login
if(usuarioGuardado && tokenGuardado){
    setUsuario(JSON.parse(usuarioGuardado));
}
 setCargando(false);
},[]);

//funcion de login: la llama loginPage cuando el usuario envia el formulario
async function login (email,password){
    //puede lanzar un error (por ejempl credenciales invalidas)
    // dejamos que loginpage lo capture con try/catch para mostrar el mensaje 
    const { token, usuario: Usuariorecibido }= await iniciarSesion(email,password);
    // guardamos la sesion en el LocalStorage para que sobreviva a un F5
    localStorage.setItem('token',token);
    localStorage.setItem('usuario',JSON.stringify(Usuariorecibido));
    //actualizamos el estado en memoria para la UI reaccione al instante
    setUsuario(Usuariorecibido)
    //funcion de logout borra la sesion tanto del localStorage como el estado 
    function logout (){
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    }
      //valor que va a estar disponible  para cualquier componente que use aseAuth()
      const value={
        usuario,
        cargando,
        estaAutenticado:!!usuario,//convierte usuario (objeto o null)en true o false 
        login,
        logout
      };
      //todo lo que esta dentro del <Authprovider>...</Authprovider> o sea
      //children, toda la app puede leer value con useAuth()
      return <AuthContext.Provider value={value}> </AuthContext.Provider>;
}
/**
 * hook personalizadooo para consumir el contexto mas facil:
 * en vex de useContext (Authcontext) lo componentes hacen useAuth().
 */
export function useAuth(){
    //lee el valor actual del contexto (usuario, cargando, login, logout)
    const contexto = useContext (AuthContext);
    // si alguien usa useAuth  fuera de <AuthProvider> contexto seria null: 
    //avisamos con un error claro en vez de fallar mas adelante en forma confusa
    if (!contexto){
        throw new Error ('useAuth debe usarse dentro de un <AuthProvider>');
    }
}
