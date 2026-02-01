# Documentación de API - AspirantePro

**Base URL**: `http://localhost:5000/api`

---

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

El token se obtiene al hacer login o registro y debe guardarse en el cliente (localStorage, cookies, etc.)

---

## 🔐 Rutas de Autenticación

### 1. Registrar Usuario
**POST** `/auth/register`

Crea una nueva cuenta de usuario.

**Body:**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "nombre_completo": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "estudiante",
    "status_pago": "pendiente",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Iniciar Sesión
**POST** `/auth/login`

Autenticar usuario existente.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "nombre_completo": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "estudiante",
    "status_pago": "activo",
    "foto_perfil": "/uploads/foto.jpg",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Obtener Usuario Actual
**GET** `/auth/me`

Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "nombre_completo": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "estudiante",
    "status_pago": "activo",
    "foto_perfil": "/uploads/foto.jpg",
    "fecha_registro": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Subir Comprobante de Pago
**POST** `/auth/upload-comprobante`

Sube un comprobante de pago para validación.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
comprobante: <archivo>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "status_pago": "validando",
    "comprobante_url": "/uploads/comprobante-123456.jpg"
  }
}
```

---

### 5. Actualizar Contraseña
**PUT** `/auth/update-password`

Cambia la contraseña del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 Rutas de Usuario

### 6. Actualizar Perfil
**PUT** `/users/profile`

Actualiza información del perfil.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre_completo": "Juan Alberto Pérez"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": { /* usuario actualizado */ }
}
```

---

### 7. Actualizar Foto de Perfil
**PUT** `/users/photo`

Sube una nueva foto de perfil.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
foto: <archivo>
```

---

### 8. Obtener Estadísticas del Usuario
**GET** `/users/stats`

Obtiene estadísticas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 📚 Rutas de Contenido (Requiere acceso activo)

### 9. Listar Contenido
**GET** `/content`

Lista libros, exámenes u otro contenido.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `tipo` (opcional): `libro`, `examen_pasado`, `tip`
- `categoria` (opcional): filtrar por categoría

**Ejemplo:**
```
GET /api/content?tipo=libro&categoria=Matemáticas
```

**Respuesta (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64def...",
      "tipo": "libro",
      "titulo": "Matemáticas Gestión 2024",
      "url_archivo": "/uploads/libro-mat-2024.pdf",
      "categoria": "Matemáticas",
      "descripcion": "Libro oficial...",
      "visible": true,
      "fecha_subida": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### 10. Obtener Contenido Específico
**GET** `/content/:id`

Obtiene un contenido por ID.

**Headers:**
```
Authorization: Bearer <token>
```

---

### 11. Obtener Categorías
**GET** `/content/categories`

Lista todas las categorías disponibles.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": ["Matemáticas", "Lenguaje", "Ciencias Sociales", "Realidad Nacional"]
}
```

---

## 🎯 Rutas de Quizzes (Simuladores)

### 12. Obtener Preguntas para Simulacro
**GET** `/quizzes`

Obtiene preguntas para un simulacro.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `categoria` (opcional): filtrar por categoría
- `limite` (opcional): número de preguntas (ej: 10, 20)

**Ejemplo:**
```
GET /api/quizzes?limite=20
```

**Respuesta (200):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "_id": "64xyz...",
      "pregunta": "¿Cuál es la capital de Bolivia?",
      "opciones": ["La Paz", "Sucre", "Cochabamba", "Santa Cruz"],
      "categoria": "Realidad Nacional",
      "dificultad": "fácil"
      // Nota: respuesta_correcta y explicacion NO se envían
    }
  ]
}
```

---

### 13. Verificar Respuestas
**POST** `/quizzes/check`

Verifica las respuestas del simulacro y retorna resultados.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "respuestas": [
    {
      "quizId": "64xyz...",
      "respuesta": 1
    },
    {
      "quizId": "64abc...",
      "respuesta": 2
    }
  ]
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "totalPreguntas": 20,
    "respuestasCorrectas": 15,
    "puntuacion": "75.00",
    "resultados": [
      {
        "quizId": "64xyz...",
        "pregunta": "¿Cuál es la capital de Bolivia?",
        "respuestaUsuario": 1,
        "respuestaCorrecta": 1,
        "esCorrecta": true,
        "explicacion": "Sucre es la capital constitucional de Bolivia..."
      }
    ]
  }
}
```

---

### 14. Obtener Notificaciones
**GET** `/notifications`

Lista notificaciones activas.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64not...",
      "titulo": "Nuevo contenido disponible",
      "mensaje": "Se ha agregado el libro de Matemáticas Gestión 2024",
      "tipo": "info",
      "fecha_creacion": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 👑 Rutas de Administrador (Requiere rol admin)

Todas estas rutas requieren:
```
Authorization: Bearer <token_admin>
```

### 15. Listar Todos los Usuarios
**GET** `/admin/users`

**Respuesta (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [ /* array de usuarios */ ]
}
```

---

### 16. Actualizar Estado de Pago
**PUT** `/admin/users/:id/payment-status`

**Body:**
```json
{
  "status_pago": "activo"
}
```

---

### 17. Activar/Desactivar Usuario
**PUT** `/admin/users/:id/toggle-access`

Alterna entre `activo` y `pendiente`.

---

### 18. Crear Contenido
**POST** `/admin/content`

**Body:**
```json
{
  "tipo": "libro",
  "titulo": "Matemáticas Avanzadas",
  "url_archivo": "/uploads/mat-avanzadas.pdf",
  "categoria": "Matemáticas",
  "descripcion": "Libro de matemáticas nivel avanzado",
  "visible": true
}
```

---

### 19. Actualizar Contenido
**PUT** `/admin/content/:id`

---

### 20. Eliminar Contenido
**DELETE** `/admin/content/:id`

---

### 21. Crear Pregunta de Quiz
**POST** `/admin/quizzes`

**Body:**
```json
{
  "pregunta": "¿Cuál es el resultado de 5 + 3?",
  "opciones": ["6", "7", "8", "9"],
  "respuesta_correcta": 2,
  "explicacion": "5 + 3 = 8",
  "categoria": "Matemáticas",
  "dificultad": "fácil"
}
```

---

### 22. Actualizar Pregunta
**PUT** `/admin/quizzes/:id`

---

### 23. Eliminar Pregunta
**DELETE** `/admin/quizzes/:id`

---

### 24. Obtener Estadísticas del Dashboard
**GET** `/admin/stats`

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "usuarios": {
      "total": 100,
      "activos": 75,
      "pendientes": 20,
      "validando": 5
    },
    "contenido": {
      "total": 50
    },
    "quizzes": {
      "total": 500
    },
    "ingresos": {
      "total": 1125,
      "moneda": "Bs."
    },
    "registrosRecientes": 15
  }
}
```

---

### 25. Crear Notificación
**POST** `/admin/notifications`

**Body:**
```json
{
  "titulo": "Mantenimiento Programado",
  "mensaje": "El sistema estará en mantenimiento el día 20/01",
  "tipo": "warning"
}
```

---

### 26. Actualizar Notificación
**PUT** `/admin/notifications/:id`

---

### 27. Eliminar Notificación
**DELETE** `/admin/notifications/:id`

---

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (error de validación)
- `401` - Unauthorized (sin token o token inválido)
- `403` - Forbidden (sin permisos)
- `404` - Not Found
- `500` - Internal Server Error

---

## Formato de Error

Todos los errores siguen este formato:

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

---

## Ejemplos de Uso con cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Obtener Contenido
```bash
curl -X GET http://localhost:5000/api/content \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Crear Contenido (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/content \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "libro",
    "titulo": "Test Book",
    "url_archivo": "/uploads/test.pdf",
    "categoria": "Test"
  }'
```
