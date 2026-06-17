# ⚙ TechFix — Backend API

API REST para el Sistema de Reservas Digital de TechFix.  
**Stack:** Node.js · Express · PostgreSQL · JWT

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# 3. Crear la base de datos
psql -U postgres -c "CREATE DATABASE techfix_db;"
psql -U postgres -d techfix_db -f ../techfix_database.sql

# 4. Iniciar en desarrollo
npm run dev

# 5. Iniciar en producción
npm start
```

---

## 📁 Estructura del proyecto

```
techfix-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Conexión PostgreSQL (Pool)
│   ├── controllers/
│   │   ├── authController.js     # Registro, login, me
│   │   ├── serviciosController.js# CRUD de servicios
│   │   ├── tecnicosController.js # Gestión de técnicos
│   │   ├── calificacionesController.js
│   │   └── adminController.js    # Dashboard y reportes
│   ├── middlewares/
│   │   ├── auth.js               # verifyToken, authorize
│   │   └── errorHandler.js       # validateRequest, errorHandler, notFound
│   ├── routes/
│   │   └── index.js              # Todas las rutas de la API
│   └── index.js                  # Entry point del servidor
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Autenticación

Todas las rutas protegidas requieren header:
```
Authorization: Bearer <token>
```
El token se obtiene al hacer login o registro.

---

## 📋 Endpoints de la API

### AUTH
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/auth/registro` | Crear cuenta | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| GET  | `/api/auth/me` | Perfil del usuario | Autenticado |
| PUT  | `/api/auth/cambiar-password` | Cambiar contraseña | Autenticado |

### SERVICIOS
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET    | `/api/servicios` | Listar servicios (filtrados por rol) | Todos |
| GET    | `/api/servicios/:id` | Detalle de un servicio | Todos |
| POST   | `/api/servicios` | Agendar nuevo servicio | Cliente |
| PATCH  | `/api/servicios/:id/estado` | Actualizar estado | Técnico/Admin |
| PATCH  | `/api/servicios/:id/asignar` | Asignar técnico | Admin |
| PATCH  | `/api/servicios/:id/cancelar` | Cancelar servicio | Cliente/Admin |

### TÉCNICOS
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET    | `/api/tecnicos` | Listar técnicos | Admin |
| GET    | `/api/tecnicos/disponibles-hoy` | Técnicos disponibles hoy | Admin |
| GET    | `/api/tecnicos/:id` | Perfil del técnico | Autenticado |
| PATCH  | `/api/tecnicos/disponibilidad` | Marcar disponible/no disponible | Técnico |
| PATCH  | `/api/tecnicos/:id` | Actualizar perfil | Admin |
| PATCH  | `/api/tecnicos/:id/estado` | Activar/suspender técnico | Admin |

### CALIFICACIONES
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/calificaciones` | Calificar servicio finalizado | Cliente |
| GET  | `/api/calificaciones/tecnico/:id` | Ver calificaciones de técnico | Autenticado |

### NOTIFICACIONES
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET    | `/api/notificaciones` | Mis notificaciones | Autenticado |
| PATCH  | `/api/notificaciones/:id/leer` | Marcar como leída | Autenticado |
| PATCH  | `/api/notificaciones/leer-todas` | Marcar todas como leídas | Autenticado |

### ADMIN
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/admin/dashboard` | KPIs y métricas | Admin |
| GET | `/api/admin/reportes` | Reportes por período | Admin |
| GET | `/api/admin/clientes` | Listar todos los clientes | Admin |
| PATCH | `/api/admin/clientes/:id/estado` | Cambiar estado de cliente | Admin |
| GET | `/api/admin/tipos-servicio` | Catálogo de servicios | Autenticado |

---

## 📦 Ejemplos de uso

### Registro de cliente
```json
POST /api/auth/registro
{
  "nombre": "Ana",
  "apellido": "García",
  "email": "ana@gmail.com",
  "password": "MiPassword123!",
  "telefono": "945678901",
  "rol": "cliente",
  "direccion": "Av. Pardo 450",
  "distrito": "Miraflores"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "ana@gmail.com",
  "password": "MiPassword123!"
}
```

### Agendar servicio
```json
POST /api/servicios
Authorization: Bearer <token_cliente>
{
  "tipo_servicio_id": 1,
  "dispositivo": "Laptop HP Pavilion 15",
  "descripcion_problema": "No enciende, hace 2 días dejó de funcionar",
  "fecha_agendada": "2025-08-20",
  "hora_agendada": "10:00",
  "direccion_servicio": "Av. Pardo 450, Dpto 3B",
  "distrito": "Miraflores"
}
```

### Actualizar estado (técnico)
```json
PATCH /api/servicios/:id/estado
Authorization: Bearer <token_tecnico>
{
  "estado": "en_proceso",
  "nota": "Iniciando diagnóstico del equipo"
}
```

### Asignar técnico (admin)
```json
PATCH /api/servicios/:id/asignar
Authorization: Bearer <token_admin>
{
  "tecnico_id": "uuid-del-tecnico"
}
```

### Calificar servicio
```json
POST /api/calificaciones
Authorization: Bearer <token_cliente>
{
  "servicio_id": "uuid-del-servicio",
  "puntuacion": 5,
  "comentario": "Excelente servicio, muy puntual y profesional"
}
```

---

## 🛡️ Reglas de negocio aplicadas en la API

| Regla | Dónde se valida |
|-------|----------------|
| RN-02: máx. 3 servicios activos por cliente | Trigger BD + Controller |
| RN-03: cancelar con 2h de anticipación | Controller servicios |
| RN-04: técnico debe estar disponible | Controller asignar |
| RN-05: máx. 6 servicios por técnico/día | Trigger BD + Vista |
| RN-07: solo calificar servicios finalizados | Controller + Trigger BD |
| RN-08: recalcular rating automáticamente | Trigger BD |
| RN-09: alertar servicios pendientes > 24h | Dashboard admin |
| RN-11: registrar precio antes de finalizar | Controller estado |
| RN-12: desactivar disponibilidad al suspender técnico | Controller estado |

---

