# Guía de Inicio Rápido - AspirantePro

Esta guía te ayudará a tener AspirantePro funcionando en menos de 5 minutos.

## 📋 Requisitos Previos

- Node.js 18 o superior instalado
- MongoDB instalado y corriendo (o cuenta en MongoDB Atlas)
- Git instalado

## 🚀 Instalación Rápida

### 1. Clonar y Preparar

```bash
# Clonar el repositorio
git clone https://github.com/aldairjoss2001/AspirantePRO.git
cd AspirantePRO

# Crear directorios necesarios
mkdir -p backend/uploads
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus configuraciones
# Mínimo necesario:
# MONGODB_URI=mongodb://localhost:27017/aspirantepro
# JWT_SECRET=cambiar-por-clave-segura
```

Iniciar backend:
```bash
npm run dev
```

✅ Backend corriendo en `http://localhost:5000`

### 3. Configurar Frontend (Nueva Terminal)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.local.example .env.local

# Editar .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Iniciar frontend:
```bash
npm run dev
```

✅ Frontend corriendo en `http://localhost:3000`

## 🎯 Crear Primer Usuario Admin

### Opción 1: Via MongoDB Compass o mongosh

```javascript
use aspirantepro

// Insertar admin con password: Admin123!
db.users.insertOne({
  nombre_completo: "Administrador",
  email: "admin@aspirantepro.com",
  password: "$2a$10$XqV1H6QZ.zYyJ8rFv7H8YOoP1VB0Y6K5/0hH3YKmVY8f5h9J0h9.O",
  rol: "admin",
  status_pago: "activo",
  fecha_registro: new Date()
})
```

### Opción 2: Registrarse y Cambiar Rol

1. Ir a `http://localhost:3000/auth/register`
2. Crear cuenta normal
3. En MongoDB, cambiar el rol:

```javascript
db.users.updateOne(
  { email: "tu-email@ejemplo.com" },
  { $set: { rol: "admin", status_pago: "activo" } }
)
```

## 🔑 Acceder a la Plataforma

### Landing Page
```
http://localhost:3000/landing.html
```

### Login
```
http://localhost:3000/auth/login
```

**Credenciales Admin:**
- Email: `admin@aspirantepro.com`
- Password: `Admin123!`

### Dashboards
- **Estudiante**: `http://localhost:3000/dashboard`
- **Admin**: `http://localhost:3000/admin`

## 📊 Agregar Contenido de Prueba

### Crear Libro de Ejemplo

```javascript
use aspirantepro

db.contents.insertOne({
  tipo: "libro",
  titulo: "Matemáticas - Gestión 2024",
  url_archivo: "https://www.example.com/libro.pdf",
  categoria: "Matemáticas",
  descripcion: "Libro oficial de matemáticas para el examen",
  visible: true,
  fecha_subida: new Date()
})
```

### Crear Pregunta de Quiz

```javascript
db.quizzes.insertOne({
  pregunta: "¿Cuánto es 2 + 2?",
  opciones: ["3", "4", "5", "6"],
  respuesta_correcta: 1,
  explicacion: "La suma de 2 + 2 es igual a 4",
  categoria: "Matemáticas",
  dificultad: "fácil",
  activo: true
})
```

### Crear Notificación

```javascript
db.notifications.insertOne({
  titulo: "¡Bienvenido a AspirantePro!",
  mensaje: "Explora todo el contenido disponible y prepárate para tu examen",
  tipo: "success",
  activo: true,
  fecha_creacion: new Date()
})
```

## 🧪 Probar la Plataforma

### Como Estudiante:

1. **Registrarse**: `http://localhost:3000/auth/register`
2. **Subir comprobante**: `http://localhost:3000/auth/payment`
3. Esperar a que admin apruebe (o aprobar manualmente en DB)
4. **Acceder al contenido**: `http://localhost:3000/dashboard`

### Como Admin:

1. **Login**: `http://localhost:3000/auth/login`
2. **Dashboard**: `http://localhost:3000/admin`
3. **Aprobar usuarios**: `http://localhost:3000/admin/usuarios`
4. **Subir contenido**: `http://localhost:3000/admin/contenido`
5. **Crear quizzes**: `http://localhost:3000/admin/quizzes`

## 🐛 Solución de Problemas

### Backend no inicia

```bash
# Verificar que MongoDB esté corriendo
mongosh

# Si falla, iniciar MongoDB:
# En Windows: net start MongoDB
# En macOS: brew services start mongodb-community
# En Linux: sudo systemctl start mongod
```

### Frontend no conecta con Backend

1. Verificar que el backend esté corriendo en puerto 5000
2. Verificar `.env.local` tenga `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
3. Reiniciar el servidor de Next.js

### Error "Email ya existe"

Este email ya está registrado. Usa otro email o cambia el password del existente en MongoDB.

### No puedo acceder al contenido

Verificar que el usuario tenga `status_pago: "activo"`:

```javascript
db.users.updateOne(
  { email: "tu-email@ejemplo.com" },
  { $set: { status_pago: "activo" } }
)
```

## 📱 Probar en Móvil

```bash
# En la misma red WiFi, usar la IP de tu computadora
# Frontend: http://TU_IP:3000
# Backend: http://TU_IP:5000
```

## 🎓 Siguiente Paso

Lee la documentación completa:
- `README.md` - Documentación general
- `API_DOCUMENTATION.md` - Endpoints de la API
- `DATABASE_SCHEMA.md` - Esquema de base de datos

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend y frontend
2. Verifica que MongoDB esté corriendo
3. Asegúrate de tener las versiones correctas de Node.js
4. Revisa que los puertos 3000 y 5000 no estén ocupados

## ✅ Checklist de Verificación

- [ ] MongoDB corriendo
- [ ] Backend corriendo (puerto 5000)
- [ ] Frontend corriendo (puerto 3000)
- [ ] Usuario admin creado
- [ ] Contenido de prueba agregado
- [ ] Puedes hacer login
- [ ] Puedes ver el dashboard

¡Listo! 🎉 Tu plataforma AspirantePro está funcionando.
