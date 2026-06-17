# ⚙ TechFix — Frontend React

Interfaz web del Sistema de Reservas Digital de TechFix.  
**Stack:** React 18 · Vite · React Router v6 · Axios · Recharts

---

## 🚀 Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la URL del backend
# En .env ya está configurado:
# VITE_API_URL=http://localhost:3000/api

# 3. Asegúrate de que el backend esté corriendo en puerto 3000

# 4. Arrancar en desarrollo
npm run dev
# → http://localhost:5173

# 5. Build para producción
npm run build
```

---

## 📁 Estructura del proyecto

```
techfix-frontend/
├── index.html
├── vite.config.js
├── .env
└── src/
    ├── main.jsx                   # Punto de entrada
    ├── App.jsx                    # Rutas principales
    ├── index.css                  # Variables CSS globales + estilos base
    │
    ├── api/
    │   ├── client.js              # Axios con interceptores JWT
    │   └── services.js            # Servicios agrupados por módulo
    │
    ├── context/
    │   └── AuthContext.jsx        # Estado global de autenticación
    │
    ├── hooks/
    │   └── useFetch.js            # useFetch + useMutation reutilizables
    │
    ├── utils/
    │   └── helpers.js             # Formateo, colores de estado, utilidades
    │
    ├── components/
    │   ├── ui/
    │   │   └── index.jsx          # Button, Card, Modal, Badge, Input...
    │   └── layout/
    │       ├── AppLayout.jsx      # Sidebar + contenido principal
    │       └── ProtectedRoute.jsx # Protección de rutas por rol
    │
    └── pages/
        ├── auth/
        │   ├── LoginPage.jsx
        │   └── RegistroPage.jsx
        ├── cliente/
        │   ├── ClienteHome.jsx    # Dashboard del cliente
        │   ├── AgendarServicio.jsx# Formulario de agendamiento
        │   ├── ClienteServicios.jsx
        │   └── DetalleServicio.jsx# Seguimiento + calificar + cancelar
        ├── tecnico/
        │   ├── TecnicoHome.jsx    # Dashboard + cambio de estado
        │   └── TecnicoServicios.jsx
        └── admin/
            ├── AdminDashboard.jsx # KPIs + alertas + gráficos
            ├── AdminServicios.jsx # Lista + asignar técnicos
            ├── AdminTecnicos.jsx  # Gestión de técnicos
            └── AdminReportes.jsx  # Reportes con Recharts
```

---

## 🔐 Flujo de autenticación

1. Usuario hace login → recibe JWT
2. JWT se guarda en `localStorage`
3. Axios lo adjunta en cada request (`Authorization: Bearer <token>`)
4. Si el token expira → interceptor redirige a `/login`
5. `ProtectedRoute` verifica rol antes de mostrar cada panel

---

## 👥 Paneles por rol

### Cliente (`/cliente`)
- 🏠 **Home**: KPIs + servicios recientes
- ➕ **Agendar**: formulario en 1 paso
- 📋 **Servicios**: lista con filtros
- 🔍 **Detalle**: timeline de seguimiento, calificar, cancelar

### Técnico (`/tecnico`)
- 🏠 **Home**: servicios del día + botón disponibilidad
- 🔧 **Servicios**: avanzar estado con un clic
- ✅ **Finalizar**: registrar diagnóstico y precio

### Admin (`/admin`)
- 📊 **Dashboard**: KPIs, gráfico de barras, alertas RN-09, top técnicos
- 📋 **Servicios**: ver todos + asignar técnico desde modal
- 🔧 **Técnicos**: tarjetas con rating, gestionar estado
- 📈 **Reportes**: filtro por fechas, gráficos de línea/pie/barras, tabla por técnico

---

## 🎨 Sistema de diseño

| Token | Valor |
|-------|-------|
| `--red` | `#E8321A` (marca TechFix) |
| `--font-head` | Syne (títulos) |
| `--font-body` | DM Sans (texto) |
| `--bg-1/2/3/4` | Escala de oscuro a claro |
| `--s-pendiente` | `#F59E0B` |
| `--s-finalizado` | `#22C55E` |

---
