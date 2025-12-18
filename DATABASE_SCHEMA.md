# Esquema de Base de Datos - AspirantePro

## Tecnología: MongoDB con Mongoose

---

## 1. Colección: Users (Usuarios)

Gestiona la información de usuarios, roles y estado de pago.

```javascript
{
  _id: ObjectId,
  nombre_completo: String,      // Nombre completo del usuario
  email: String,                 // Email único (usado como login)
  password: String,              // Contraseña encriptada con bcrypt
  rol: String,                   // Enum: ['admin', 'estudiante']
  status_pago: String,           // Enum: ['pendiente', 'validando', 'activo']
  comprobante_url: String,       // URL del comprobante de pago (opcional)
  foto_perfil: String,           // URL de la foto de perfil (opcional)
  fecha_registro: Date,          // Fecha de registro del usuario
  createdAt: Date,               // Timestamp automático de Mongoose
  updatedAt: Date                // Timestamp automático de Mongoose
}
```

### Validaciones
- `nombre_completo`: Requerido, tipo String
- `email`: Requerido, único, formato email válido
- `password`: Requerido, mínimo 6 caracteres, encriptado con bcrypt
- `rol`: Por defecto 'estudiante'
- `status_pago`: Por defecto 'pendiente'

### Índices
- `email`: Único
- `status_pago`: Para filtrado rápido

---

## 2. Colección: Content (Contenido)

Almacena libros, exámenes pasados y otros materiales educativos.

```javascript
{
  _id: ObjectId,
  tipo: String,                  // Enum: ['libro', 'examen_pasado', 'tip']
  titulo: String,                // Nombre del material
  url_archivo: String,           // URL del PDF u otro archivo
  categoria: String,             // Ej: "Matemáticas", "Realidad Nacional", etc.
  descripcion: String,           // Descripción opcional del contenido
  visible: Boolean,              // True si está visible para usuarios
  fecha_subida: Date,            // Fecha de subida del contenido
  createdAt: Date,
  updatedAt: Date
}
```

### Validaciones
- `tipo`: Requerido, debe ser uno de los valores enum
- `titulo`: Requerido
- `url_archivo`: Requerido
- `categoria`: Requerido
- `visible`: Por defecto true

### Índices
- `tipo`: Para filtrado por tipo de contenido
- `categoria`: Para filtrado por materia
- `visible`: Para consultas de contenido visible

---

## 3. Colección: Quizzes (Preguntas de Simulacro)

Contiene las preguntas para los simulacros interactivos.

```javascript
{
  _id: ObjectId,
  pregunta: String,              // Texto de la pregunta
  opciones: [String],            // Array de 4 opciones (A, B, C, D)
  respuesta_correcta: Number,    // Índice de la respuesta correcta (0-3)
  explicacion: String,           // Explicación de por qué es correcta
  categoria: String,             // Materia o tema de la pregunta
  dificultad: String,            // Enum: ['fácil', 'media', 'difícil']
  activo: Boolean,               // True si la pregunta está activa
  createdAt: Date,
  updatedAt: Date
}
```

### Validaciones
- `pregunta`: Requerido
- `opciones`: Requerido, array de exactamente 4 strings
- `respuesta_correcta`: Requerido, número entre 0 y 3
- `explicacion`: Requerido
- `categoria`: Requerido
- `dificultad`: Por defecto 'media'
- `activo`: Por defecto true

### Índices
- `categoria`: Para filtrado por materia
- `dificultad`: Para filtrado por nivel
- `activo`: Para consultas de preguntas activas

---

## 4. Colección: Notifications (Notificaciones)

Almacena anuncios globales del administrador para los estudiantes.

```javascript
{
  _id: ObjectId,
  titulo: String,                // Título de la notificación
  mensaje: String,               // Contenido del mensaje
  tipo: String,                  // Enum: ['info', 'warning', 'success', 'error']
  activo: Boolean,               // True si está visible para usuarios
  fecha_creacion: Date,          // Fecha de creación
  createdAt: Date,
  updatedAt: Date
}
```

### Validaciones
- `titulo`: Requerido
- `mensaje`: Requerido
- `tipo`: Por defecto 'info'
- `activo`: Por defecto true

### Índices
- `activo`: Para consultas de notificaciones visibles
- `fecha_creacion`: Para ordenamiento por fecha

---

## Relaciones y Flujo de Datos

### 1. Flujo de Registro y Pago
```
Usuario registra → status_pago: 'pendiente'
Usuario sube comprobante → status_pago: 'validando', comprobante_url guardado
Admin aprueba → status_pago: 'activo'
Usuario accede al contenido ✓
```

### 2. Flujo de Contenido
```
Admin crea Content → visible: true
Usuario con status_pago: 'activo' puede ver contenido
Usuario descarga/visualiza PDF desde url_archivo
```

### 3. Flujo de Simulacro
```
Usuario inicia simulacro → GET /api/quizzes (solo preguntas activas)
Usuario responde preguntas
Usuario finaliza → POST /api/quizzes/check
Sistema compara respuestas con respuesta_correcta
Sistema retorna resultados con explicaciones
```

### 4. Flujo de Notificaciones
```
Admin crea Notification → activo: true
Todos los usuarios ven notificación en dashboard
Admin desactiva → activo: false (ya no visible)
```

---

## Consideraciones de Seguridad

1. **Passwords**: Nunca se almacenan en texto plano. Siempre hasheadas con bcrypt.
2. **JWT Tokens**: Incluyen el ID del usuario y expiran en 7 días por defecto.
3. **Archivos**: Las URLs de archivos apuntan a un directorio de uploads o servicio externo.
4. **Validaciones**: Mongoose valida datos antes de guardar en DB.
5. **Roles**: Middleware verifica roles antes de acceder a rutas admin.

---

## Scripts Útiles de MongoDB

### Crear Usuario Admin
```javascript
use aspirantepro

db.users.insertOne({
  nombre_completo: "Administrador",
  email: "admin@aspirantepro.com",
  password: "$2a$10$hashedPasswordHere",
  rol: "admin",
  status_pago: "activo",
  fecha_registro: new Date()
})
```

### Ver Usuarios Pendientes de Validación
```javascript
db.users.find({ status_pago: "validando" })
```

### Aprobar Pago de Usuario
```javascript
db.users.updateOne(
  { email: "usuario@ejemplo.com" },
  { $set: { status_pago: "activo" } }
)
```

### Crear Contenido de Ejemplo
```javascript
db.contents.insertOne({
  tipo: "libro",
  titulo: "Libro de Matemáticas - Gestión 2024",
  url_archivo: "/uploads/matematicas-2024.pdf",
  categoria: "Matemáticas",
  descripcion: "Libro oficial de matemáticas para el examen de ingreso",
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

### Estadísticas Rápidas
```javascript
// Total de usuarios
db.users.countDocuments()

// Usuarios activos (pagaron)
db.users.countDocuments({ status_pago: "activo" })

// Total de contenido
db.contents.countDocuments()

// Total de preguntas
db.quizzes.countDocuments()

// Ingresos (15 Bs por usuario activo)
db.users.countDocuments({ status_pago: "activo" }) * 15
```

---

## Backup y Restauración

### Hacer Backup
```bash
mongodump --db aspirantepro --out ./backup
```

### Restaurar Backup
```bash
mongorestore --db aspirantepro ./backup/aspirantepro
```

---

## Conexión a MongoDB

### Local
```
mongodb://localhost:27017/aspirantepro
```

### MongoDB Atlas (Producción)
```
mongodb+srv://usuario:password@cluster.mongodb.net/aspirantepro?retryWrites=true&w=majority
```
