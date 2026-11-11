
/**
 * Verificar token utiliza la funcion middleware de Express.
 * Es una funcion que se ejecuta ANTES de llegar a la ruta
 * protegida, por ejemplo un GET.
 * Su trabajo es revisar que la peticion traiga un token.
 */

// Libreria para crear y verificar tokens JWT
const jwt = require('jsonwebtoken');

require('dotenv').config();

// req: la peticion entrante;
// res: la respuesta;
// next: funcion que continua la cadena de middleware / controlador
// si todo esta bien.

function verificartoken(req, res, next) {

    // El frontend debe enviar el token en el header:
    // Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];

    // Si no viene el header no hay sesion:
    // rechazamos la peticion
    if (!authHeader) {
        return res.status(401).json({
            mensaje: 'No se envio un token de autenticacion'
        });
    }

    // authHeader tiene el formato "Bearer eyJhbGciOi".
    // Nos quedamos con la segunda parte: el token real.
    const token = authHeader.split(' ')[1];

    // Si el header vino mal formado, por ejemplo sin la palabra
    // Bearer, el token queda undefined y tampoco dejamos pasar la peticion.
    if (!token) {
        return res.status(401).json({
            mensaje: 'Formato de token invalido'
        });
    }

    // Todo lo que pueda fallar (token invalido, expirado o alterado)
    // se maneja dentro de este try/catch.
    try {

        // jwt.verify valida la firma del token con el mismo secreto
        // que se uso para crearlo (JWT_SECRET) y revisa que no haya expirado.
        const datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardamos los datos decodificados del usuario en req.usuario
        // para que la siguiente funcion (el controlador) pueda usarlos.
        req.usuario = datosUsuario;

        // next() le dice a Express que todo esta bien,
        // continua con la siguiente funcion.
        next();

    } catch (error) {

        // Si el token esta vencido o fue alterado,
        // jwt.verify lanza un error.
        return res.status(401).json({
            mensaje: 'Token invalido o expirado'
        });
    }
}

// Exportamos el middleware
module.exports = verificartoken;
