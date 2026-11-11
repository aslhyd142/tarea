
/**
 * Define las URLS (endpoints) relacionadas con autenticacion.
 * Las conecta con su funcion controladora correspondiente.
 */

// Framework del servidor
const express = require('express');

// Router: mini servidor de rutas que despues se montan en server.js
// con un app.use('/api/auth', authRoutes).
const router = express.Router();

// Funciones controladoras con la logica real de cada endpoint
const { login, perfil } = require('../controllers/auth.controller');

// Middleware que protege rutas exigiendo un token JWT valido
const verificartoken = require('../middlewares/verificartoken');

// POST /api/auth/login = iniciar sesion (ruta publica)
router.post('/login', login);

// GET /api/auth/perfil = devuelve los datos del usuario logueado
// Ruta protegida: pasa primero por verificartoken
router.get('/perfil', verificartoken, perfil);

// Exportamos las rutas
module.exports = router;
