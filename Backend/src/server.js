
/**
 * Punto de entrada del backend.
 * Aqui se crea la aplicacion de Express, se configuran los middleware
 * globales (cors, json) y se montan las rutas.
 * Al final, el servidor queda escuchando peticiones por el puerto
 * definido en .env (por defecto el 4000).
 */

// Framework para crear el servidor HTTP y definir rutas
const express = require('express');

// Middleware que habilita CORS (peticiones desde otro origen o puerto)
const cors = require('cors');

// Lee el archivo .env y carga sus valores en process.env
require('dotenv').config();

// Importamos el router con los endpoints de autenticacion (login y perfil)
const authroutes = require('./routes/auth.routes');

// Creamos la aplicacion Express
const app = express();

// cors() permite que el frontend (que corre en otro puerto)
// pueda hacer peticiones a este backend sin que el navegador lo bloquee
app.use(cors());

// express.json() le ensena a Express a leer el body de las peticiones
// cuando viene en formato JSON. Asi podemos leer req.body.email, etc.
app.use(express.json());

// Ruta de salud simple, util para probar que el servidor esta vivo
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api de inventario React funcionando correctamente'
    });
});

// Todas las rutas que empiecen con /api/auth
// se resuelven en auth.routes.js
app.use('/api/auth', authroutes);

// Middleware para rutas que no existen (404)
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada'
    });
});

// Tomamos el puerto desde .env o 4000 si no esta definido
const PORT = process.env.PORT || 4000;

// Arranca el servidor a partir de aqui
// Express queda escuchando peticiones HTTP en el puerto indicado
// hasta que se detenga el proceso
app.listen(PORT, () => {

    // Este callback se ejecuta una vez cuando el servidor este listo
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

});
