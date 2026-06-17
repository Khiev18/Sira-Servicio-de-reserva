# TechFix — Sistema SIRA

> Sistema Inteligente de Reservas y Atención para servicios técnicos a domicilio.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

TechFix es una microempresa peruana de servicio técnico a domicilio (Lima, 2023). SIRA reemplaza su coordinación manual por WhatsApp y hojas de cálculo con una plataforma web que centraliza el agendamiento, la asignación de técnicos y el seguimiento en tiempo real de cada servicio.

---

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Puesta en marcha](#puesta-en-marcha)
  - [Opción A — Docker Compose](#opción-a--docker-compose-recomendado)
  - [Opción B — Manual](#opción-b--manual-backend--frontend-por-separado)
- [Variables de entorno](#variables-de-entorno)
- [Modelo de datos](#modelo-de-datos)
- [Roles del sistema](#roles-del-sistema)
- [Reglas de negocio](#reglas-de-negocio)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Equipo](#equipo)
- [Licencia](#licencia)

---

## Características

- **Tres roles diferenciados**: Cliente, Técnico y Administrador, cada uno con su propio panel.
- **Ciclo de vida completo del servicio**: pendiente → asignado → en camino → en proceso → finalizado.
- **Asignación inteligente de técnicos** según disponibilidad y carga diaria (`v_tecnicos_disponibles_hoy`).
- **Calificaciones y reputación**: promedio recalculado automáticamente vía trigger en cada nueva calificación.
- **Dashboard administrativo** con KPIs, alertas de servicios sin asignar y reportes con gráficos.
- **Autenticación JWT** con autorización por rol en cada endpoint sensible.
- **Reglas de negocio garantizadas en base de datos** mediante triggers (no solo en el backend).

## Arquitectura

Arquitectura de tres capas con responsabilidades claramente separadas:

```
┌─────────────────────┐      HTTP/REST + JWT      ┌──────────────────────┐      SQL       ┌──────────────┐
│   Frontend (React)   │ ────────────────────────▶ │   Backend (Express)   │ ─────────────▶ │  PostgreSQL  │
│  Vite · Axios · 5173 │ ◀──────────────────────── │   Node.js · 3000       │ ◀───────────── │     5434     │
└─────────────────────┘                            └──────────────────────┘                 └──────────────┘
```

- **Presentación**: SPA en React consumiendo una API REST vía Axios, con interceptor JWT automático.
- **Lógica de negocio**: Express organiza rutas → middlewares (auth/validación) → controladores.
- **Datos**: PostgreSQL con triggers, vistas y constraints que blindan la integridad incluso si el backend tiene un bug.

Diagramas completos (UML de clases, BPMN, entidad-relación, arquitectura de componentes) en [`docs/diagramas/`](docs/diagramas).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios, Recharts, react-hot-toast |
| Backend | Node.js, Express 4, express-validator, jsonwebtoken, bcryptjs, Helmet, Morgan |
| Base de datos | PostgreSQL 15 (triggers, vistas, tipos ENUM) |
| Infraestructura | Docker / Docker Compose |

## Estructura del repositorio

```
techfix-sira/
├── docker-compose.yml          # Orquesta backend + frontend en contenedores
├── .env.example                 # Variables para docker-compose
│
├── techfix-backend/             # API REST
│   ├── src/
│   │   ├── config/db.js         # Pool de conexión PostgreSQL
│   │   ├── controllers/         # auth, servicios, tecnicos, admin, calificaciones
│   │   ├── middlewares/         # verifyToken, authorize(rol), errorHandler
│   │   └── routes/index.js      # 20 endpoints REST
│   ├── .env.example
│   └── README.md
│
├── techfix-frontend/             # SPA
│   ├── src/
│   │   ├── api/                  # client.js (Axios) + services.js
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useFetch.js
│   │   ├── pages/{admin,cliente,tecnico,auth}/
│   │   └── components/{ui,layout}/
│   ├── .env.example
│   └── README.md
│
└── docs/
    ├── techfix_database.sql     # Esquema completo (tablas, triggers, vistas)
    ├── techfix_seed_50.sql      # Datos de prueba (50 registros)
    └── diagramas/                # UML, BPMN, ER, arquitectura
```

## Puesta en marcha

### Requisitos previos

- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 15](https://www.postgresql.org/) (si no usas Docker)
- [Docker y Docker Compose](https://docs.docker.com/get-docker/) (opcional, recomendado)

### Opción A — Docker Compose (recomendado)

```bash
git clone https://github.com/<tu-usuario>/techfix-sira.git
cd techfix-sira

cp .env.example .env
# Edita .env y define DB_PASSWORD y JWT_SECRET

docker compose up -d --build
```


> El `docker-compose.yml` asume una instancia de PostgreSQL accesible en `host.docker.internal:5434`. Ajusta `DB_HOST`/`DB_PORT` si tu base de datos corre en otro lugar.

### Opción B — Manual (backend y frontend por separado)

**1. Base de datos**

```bash
psql -U postgres -c "CREATE DATABASE techfix_db;"
psql -U postgres -d techfix_db -f docs/techfix_database.sql
psql -U postgres -d techfix_db -f docs/techfix_seed_50.sql   # datos de prueba (opcional)
```

**2. Backend**

```bash
cd techfix-backend
cp .env.example .env     # completa tus credenciales de PostgreSQL
npm install
npm run dev               # http://localhost:3000
```

**3. Frontend**

```bash
cd techfix-frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Detalles adicionales de cada parte en [`techfix-backend/README.md`](techfix-backend/README.md) y [`techfix-frontend/README.md`](techfix-frontend/README.md).

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | backend | Conexión a PostgreSQL |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | backend | Firma y expiración del token de sesión |
| `BCRYPT_ROUNDS` | backend | Costo del hash de contraseñas (12 por defecto) |
| `CORS_ORIGIN` | backend | Origen(es) permitido(s) para el frontend |
| `VITE_API_URL` | frontend | URL base de la API consumida por Axios |

Nunca subas un archivo `.env` real al repositorio — usa siempre los `.env.example` como plantilla.

## Modelo de datos

10 tablas normalizadas (3FN), 8 triggers y 3 vistas. Resumen de las reglas de negocio implementadas directamente en base de datos:

| Regla | Descripción |
|---|---|
| RN-02 | Un cliente no puede tener más de 3 servicios activos simultáneos |
| RN-04 | Solo se asignan técnicos con `disponible = true` |
| RN-05 | Un técnico no puede superar 6 servicios asignados por día |
| RN-07 | Solo se puede calificar un servicio en estado `finalizado` |
| RN-08 | El promedio de calificación del técnico se recalcula automáticamente |
| RN-09 | Se genera alerta si un servicio lleva +24h sin técnico asignado |
| RN-11 | El precio cobrado es obligatorio antes de marcar un servicio como finalizado |

Esquema completo en [`docs/techfix_database.sql`](docs/techfix_database.sql).

## Licencia

Este proyecto se distribuye bajo licencia [MIT](LICENSE).
