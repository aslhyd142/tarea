// Ayuda a detectar errores comunes en el desarrollo
import { StrictMode } from 'react';

// Crea la función de React 18 o superior para montar la aplicación en el DOM
import { createRoot } from 'react-dom/client'

// Habilita el manejo de las rutas basado en la URL del navegador
import { BrowserRouter } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
// Estilos de Bootstrap clases como btn,container, table y demas
import 'bootstrap/dist/css/bootstrap-icons.css'

// JavaScript de Bootstrap necesario para los modales
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Estilos propios del proyecto
import './index.css'

// Componente raíz con todas las rutas de la aplicación
import App from './App.jsx'

// Proveedor con contexto de sesión
import { AuthProvider } from './context/authcontext.jsx';

// Busca el div con id="root" de index.html y monta React ahí

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter habilita la navegación por URL */}
    <BrowserRouter>
      {/* AuthProvider comparte con toda la aplicación quién es el usuario logueado */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)