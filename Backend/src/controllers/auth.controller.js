
/**
 * Aqui vive la logica de negocio del login:
 * recibir email y contraseña, buscar el usuario en MySQL,
 * comparar la contraseña encriptada y devolver un token JWT
 * si todo es correcto.
 *
 * Las rutas (auth.routes.js) solo dicen: cuando llegue tal
 * peticion, llama a esta funcion. La logica en si va aca (CRUD).
 */

// Libreria para encriptar y comparar la contraseña
const bcrypt = require('bcryptjs');

// Libreria para crear (firmar) tokens JWT de sesion
const jwt = require('jsonwebtoken');

// Pool para conexiones MySQL configurado en config/db.js
const pool = require('../config/db');

// Carga las variables de .env (JWT_SECRET, JWT_EXPIRES_IN)
require('dotenv').config();

// POST /api/auth/login
// Recibe { email, password } y devuelve { token, usuario }
// si son correctos.
async function login(req, res) {
    try {
        // Cuerpo (body) de la peticion,
        // que express.json() convierte a objeto de JavaScript
        const { email, password } = req.body;

        // 1. Validacion basica: que no llegue el formulario vacio
        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorias'
            });
        }

        // 2. Buscar el usuario por el email en la tabla usuarios
        // Usamos "?" en la consulta (no concatenamos el email directo)
        // para evitar inyeccion SQL; mysql2 se encarga de escaparlo
        const [filas] = await pool.query(
            'SELECT id, nombre, email, password, rol, estado FROM usuarios WHERE email = ? LIMIT 1',
            [email]
        );

        // Si no encontro correo, ninguna fila
        // El correo no existe
        if (filas.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        // pool.query con SELECT devuelve un arreglo de filas;
        // como buscamos por email (unico), nos quedamos con la primera fila
        const usuario = filas[0];

        // Si el usuario fue desactivado no dejamos iniciar sesion,
        // aunque la contraseña sea correcta
        if (usuario.estado === 0) {
            return res.status(403).json({
                mensaje: 'Este usuario esta desactivado. Contacte al administrador'
            });
        }

        /**
         * Comparar la contraseña que envio el formulario con el hash
         * guardado en la base de datos.
         * bcrypt.compare vuelve a aplicar el mismo algoritmo y revisa
         * si el resultado coincide. La contraseña original nunca
         * se puede desencriptar.
         */

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        /**
         * Generar el token JWT que el frontend guardara para
         * demostrar, en cada peticion futura, que ya inicio sesion.
         */

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            }, // Datos dentro del token
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h'
            } // Tiempo de vida del token
        );

        /**
         * Responder con el token y los datos publicos del usuario.
         * Nunca se devuelve el hash de la contraseña al frontend.
         */

        return res.json({
            token,
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        // Cualquier error inesperado (por ejemplo, MySQL apagado)
        // cae aqui en vez de tumbar el servidor
        console.error('Error en login:', error);

        return res.status(500).json({
            mensaje: 'Error del servidor al iniciar sesion'
        });
    }
}

// GET /api/auth/perfil
// Ruta protegida de ejemplo. Solo responde a personas si el middleware
// verificarToken confirmo que el token es valido.
async function perfil(req, res) {

    // req.usuario fue puesto por el middleware verificarToken
    return res.json({
        usuario: req.usuario
    });
}

// Exportamos ambas funciones para que auth.routes.js
// pueda conectarlas con las URLs correspondientes
module.exports = {
    login,
    perfil
};
