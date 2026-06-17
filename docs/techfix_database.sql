-- ============================================================
--  TECHFIX — Base de Datos PostgreSQL
--  Sistema de Reservas Digital
--  Versión: 1.0 | Lima, 2025
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Limpiar si existe (desarrollo) ───────────────────────────
DROP TABLE IF EXISTS notificaciones       CASCADE;
DROP TABLE IF EXISTS calificaciones       CASCADE;
DROP TABLE IF EXISTS historial_estados    CASCADE;
DROP TABLE IF EXISTS servicios            CASCADE;
DROP TABLE IF EXISTS disponibilidad       CASCADE;
DROP TABLE IF EXISTS tecnicos             CASCADE;
DROP TABLE IF EXISTS clientes             CASCADE;
DROP TABLE IF EXISTS usuarios             CASCADE;
DROP TABLE IF EXISTS tipos_servicio       CASCADE;
DROP TABLE IF EXISTS horarios_atencion    CASCADE;

DROP TYPE IF EXISTS rol_usuario    CASCADE;
DROP TYPE IF EXISTS estado_usuario CASCADE;
DROP TYPE IF EXISTS estado_servicio CASCADE;
DROP TYPE IF EXISTS tipo_notif      CASCADE;


-- ============================================================
--  TIPOS ENUM
-- ============================================================

CREATE TYPE rol_usuario AS ENUM (
    'cliente',
    'tecnico',
    'admin'
);

CREATE TYPE estado_usuario AS ENUM (
    'activo',
    'inactivo',
    'suspendido'
);

CREATE TYPE estado_servicio AS ENUM (
    'pendiente',      -- recién agendado, sin técnico
    'asignado',       -- técnico asignado, aún no iniciado
    'en_camino',      -- técnico en ruta al cliente
    'en_proceso',     -- técnico trabajando
    'finalizado',     -- servicio completado
    'cancelado'       -- cancelado por cliente o admin
);

CREATE TYPE tipo_notif AS ENUM (
    'asignacion',
    'cambio_estado',
    'recordatorio',
    'calificacion',
    'alerta_admin'
);


-- ============================================================
--  TABLA: usuarios
--  Tabla base compartida por clientes, técnicos y admin
-- ============================================================

CREATE TABLE usuarios (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(80)     NOT NULL,
    apellido        VARCHAR(80)     NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    telefono        VARCHAR(20),
    rol             rol_usuario     NOT NULL,
    estado          estado_usuario  NOT NULL DEFAULT 'activo',
    foto_url        TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT email_formato CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    CONSTRAINT telefono_formato CHECK (telefono IS NULL OR telefono ~ '^9[0-9]{8}$')
);

CREATE INDEX idx_usuarios_email  ON usuarios(email);
CREATE INDEX idx_usuarios_rol    ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

COMMENT ON TABLE  usuarios              IS 'Tabla base de todos los usuarios del sistema';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt de la contraseña (nunca texto plano)';
COMMENT ON COLUMN usuarios.rol          IS 'Define el acceso: cliente, tecnico o admin';


-- ============================================================
--  TABLA: clientes
--  Datos extendidos del rol cliente
-- ============================================================

CREATE TABLE clientes (
    id              UUID    PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    direccion       TEXT,
    distrito        VARCHAR(80),
    referencias     TEXT,           -- referencias del domicilio
    total_servicios INT     NOT NULL DEFAULT 0,

    CONSTRAINT total_positivo CHECK (total_servicios >= 0)
);

COMMENT ON TABLE clientes IS 'Perfil extendido del cliente, vinculado a usuarios';


-- ============================================================
--  TABLA: tecnicos
--  Datos extendidos del rol técnico
-- ============================================================

CREATE TABLE tecnicos (
    id                  UUID            PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad        VARCHAR(120),   -- ej: "Laptops HP, Celulares Samsung"
    zona_cobertura      VARCHAR(120),   -- distritos donde atiende
    calificacion_prom   NUMERIC(3,2)    NOT NULL DEFAULT 0.00,
    total_servicios     INT             NOT NULL DEFAULT 0,
    disponible          BOOLEAN         NOT NULL DEFAULT TRUE,
    bio                 TEXT,           -- descripción breve del técnico

    CONSTRAINT calif_rango CHECK (calificacion_prom BETWEEN 0 AND 5),
    CONSTRAINT total_positivo CHECK (total_servicios >= 0)
);

CREATE INDEX idx_tecnicos_disponible ON tecnicos(disponible);
CREATE INDEX idx_tecnicos_calif      ON tecnicos(calificacion_prom DESC);

COMMENT ON TABLE  tecnicos              IS 'Perfil extendido del técnico';
COMMENT ON COLUMN tecnicos.disponible   IS 'RN-04: solo técnicos disponibles pueden ser asignados';


-- ============================================================
--  TABLA: tipos_servicio
--  Catálogo de tipos de servicio ofrecidos
-- ============================================================

CREATE TABLE tipos_servicio (
    id          SERIAL      PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,  -- ej: "Reparación de laptop"
    descripcion TEXT,
    precio_base NUMERIC(8,2),                  -- precio referencial
    activo      BOOLEAN     NOT NULL DEFAULT TRUE
);

INSERT INTO tipos_servicio (nombre, descripcion, precio_base) VALUES
    ('Reparación de laptop',        'Diagnóstico y reparación de laptops de cualquier marca',  80.00),
    ('Reparación de computadora',   'Diagnóstico y reparación de PCs de escritorio',            70.00),
    ('Reparación de celular',       'Diagnóstico y reparación de smartphones',                  60.00),
    ('Instalación de software',     'Instalación de sistema operativo y programas',              50.00),
    ('Limpieza y mantenimiento',    'Limpieza interna y mantenimiento preventivo',               45.00),
    ('Recuperación de datos',       'Recuperación de archivos de discos dañados',              120.00),
    ('Formateo y optimización',     'Formateo completo y optimización del equipo',               55.00),
    ('Cambio de pantalla',          'Cambio de pantalla en laptops o celulares',                90.00);

COMMENT ON TABLE tipos_servicio IS 'Catálogo de servicios ofrecidos por TechFix';


-- ============================================================
--  TABLA: horarios_atencion
--  Horarios disponibles configurados por el admin (RN-01)
-- ============================================================

CREATE TABLE horarios_atencion (
    id          SERIAL      PRIMARY KEY,
    dia_semana  SMALLINT    NOT NULL,  -- 1=Lunes … 7=Domingo
    hora_inicio TIME        NOT NULL,
    hora_fin    TIME        NOT NULL,
    activo      BOOLEAN     NOT NULL DEFAULT TRUE,

    CONSTRAINT dia_valido   CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT horas_validas CHECK (hora_fin > hora_inicio),
    UNIQUE (dia_semana, hora_inicio)
);

-- Horario por defecto: Lunes-Sábado 8:00-19:00
INSERT INTO horarios_atencion (dia_semana, hora_inicio, hora_fin) VALUES
    (1, '08:00', '19:00'),
    (2, '08:00', '19:00'),
    (3, '08:00', '19:00'),
    (4, '08:00', '19:00'),
    (5, '08:00', '19:00'),
    (6, '08:00', '17:00');  -- Sábado hasta las 5pm

COMMENT ON TABLE horarios_atencion IS 'RN-01: horarios en que se pueden agendar servicios';


-- ============================================================
--  TABLA: disponibilidad
--  Disponibilidad diaria declarada por el técnico (RN-04, RN-05)
-- ============================================================

CREATE TABLE disponibilidad (
    id          SERIAL      PRIMARY KEY,
    tecnico_id  UUID        NOT NULL REFERENCES tecnicos(id) ON DELETE CASCADE,
    fecha       DATE        NOT NULL,
    disponible  BOOLEAN     NOT NULL DEFAULT TRUE,
    max_servicios INT       NOT NULL DEFAULT 6,   -- RN-05
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tecnico_id, fecha),
    CONSTRAINT max_servicios_valido CHECK (max_servicios BETWEEN 1 AND 10)
);

CREATE INDEX idx_disponibilidad_fecha     ON disponibilidad(fecha);
CREATE INDEX idx_disponibilidad_tecnico   ON disponibilidad(tecnico_id);

COMMENT ON TABLE  disponibilidad              IS 'Disponibilidad diaria de técnicos';
COMMENT ON COLUMN disponibilidad.max_servicios IS 'RN-05: máximo 6 servicios por día por técnico';


-- ============================================================
--  TABLA: servicios
--  Núcleo del sistema — cada reserva/servicio
-- ============================================================

CREATE TABLE servicios (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relaciones
    cliente_id          UUID            NOT NULL REFERENCES clientes(id),
    tecnico_id          UUID            REFERENCES tecnicos(id),
    tipo_servicio_id    INT             NOT NULL REFERENCES tipos_servicio(id),

    -- Descripción del problema
    dispositivo         VARCHAR(100)    NOT NULL,  -- ej: "Laptop HP Pavilion 15"
    descripcion_problema TEXT           NOT NULL,

    -- Agendamiento
    fecha_agendada      DATE            NOT NULL,
    hora_agendada       TIME            NOT NULL,

    -- Ubicación del servicio
    direccion_servicio  TEXT            NOT NULL,
    distrito            VARCHAR(80),
    referencias         TEXT,

    -- Estado y seguimiento
    estado              estado_servicio NOT NULL DEFAULT 'pendiente',

    -- Diagnóstico y resultado (lo llena el técnico)
    diagnostico         TEXT,
    resultado           TEXT,
    precio_cobrado      NUMERIC(8,2),

    -- Cancelación
    cancelado_por       UUID            REFERENCES usuarios(id),
    motivo_cancelacion  TEXT,
    cancelado_at        TIMESTAMPTZ,

    -- Auditoría
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    finalizado_at       TIMESTAMPTZ,

    -- Constraints de negocio
    CONSTRAINT hora_valida CHECK (hora_agendada BETWEEN '08:00' AND '19:00'),
    CONSTRAINT precio_positivo CHECK (precio_cobrado IS NULL OR precio_cobrado > 0)
);

CREATE INDEX idx_servicios_cliente  ON servicios(cliente_id);
CREATE INDEX idx_servicios_tecnico  ON servicios(tecnico_id);
CREATE INDEX idx_servicios_estado   ON servicios(estado);
CREATE INDEX idx_servicios_fecha    ON servicios(fecha_agendada);
CREATE INDEX idx_servicios_created  ON servicios(created_at DESC);

COMMENT ON TABLE  servicios                 IS 'Tabla central: cada fila es un servicio agendado';
COMMENT ON COLUMN servicios.estado          IS 'Ciclo: pendiente→asignado→en_camino→en_proceso→finalizado';
COMMENT ON COLUMN servicios.tecnico_id      IS 'NULL hasta que el admin asigne un técnico';
COMMENT ON COLUMN servicios.precio_cobrado  IS 'RN-11: lo registra el técnico antes de finalizar';


-- ============================================================
--  TABLA: historial_estados
--  Auditoría de cada cambio de estado del servicio
-- ============================================================

CREATE TABLE historial_estados (
    id              SERIAL          PRIMARY KEY,
    servicio_id     UUID            NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    estado_anterior estado_servicio,
    estado_nuevo    estado_servicio NOT NULL,
    cambiado_por    UUID            NOT NULL REFERENCES usuarios(id),
    nota            TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_servicio ON historial_estados(servicio_id);
CREATE INDEX idx_historial_created  ON historial_estados(created_at DESC);

COMMENT ON TABLE historial_estados IS 'Log de todos los cambios de estado de cada servicio';


-- ============================================================
--  TABLA: calificaciones
--  Evaluación del cliente al servicio (RN-07, RN-08)
-- ============================================================

CREATE TABLE calificaciones (
    id              SERIAL      PRIMARY KEY,
    servicio_id     UUID        NOT NULL UNIQUE REFERENCES servicios(id) ON DELETE CASCADE,
    cliente_id      UUID        NOT NULL REFERENCES clientes(id),
    tecnico_id      UUID        NOT NULL REFERENCES tecnicos(id),
    puntuacion      SMALLINT    NOT NULL,
    comentario      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT puntuacion_rango CHECK (puntuacion BETWEEN 1 AND 5)
);

CREATE INDEX idx_calif_tecnico  ON calificaciones(tecnico_id);
CREATE INDEX idx_calif_created  ON calificaciones(created_at DESC);

COMMENT ON TABLE  calificaciones        IS 'RN-07: una sola calificación por servicio finalizado';
COMMENT ON COLUMN calificaciones.puntuacion IS '1 a 5 estrellas';


-- ============================================================
--  TABLA: notificaciones
--  Notificaciones del sistema a los usuarios
-- ============================================================

CREATE TABLE notificaciones (
    id          SERIAL      PRIMARY KEY,
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    servicio_id UUID        REFERENCES servicios(id) ON DELETE SET NULL,
    tipo        tipo_notif  NOT NULL,
    titulo      VARCHAR(150) NOT NULL,
    mensaje     TEXT        NOT NULL,
    leida       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_usuario  ON notificaciones(usuario_id, leida);
CREATE INDEX idx_notif_created  ON notificaciones(created_at DESC);

COMMENT ON TABLE notificaciones IS 'Notificaciones push/email para clientes, técnicos y admin';


-- ============================================================
--  FUNCIONES Y TRIGGERS
-- ============================================================

-- ── Trigger: actualizar updated_at automáticamente ────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_servicios_updated_at
    BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ── Trigger: recalcular calificación promedio del técnico ─────
-- RN-08: se recalcula cada vez que entra una nueva calificación
CREATE OR REPLACE FUNCTION fn_actualizar_calificacion_tecnico()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tecnicos
    SET calificacion_prom = (
        SELECT ROUND(AVG(puntuacion)::NUMERIC, 2)
        FROM calificaciones
        WHERE tecnico_id = NEW.tecnico_id
    )
    WHERE id = NEW.tecnico_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcular_calificacion
    AFTER INSERT OR UPDATE ON calificaciones
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_calificacion_tecnico();

-- ── Trigger: incrementar contador de servicios ────────────────
CREATE OR REPLACE FUNCTION fn_actualizar_contadores()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando un servicio se finaliza
    IF NEW.estado = 'finalizado' AND (OLD.estado IS DISTINCT FROM 'finalizado') THEN
        -- Incrementar total del técnico
        IF NEW.tecnico_id IS NOT NULL THEN
            UPDATE tecnicos SET total_servicios = total_servicios + 1
            WHERE id = NEW.tecnico_id;
        END IF;
        -- Incrementar total del cliente
        UPDATE clientes SET total_servicios = total_servicios + 1
        WHERE id = NEW.cliente_id;
        -- Marcar fecha de finalización
        NEW.finalizado_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contadores_servicio
    BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_contadores();

-- ── Trigger: registrar historial de estados ───────────────────
CREATE OR REPLACE FUNCTION fn_registrar_historial_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_estados (servicio_id, estado_anterior, estado_nuevo, cambiado_por)
        VALUES (NEW.id, OLD.estado, NEW.estado, NEW.cliente_id);
        -- Nota: cambiado_por debería venir del contexto de sesión en la app real
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_estado
    AFTER UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_historial_estado();


-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- Vista: servicios con info completa (para el admin y reportes)
CREATE OR REPLACE VIEW v_servicios_completo AS
SELECT
    s.id,
    s.estado,
    s.fecha_agendada,
    s.hora_agendada,
    s.dispositivo,
    s.descripcion_problema,
    s.direccion_servicio,
    s.distrito,
    s.precio_cobrado,
    s.created_at,
    s.finalizado_at,

    -- Cliente
    c_u.nombre      || ' ' || c_u.apellido AS cliente_nombre,
    c_u.email                               AS cliente_email,
    c_u.telefono                            AS cliente_telefono,

    -- Técnico
    t_u.nombre      || ' ' || t_u.apellido AS tecnico_nombre,
    t_u.telefono                            AS tecnico_telefono,
    t.calificacion_prom                     AS tecnico_calificacion,
    t.especialidad                          AS tecnico_especialidad,

    -- Tipo de servicio
    ts.nombre AS tipo_servicio,
    ts.precio_base,

    -- Calificación del servicio
    cal.puntuacion,
    cal.comentario AS comentario_cliente

FROM servicios s
JOIN clientes   cl  ON cl.id  = s.cliente_id
JOIN usuarios   c_u ON c_u.id = cl.id
LEFT JOIN tecnicos  t   ON t.id   = s.tecnico_id
LEFT JOIN usuarios  t_u ON t_u.id = t.id
JOIN tipos_servicio ts  ON ts.id  = s.tipo_servicio_id
LEFT JOIN calificaciones cal ON cal.servicio_id = s.id;

COMMENT ON VIEW v_servicios_completo IS 'Vista denormalizada para reportes y panel admin';

-- Vista: técnicos disponibles hoy
CREATE OR REPLACE VIEW v_tecnicos_disponibles_hoy AS
SELECT
    t.id,
    u.nombre || ' ' || u.apellido AS nombre_completo,
    u.telefono,
    t.especialidad,
    t.zona_cobertura,
    t.calificacion_prom,
    t.total_servicios,
    COALESCE(d.max_servicios, 6)                                    AS max_servicios_hoy,
    COUNT(s.id) FILTER (WHERE s.estado NOT IN ('finalizado','cancelado')) AS servicios_activos_hoy,
    COALESCE(d.max_servicios, 6) -
        COUNT(s.id) FILTER (WHERE s.estado NOT IN ('finalizado','cancelado')) AS cupos_disponibles
FROM tecnicos t
JOIN usuarios u ON u.id = t.id
LEFT JOIN disponibilidad d  ON d.tecnico_id = t.id AND d.fecha = CURRENT_DATE
LEFT JOIN servicios s       ON s.tecnico_id = t.id AND s.fecha_agendada = CURRENT_DATE
WHERE u.estado = 'activo'
  AND t.disponible = TRUE
  AND COALESCE(d.disponible, TRUE) = TRUE
GROUP BY t.id, u.nombre, u.apellido, u.telefono, t.especialidad,
         t.zona_cobertura, t.calificacion_prom, t.total_servicios, d.max_servicios
HAVING COALESCE(d.max_servicios, 6) -
       COUNT(s.id) FILTER (WHERE s.estado NOT IN ('finalizado','cancelado')) > 0;

COMMENT ON VIEW v_tecnicos_disponibles_hoy IS 'RN-04 y RN-05: técnicos con cupos libres para hoy';

-- Vista: dashboard resumen para el admin
CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT
    COUNT(*)                                        AS total_servicios,
    COUNT(*) FILTER (WHERE estado = 'pendiente')    AS pendientes,
    COUNT(*) FILTER (WHERE estado = 'asignado')     AS asignados,
    COUNT(*) FILTER (WHERE estado = 'en_camino')    AS en_camino,
    COUNT(*) FILTER (WHERE estado = 'en_proceso')   AS en_proceso,
    COUNT(*) FILTER (WHERE estado = 'finalizado')   AS finalizados,
    COUNT(*) FILTER (WHERE estado = 'cancelado')    AS cancelados,
    COUNT(*) FILTER (WHERE estado = 'pendiente'
                    AND created_at < NOW() - INTERVAL '24 hours') AS pendientes_alerta,  -- RN-09
    ROUND(AVG(precio_cobrado) FILTER (WHERE estado = 'finalizado'), 2) AS ticket_promedio,
    SUM(precio_cobrado) FILTER (WHERE estado = 'finalizado'
                                AND fecha_agendada >= DATE_TRUNC('month', NOW())) AS ingreso_mes_actual
FROM servicios;

COMMENT ON VIEW v_dashboard_admin IS 'KPIs en tiempo real para el panel del administrador';


-- ============================================================
--  REGLAS DE NEGOCIO IMPLEMENTADAS EN BD
-- ============================================================

-- RN-02: máximo 3 servicios activos por cliente
CREATE OR REPLACE FUNCTION fn_check_max_servicios_cliente()
RETURNS TRIGGER AS $$
DECLARE
    activos INT;
BEGIN
    SELECT COUNT(*) INTO activos
    FROM servicios
    WHERE cliente_id = NEW.cliente_id
      AND estado NOT IN ('finalizado', 'cancelado');

    IF activos >= 3 THEN
        RAISE EXCEPTION 'RN-02: El cliente ya tiene 3 servicios activos. Debe finalizar o cancelar uno antes de agendar otro.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_servicios_cliente
    BEFORE INSERT ON servicios
    FOR EACH ROW EXECUTE FUNCTION fn_check_max_servicios_cliente();

-- RN-05: máximo 6 servicios por técnico por día
CREATE OR REPLACE FUNCTION fn_check_max_servicios_tecnico()
RETURNS TRIGGER AS $$
DECLARE
    asignados INT;
    max_dia   INT;
BEGIN
    IF NEW.tecnico_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(max_servicios, 6) INTO max_dia
    FROM disponibilidad
    WHERE tecnico_id = NEW.tecnico_id AND fecha = NEW.fecha_agendada;

    SELECT COUNT(*) INTO asignados
    FROM servicios
    WHERE tecnico_id     = NEW.tecnico_id
      AND fecha_agendada = NEW.fecha_agendada
      AND estado NOT IN ('cancelado');

    IF asignados >= COALESCE(max_dia, 6) THEN
        RAISE EXCEPTION 'RN-05: El técnico ya tiene el máximo de servicios asignados para ese día.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_servicios_tecnico
    BEFORE INSERT OR UPDATE OF tecnico_id ON servicios
    FOR EACH ROW EXECUTE FUNCTION fn_check_max_servicios_tecnico();

-- RN-07: solo se puede calificar un servicio finalizado
CREATE OR REPLACE FUNCTION fn_check_calificacion_finalizado()
RETURNS TRIGGER AS $$
DECLARE
    est estado_servicio;
BEGIN
    SELECT estado INTO est FROM servicios WHERE id = NEW.servicio_id;
    IF est != 'finalizado' THEN
        RAISE EXCEPTION 'RN-07: Solo se puede calificar un servicio finalizado.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calificacion_finalizado
    BEFORE INSERT ON calificaciones
    FOR EACH ROW EXECUTE FUNCTION fn_check_calificacion_finalizado();


-- ============================================================
--  DATOS DE PRUEBA (SEED)
-- ============================================================

-- Admin por defecto
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
    ('Carlos', 'Ríos', 'admin@techfix.pe',
     crypt('Admin2025!', gen_salt('bf')), '987654321', 'admin');

-- Técnicos de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
    ('Luis',    'Mamani',   'luis@techfix.pe',   crypt('Tech2025!', gen_salt('bf')), '912345678', 'tecnico'),
    ('Pedro',   'Quispe',   'pedro@techfix.pe',  crypt('Tech2025!', gen_salt('bf')), '923456789', 'tecnico'),
    ('María',   'Torres',   'maria@techfix.pe',  crypt('Tech2025!', gen_salt('bf')), '934567890', 'tecnico');

INSERT INTO tecnicos (id, especialidad, zona_cobertura, disponible)
SELECT id,
       CASE nombre
           WHEN 'Luis'  THEN 'Laptops HP, Dell, Lenovo'
           WHEN 'Pedro' THEN 'Celulares Android e iOS'
           WHEN 'María' THEN 'PCs de escritorio, Impresoras'
       END,
       CASE nombre
           WHEN 'Luis'  THEN 'Miraflores, San Isidro, Surco'
           WHEN 'Pedro' THEN 'San Juan de Lurigancho, Santa Anita'
           WHEN 'María' THEN 'Los Olivos, Independencia, Comas'
       END,
       TRUE
FROM usuarios WHERE rol = 'tecnico';

-- Clientes de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
    ('Ana',      'García',  'ana@gmail.com',    crypt('Cliente2025!', gen_salt('bf')), '945678901', 'cliente'),
    ('Jorge',    'López',   'jorge@gmail.com',  crypt('Cliente2025!', gen_salt('bf')), '956789012', 'cliente');

INSERT INTO clientes (id, direccion, distrito)
SELECT id,
       CASE nombre
           WHEN 'Ana'   THEN 'Av. Pardo 450, Dpto 3B'
           WHEN 'Jorge' THEN 'Jr. Las Flores 123'
       END,
       CASE nombre
           WHEN 'Ana'   THEN 'Miraflores'
           WHEN 'Jorge' THEN 'San Juan de Lurigancho'
       END
FROM usuarios WHERE rol = 'cliente';


-- ============================================================
--  RESUMEN FINAL
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '  TechFix DB creada correctamente ✓';
    RAISE NOTICE '============================================';
    RAISE NOTICE '  Tablas : usuarios, clientes, tecnicos,';
    RAISE NOTICE '           tipos_servicio, horarios_atencion,';
    RAISE NOTICE '           disponibilidad, servicios,';
    RAISE NOTICE '           historial_estados, calificaciones,';
    RAISE NOTICE '           notificaciones';
    RAISE NOTICE '  Vistas : v_servicios_completo,';
    RAISE NOTICE '           v_tecnicos_disponibles_hoy,';
    RAISE NOTICE '           v_dashboard_admin';
    RAISE NOTICE '  Reglas : RN-02, RN-05, RN-07, RN-08,';
    RAISE NOTICE '           RN-09 implementadas en BD';
    RAISE NOTICE '============================================';
END $$;
