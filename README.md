# AspirantePRO 📚

**Plataforma educativa boliviana para la preparación de ingreso a las Escuelas Superiores de Formación de Maestros (ESFM)**

Esta es una aplicación web completa (Full-Stack) que incluye:
- 🎨 Landing page moderna con diseño glassmorphism
- 🔐 Sistema de autenticación con JWT
- 💳 Pasarela de pago con QR
- 📖 Biblioteca digital de libros
- ✅ Banco de exámenes pasados resueltos
- 🎯 Simuladores interactivos con cronómetro
- 👥 Panel de administración completo
- 📊 Sistema de reportes y estadísticas

## 🏗️ Arquitectura Técnica

### Frontend
- **Framework**: Next.js 14
- **Estilos**: Tailwind CSS
- **Fuentes**: Montserrat y Poppins
- **Iconos**: Google Material Symbols
- **Animaciones**: AOS Library
- **Estado**: React Context API
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js con Express
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Manejo de Archivos**: Multer
- **Validación**: Express Validator

### Colores del Diseño
- **Primario**: #1e3a8a (Azul)
- **Secundario**: #3b82f6 (Azul claro)
- **Acento**: #fbbf24 (Dorado)

## 📦 Estructura del Proyecto

```
AspirantePRO/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/         # Configuraciones (DB, upload)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Rutas de la API
│   │   └── utils/          # Utilidades
│   └── package.json
│
├── frontend/               # Aplicación Next.js
│   ├── components/         # Componentes React
│   │   ├── Layout/        # Layouts (Dashboard, Admin)
│   │   ├── Auth/          # Componentes de autenticación
│   │   └── ...
│   ├── lib/               # Utilidades (axios, context)
│   ├── pages/             # Páginas de Next.js
│   │   ├── auth/          # Login, registro, pago
│   │   ├── dashboard/     # Panel de usuario
│   │   ├── admin/         # Panel de administración
│   │   └── ...
│   ├── public/            # Archivos estáticos
│   ├── styles/            # Estilos globales
│   └── package.json
│
├── index.html             # Landing page original
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- MongoDB 6+ (local o MongoDB Atlas)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone https://github.com/aldairjoss2001/AspirantePRO.git
cd AspirantePRO
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/aspirantepro
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

Iniciar el servidor:
```bash
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env.local` basado en `.env.local.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Iniciar la aplicación:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 4. Crear Usuario Administrador

Puedes crear un usuario administrador usando MongoDB Compass o mongosh:

```javascript
// Conectar a MongoDB
use aspirantepro

// Crear admin (el password será hasheado automáticamente al login)
db.users.insertOne({
  nombre_completo: "Administrador",
  email: "admin@aspirantepro.com",
  password: "$2a$10$xyz...", // Usa bcrypt para hashear "Admin123!"
  rol: "admin",
  status_pago: "activo",
  fecha_registro: new Date()
})
```

O registrarte normalmente y cambiar el rol en la base de datos:
```javascript
db.users.updateOne(
  { email: "tu-email@ejemplo.com" },
  { $set: { rol: "admin", status_pago: "activo" } }
)
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/upload-comprobante` - Subir comprobante de pago
- `PUT /api/auth/update-password` - Actualizar contraseña

### Usuarios
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/photo` - Actualizar foto de perfil
- `GET /api/users/stats` - Obtener estadísticas del usuario

### Contenido (requiere acceso activo)
- `GET /api/content` - Listar contenido (libros, exámenes)
- `GET /api/content/:id` - Obtener contenido específico
- `GET /api/content/categories` - Obtener categorías
- `GET /api/quizzes` - Obtener preguntas para simulacro
- `POST /api/quizzes/check` - Verificar respuestas
- `GET /api/notifications` - Obtener notificaciones activas

### Admin (requiere rol admin)
- `GET /api/admin/users` - Listar todos los usuarios
- `PUT /api/admin/users/:id/payment-status` - Actualizar estado de pago
- `PUT /api/admin/users/:id/toggle-access` - Activar/desactivar usuario
- `POST /api/admin/content` - Crear contenido
- `PUT /api/admin/content/:id` - Actualizar contenido
- `DELETE /api/admin/content/:id` - Eliminar contenido
- `POST /api/admin/quizzes` - Crear pregunta
- `PUT /api/admin/quizzes/:id` - Actualizar pregunta
- `DELETE /api/admin/quizzes/:id` - Eliminar pregunta
- `GET /api/admin/stats` - Obtener estadísticas del dashboard
- `POST /api/admin/notifications` - Crear notificación
- `PUT /api/admin/notifications/:id` - Actualizar notificación
- `DELETE /api/admin/notifications/:id` - Eliminar notificación

## 🔐 Roles y Permisos

### Estudiante
- Acceso al dashboard
- Visualización de contenido (si pagó)
- Realizar simulacros
- Actualizar perfil

### Administrador
- Acceso total al panel de administración
- Gestión de usuarios y pagos
- Gestión de contenido (CRUD)
- Gestión de preguntas de quiz
- Envío de notificaciones globales
- Visualización de reportes y estadísticas

## 💳 Flujo de Pago

1. Usuario se registra (estado: `pendiente`)
2. Usuario accede a la página de pago
3. Usuario escanea QR y sube comprobante (estado: `validando`)
4. Admin revisa y aprueba el pago (estado: `activo`)
5. Usuario obtiene acceso completo al contenido

## 📱 Características Principales

### Para Estudiantes
- ✅ Dashboard intuitivo con progreso
- 📚 Biblioteca digital con PDFs descargables
- 📝 Exámenes pasados con explicaciones
- ⏱️ Simuladores con cronómetro real
- 💬 Soporte por WhatsApp (botón flotante)
- 👤 Gestión de perfil

### Para Administradores
- 📊 Dashboard con estadísticas en tiempo real
- 👥 Gestión de usuarios y validación de pagos
- 📁 CMS para subir contenido
- ❓ Editor de preguntas de simulacro
- 📢 Sistema de notificaciones globales
- 💰 Reporte de ingresos

## 🎨 Diseño y UX

El diseño está inspirado en plataformas educativas modernas como Platzi y Coursera:
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Sidebar colapsable**: Navegación optimizada
- **Responsive**: Mobile First
- **Animaciones**: Transiciones suaves con AOS
- **Efectos shine**: Botones interactivos

## 🔧 Tecnologías Utilizadas

### Backend
- Express.js
- Mongoose (ODM)
- bcryptjs (encriptación)
- jsonwebtoken (JWT)
- multer (upload de archivos)
- cors
- dotenv

### Frontend
- Next.js
- React 18
- Tailwind CSS
- Axios
- js-cookie
- react-icons

## 📄 Licencia

Este proyecto fue creado para AspirantePro Bolivia.

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, contacta a través de WhatsApp: +591 7890 1234
