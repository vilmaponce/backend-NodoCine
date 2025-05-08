# 🎬 NodoCine Backend - API para Plataforma de Streaming

Este proyecto implementa el backend para NodoCine, una plataforma de streaming inspirada en Netflix que permite gestionar usuarios, perfiles y películas.

## 🌐 Despliegue

- **API URL**: [https://nodocine-backend.onrender.com/](https://nodocine-backend.onrender.com/)
- **Frontend**: [https://frontend-nodo-cine-odwj.vercel.app/](https://frontend-nodo-cine-odwj.vercel.app/)

## 🧪 Credenciales de prueba

- **Administrador**:
  - Email: admin@admin.com
  - Contraseña: admin123
  - **Usuario**: FAMILIA - VER EN READMEN FRONTEND

## 🚀 Características

- **Autenticación y Autorización**
  - Registro e inicio de sesión de usuarios
  - Gestión de tokens JWT
  - Diferentes niveles de acceso (administrador, usuario, perfil infantil)

- **Gestión de Usuarios**
  - Creación de cuentas familiares
  - Manejo de permisos y roles

- **Gestión de Perfiles**
  - Perfiles múltiples por cuenta
  - Perfiles infantiles con restricciones
  - Watchlist personalizada por perfil

- **Gestión de Películas**
  - Catálogo completo
  - Búsqueda y filtrado
  - Información detallada de películas
  - Integración con OMDB API

- **Almacenamiento de Archivos**
  - Gestión de imágenes de perfil
  - Gestión de imágenes de películas

## 🛠️ Tecnologías

- **Node.js**
- **Express**
- **MongoDB y Mongoose**
- **JWT para autenticación**
- **Multer para gestión de archivos**
- **Axios para comunicación con APIs externas**

## 📋 Requisitos previos

- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- Una cuenta en [OMDB API](https://www.omdbapi.com/) para obtener una API key

## ⚙️ Instalación y configuración

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/
   cd nodo-cine-backend
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Crea un archivo .env en la raíz del proyecto:**
   ```
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/NodoCine
   DB_NAME=NodoCine
   
   # Server
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   API_BASE_URL=http://localhost:3001
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=tu_secreto_jwt
   
   # OMDB API
   OMDB_API_KEY=tu_clave_api_omdb
   ```

4. **Inicia el servidor:**
   ```bash
   npm start
   ```
   Para desarrollo, usa:
   ```bash
   npm run dev
   ```

5. **El servidor estará funcionando en:**
   ```
   http://localhost:3001
   ```

## 🚀 Despliegue en Render

1. Crea una cuenta en [Render](https://render.com/)
2. Crea un nuevo Web Service y conecta tu repositorio de GitHub
3. Configura las siguientes variables de entorno:
   ```
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/NodoCine
   DB_NAME=NodoCine
   PORT=3001
   FRONTEND_URL=https://tu-frontend.netlify.app
   API_BASE_URL=https://tu-backend.onrender.com
   NODE_ENV=production
   JWT_SECRET=tu_secreto_jwt
   OMDB_API_KEY=tu_clave_api_omdb
   ```
4. Configura el Build Command como `npm install`
5. Configura el Start Command como `npm start`

## 📚 Estructura de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Usuarios
- `GET /api/users/me` - Obtener perfil del usuario autenticado

### Perfiles
- `GET /api/profiles` - Obtener todos los perfiles (admin)
- `GET /api/profiles/user/:userId` - Obtener perfiles por ID de usuario
- `POST /api/profiles` - Crear nuevo perfil
- `PUT /api/profiles/:id` - Actualizar perfil
- `DELETE /api/profiles/:id` - Eliminar perfil

### Watchlist
- `GET /api/profiles/:id/watchlist` - Obtener watchlist del perfil
- `POST /api/profiles/:id/watchlist` - Añadir película a watchlist
- `DELETE /api/profiles/:id/watchlist/:movieId` - Eliminar película de watchlist

### Películas
- `GET /api/movies` - Obtener todas las películas
- `GET /api/movies/:id` - Obtener película por ID
- `POST /api/movies` - Crear nueva película (admin)
- `PUT /api/movies/:id` - Actualizar película (admin)
- `DELETE /api/movies/:id` - Eliminar película (admin)

## 📝 Pendientes y mejoras futuras
- Implementación de paginación en las respuestas
- Optimización de consultas a la base de datos
- Pruebas automatizadas

## 👥 Autor

- **VILMA PONCE** - [GitHub](https://github.com/vilmaponce)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.