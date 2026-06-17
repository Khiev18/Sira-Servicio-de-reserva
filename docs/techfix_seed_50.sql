-- ============================================================
--  TECHFIX -- SEED: 50 Registros de Prueba
--  Incluye: usuarios, clientes, tecnicos, servicios,
--           calificaciones, notificaciones, disponibilidad
-- ============================================================

-- -- Limpiar datos previos (mantener estructura) -------------
DELETE FROM notificaciones;
DELETE FROM calificaciones;
DELETE FROM historial_estados;
DELETE FROM servicios;
DELETE FROM disponibilidad;
DELETE FROM tecnicos;
DELETE FROM clientes;
DELETE FROM usuarios WHERE rol != 'admin';

-- -- 8 TECNICOS ----------------------------------------------
INSERT INTO usuarios (id, nombre, apellido, email, password_hash, telefono, rol, estado) VALUES
  ('t1000000-0000-0000-0000-000000000001','Luis','Mamani','luis@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345601','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000002','Pedro','Quispe','pedro.quispe@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345602','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000003','Maria','Torres','maria.torres@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345603','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000004','Carlos','Huanca','carlos.huanca@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345604','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000005','Ana','Ccopa','ana.ccopa@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345605','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000006','Jorge','Flores','jorge.flores@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345606','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000007','Rosa','Vargas','rosa.vargas@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345607','tecnico','activo'),
  ('t1000000-0000-0000-0000-000000000008','Diego','Condori','diego.condori@techfix.pe',crypt('Tech2025!',gen_salt('bf')),'912345608','tecnico','inactivo');

INSERT INTO tecnicos (id, especialidad, zona_cobertura, calificacion_prom, total_servicios, disponible, bio) VALUES
  ('t1000000-0000-0000-0000-000000000001','Laptops HP, Dell, Lenovo','Miraflores, San Isidro, Surco',4.80,45,true,'Especialista en laptops con 3 anos de experiencia.'),
  ('t1000000-0000-0000-0000-000000000002','Celulares Android e iOS','SJL, Santa Anita, Ate',4.60,38,true,'Tecnico certificado en reparacion de smartphones.'),
  ('t1000000-0000-0000-0000-000000000003','PCs de escritorio, Impresoras','Los Olivos, Independencia, Comas',4.90,52,true,'Especialista en equipos de escritorio y perifericos.'),
  ('t1000000-0000-0000-0000-000000000004','Laptops Asus, Acer, Sony','Barranco, Chorrillos, Lince',4.70,29,true,'Tecnico con experiencia en marcas asiaticas.'),
  ('t1000000-0000-0000-0000-000000000005','Redes, WiFi, Configuracion','La Molina, Santiago de Surco',4.50,21,true,'Especialista en redes domesticas y empresariales.'),
  ('t1000000-0000-0000-0000-000000000006','Celulares Samsung, Xiaomi','Callao, Bellavista, Carmen de la Legua',4.40,33,false,'Tecnico en smartphones Android de gama media.'),
  ('t1000000-0000-0000-0000-000000000007','Laptops Mac, iMac, iPhone','San Borja, San Luis, La Victoria',4.95,61,true,'Experta certificada en productos Apple.'),
  ('t1000000-0000-0000-0000-000000000008','Recuperacion de datos, SSDs','Villa El Salvador, Lurin',4.30,18,false,'Especialista en recuperacion de datos y SSDs.');

-- -- 15 CLIENTES ---------------------------------------------
INSERT INTO usuarios (id, nombre, apellido, email, password_hash, telefono, rol, estado) VALUES
  ('c1000000-0000-0000-0000-000000000001','Ana','Garcia','ana@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600001','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000002','Jorge','Lopez','jorge.lopez@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600002','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000003','Lucia','Mendoza','lucia.mendoza@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600003','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000004','Roberto','Sanchez','roberto.sanchez@hotmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600004','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000005','Carmen','Ramos','carmen.ramos@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600005','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000006','Martin','Diaz','martin.diaz@outlook.com',crypt('Cliente2025!',gen_salt('bf')),'945600006','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000007','Patricia','Vega','patricia.vega@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600007','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000008','Antonio','Ruiz','antonio.ruiz@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600008','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000009','Elena','Castro','elena.castro@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600009','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000010','Fernando','Morales','fernando.morales@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600010','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000011','Sofia','Herrera','sofia.herrera@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600011','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000012','Miguel','Jimenez','miguel.jimenez@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600012','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000013','Isabel','Nunez','isabel.nunez@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600013','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000014','Ricardo','Pacheco','ricardo.pacheco@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600014','cliente','activo'),
  ('c1000000-0000-0000-0000-000000000015','Valentina','Cruz','valentina.cruz@gmail.com',crypt('Cliente2025!',gen_salt('bf')),'945600015','cliente','activo');

INSERT INTO clientes (id, direccion, distrito, total_servicios) VALUES
  ('c1000000-0000-0000-0000-000000000001','Av. Pardo 450 Dpto 3B','Miraflores',3),
  ('c1000000-0000-0000-0000-000000000002','Jr. Las Flores 123','SJL',2),
  ('c1000000-0000-0000-0000-000000000003','Calle Los Pinos 56','San Isidro',4),
  ('c1000000-0000-0000-0000-000000000004','Av. Brasil 1200','Pueblo Libre',1),
  ('c1000000-0000-0000-0000-000000000005','Jr. Cuzco 890','La Victoria',2),
  ('c1000000-0000-0000-0000-000000000006','Av. Javier Prado 3400','San Borja',5),
  ('c1000000-0000-0000-0000-000000000007','Calle Las Camelias 78','Surco',1),
  ('c1000000-0000-0000-0000-000000000008','Av. Tupac Amaru 2345','Comas',3),
  ('c1000000-0000-0000-0000-000000000009','Jr. Arequipa 567','Lince',2),
  ('c1000000-0000-0000-0000-000000000010','Av. Benavides 1890','Miraflores',1),
  ('c1000000-0000-0000-0000-000000000011','Calle Los Cedros 34','La Molina',2),
  ('c1000000-0000-0000-0000-000000000012','Av. Colonial 678','Callao',1),
  ('c1000000-0000-0000-0000-000000000013','Jr. Lima 234','Barranco',3),
  ('c1000000-0000-0000-0000-000000000014','Av. Universitaria 4567','Los Olivos',1),
  ('c1000000-0000-0000-0000-000000000015','Calle Bolognesi 12','Chorrillos',2);

-- -- DISPONIBILIDAD (para los proximos 7 dias) ----------------
INSERT INTO disponibilidad (tecnico_id, fecha, disponible, max_servicios)
SELECT
  t.id,
  CURRENT_DATE + n,
  CASE WHEN t.id = 't1000000-0000-0000-0000-000000000008' THEN false ELSE true END,
  6
FROM tecnicos t
CROSS JOIN generate_series(0, 7) AS n
WHERE t.id IN (
  't1000000-0000-0000-0000-000000000001',
  't1000000-0000-0000-0000-000000000002',
  't1000000-0000-0000-0000-000000000003',
  't1000000-0000-0000-0000-000000000004',
  't1000000-0000-0000-0000-000000000005',
  't1000000-0000-0000-0000-000000000007',
  't1000000-0000-0000-0000-000000000008'
)
ON CONFLICT (tecnico_id, fecha) DO NOTHING;

-- -- 27 SERVICIOS --------------------------------------------
ALTER TABLE servicios DISABLE TRIGGER trg_max_servicios_cliente;

INSERT INTO servicios (id, cliente_id, tecnico_id, tipo_servicio_id, dispositivo, descripcion_problema,
  fecha_agendada, hora_agendada, direccion_servicio, distrito, estado, diagnostico, resultado, precio_cobrado, finalizado_at, created_at)
VALUES
('s0000001-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001',1,'Laptop HP Pavilion 15','No enciende desde ayer','2025-04-10','10:00','Av. Pardo 450 Dpto 3B','Miraflores','finalizado','Falla en la fuente de alimentacion interna','Se reemplazo el chip de carga. Equipo operativo.',120.00,NOW()-INTERVAL '25 days',NOW()-INTERVAL '26 days'),
('s0000001-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002',3,'Samsung Galaxy S21','Pantalla rota tras caida','2025-04-12','14:00','Jr. Las Flores 123','SJL','finalizado','Pantalla LCD danada por impacto','Cambio de pantalla completa. Funcionando al 100%.',180.00,NOW()-INTERVAL '23 days',NOW()-INTERVAL '24 days'),
('s0000001-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000003',5,'PC Escritorio Asus','Va muy lento, mucho calor','2025-04-14','09:00','Calle Los Pinos 56','San Isidro','finalizado','Acumulacion severa de polvo en disipador','Limpieza completa + cambio de pasta termica.',80.00,NOW()-INTERVAL '21 days',NOW()-INTERVAL '22 days'),
('s0000001-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001',4,'Laptop Dell Inspiron','Teclado con varias teclas malas','2025-04-15','11:00','Av. Brasil 1200','Pueblo Libre','finalizado','Dano por liquido en teclado','Reemplazo de teclado completo. Operativo.',150.00,NOW()-INTERVAL '20 days',NOW()-INTERVAL '21 days'),
('s0000001-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000007',8,'MacBook Pro 2020','Pantalla con lineas horizontales','2025-04-16','15:00','Jr. Cuzco 890','La Victoria','finalizado','Falla en cable de pantalla (LVDS)','Reemplazo de cable de pantalla. Display OK.',200.00,NOW()-INTERVAL '19 days',NOW()-INTERVAL '20 days'),
('s0000001-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000003',2,'PC Escritorio HP','No arranca Windows','2025-04-18','10:00','Av. Javier Prado 3400','San Borja','finalizado','SSD danado con sectores defectuosos','Reemplazo de SSD + reinstalacion de Windows.',250.00,NOW()-INTERVAL '17 days',NOW()-INTERVAL '18 days'),
('s0000001-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000004',7,'Laptop Acer Aspire','Muy lento al iniciar','2025-04-20','09:30','Calle Las Camelias 78','Surco','finalizado','HDD defectuoso + sin RAM suficiente','Formateo + upgrade a SSD + 8GB RAM.',320.00,NOW()-INTERVAL '15 days',NOW()-INTERVAL '16 days'),
('s0000001-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002',3,'iPhone 13','Bateria dura muy poco','2025-04-22','13:00','Av. Tupac Amaru 2345','Comas','finalizado','Bateria degradada al 68% de capacidad','Cambio de bateria original. Duracion restaurada.',130.00,NOW()-INTERVAL '13 days',NOW()-INTERVAL '14 days'),
('s0000001-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000001',1,'Laptop Lenovo ThinkPad','Se apaga solo al trabajar','2025-04-24','11:00','Jr. Arequipa 567','Lince','finalizado','Thermal throttling por disipador obstruido','Limpieza + pasta termica. Temperatura normal.',90.00,NOW()-INTERVAL '11 days',NOW()-INTERVAL '12 days'),
('s0000001-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000005',4,'Router Cisco','Sin internet en toda la casa','2025-04-26','10:00','Av. Benavides 1890','Miraflores','finalizado','Configuracion NAT incorrecta del ISP','Reconfiguracion de red. Conectividad restaurada.',70.00,NOW()-INTERVAL '9 days',NOW()-INTERVAL '10 days'),
('s0000001-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000003',5,'Impresora Epson L3150','No imprime, cabezal obstruido','2025-04-28','09:00','Calle Los Cedros 34','La Molina','finalizado','Cabezales obstruidos por tinta seca','Limpieza de cabezales + recarga de tinta.',110.00,NOW()-INTERVAL '7 days',NOW()-INTERVAL '8 days'),
('s0000001-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000007',8,'iPhone 14 Pro','Puerto de carga no funciona','2025-04-30','14:00','Jr. Lima 234','Barranco','finalizado','Conector Lightning con oxidacion','Limpieza y reemplazo de conector. Carga normal.',160.00,NOW()-INTERVAL '5 days',NOW()-INTERVAL '6 days'),
('s0000001-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001',1,'Laptop HP Spectre','No reconoce el WiFi','2025-05-05','10:00','Av. Pardo 450 Dpto 3B','Miraflores','en_proceso','Driver de red desactualizado + antena WiFi danada',NULL,NULL,NULL,NOW()-INTERVAL '1 day'),
('s0000001-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000003',2,'PC Gaming','Pantalla azul al jugar','2025-05-05','14:00','Calle Los Pinos 56','San Isidro','en_proceso','RAM en mal estado + GPU sobrecalentada',NULL,NULL,NULL,NOW()-INTERVAL '2 hours'),
('s0000001-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000004',7,'Laptop Acer','Necesita formateo completo','2025-05-05','09:00','Av. Javier Prado 3400','San Borja','en_proceso',NULL,NULL,NULL,NULL,NOW()-INTERVAL '3 hours'),
('s0000001-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000002',3,'Xiaomi Redmi Note 12','Microfono no funciona en llamadas','2025-05-05','11:00','Jr. Arequipa 567','Lince','en_proceso',NULL,NULL,NULL,NULL,NOW()-INTERVAL '1 hour'),
('s0000001-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000012','t1000000-0000-0000-0000-000000000005',4,'PC con Windows 11','Necesito configurar VPN empresarial','2025-05-05','13:00','Av. Colonial 678','Callao','en_camino',NULL,NULL,NULL,NULL,NOW()-INTERVAL '30 minutes'),
('s0000001-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000001',1,'Laptop HP','Bisagra rota, tapa no cierra','2025-05-06','10:00','Jr. Las Flores 123','SJL','asignado',NULL,NULL,NULL,NULL,NOW()-INTERVAL '2 hours'),
('s0000001-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000007',8,'MacBook Air M1','Bateria se hincho','2025-05-06','14:00','Av. Brasil 1200','Pueblo Libre','asignado',NULL,NULL,NULL,NULL,NOW()-INTERVAL '1 hour'),
('s0000001-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000003',5,'PC Escritorio','Mantenimiento preventivo anual','2025-05-07','09:00','Calle Las Camelias 78','Surco','asignado',NULL,NULL,NULL,NULL,NOW()-INTERVAL '3 hours'),
('s0000001-0000-0000-0000-000000000021','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000002',3,'Samsung Galaxy S23','Pantalla con manchas negras','2025-05-07','11:00','Av. Benavides 1890','Miraflores','asignado',NULL,NULL,NULL,NULL,NOW()-INTERVAL '45 minutes'),
('s0000001-0000-0000-0000-000000000022','c1000000-0000-0000-0000-000000000014','t1000000-0000-0000-0000-000000000004',1,'Laptop Acer Nitro','Rendimiento bajo en juegos','2025-05-08','15:00','Av. Universitaria 4567','Los Olivos','asignado',NULL,NULL,NULL,NULL,NOW()-INTERVAL '20 minutes'),
('s0000001-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000005',NULL,3,'iPhone 12','No carga con ningun cable','2025-05-07','10:00','Jr. Cuzco 890','La Victoria','pendiente',NULL,NULL,NULL,NULL,NOW()-INTERVAL '4 hours'),
('s0000001-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000008',NULL,2,'PC Escritorio','Se reinicia solo cada hora','2025-05-08','09:00','Av. Tupac Amaru 2345','Comas','pendiente',NULL,NULL,NULL,NULL,NOW()-INTERVAL '2 hours'),
('s0000001-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000011',NULL,1,'Laptop Dell','Pantalla parpadeante','2025-05-09','10:00','Calle Los Cedros 34','La Molina','pendiente',NULL,NULL,NULL,NULL,NOW()-INTERVAL '1 hour'),
('s0000001-0000-0000-0000-000000000026','c1000000-0000-0000-0000-000000000013',NULL,6,'Disco Duro Externo 1TB','No detecta el disco al conectar','2025-05-09','14:00','Jr. Lima 234','Barranco','pendiente',NULL,NULL,NULL,NULL,NOW()-INTERVAL '30 minutes'),
('s0000001-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000015',NULL,3,'Huawei P40','Camara no enfoca','2025-05-10','11:00','Calle Bolognesi 12','Chorrillos','pendiente',NULL,NULL,NULL,NULL,NOW()-INTERVAL '15 minutes');

ALTER TABLE servicios ENABLE TRIGGER trg_max_servicios_cliente;

-- -- CALIFICACIONES (para los 12 finalizados) -----------------
INSERT INTO calificaciones (servicio_id, cliente_id, tecnico_id, puntuacion, comentario) VALUES
('s0000001-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001',5,'Excelente servicio, muy puntual y profesional. Totalmente recomendado.'),
('s0000001-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002',4,'Buen trabajo, llego a tiempo y dejo el celular como nuevo.'),
('s0000001-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000003','t1000000-0000-0000-0000-000000000003',5,'La PC quedo perfecta. El tecnico fue muy detallado y explico todo.'),
('s0000001-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000004','t1000000-0000-0000-0000-000000000001',5,'Increible, el teclado quedo como nuevo. Muy recomendado.'),
('s0000001-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000005','t1000000-0000-0000-0000-000000000007',5,'Rosa sabe muchisimo de Mac. La pantalla quedo perfecta.'),
('s0000001-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000006','t1000000-0000-0000-0000-000000000003',4,'Buen servicio. La PC arranca super rapido ahora.'),
('s0000001-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000007','t1000000-0000-0000-0000-000000000004',4,'Muy buen servicio, aunque tardo un poco mas de lo esperado.'),
('s0000001-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000008','t1000000-0000-0000-0000-000000000002',5,'El iPhone dura el doble ahora. Excelente trabajo y muy rapido.'),
('s0000001-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000009','t1000000-0000-0000-0000-000000000001',5,'Soluciono el problema en menos de 1 hora. 100% recomendado.'),
('s0000001-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000010','t1000000-0000-0000-0000-000000000005',4,'Buen servicio, explico bien el problema y lo soluciono rapido.'),
('s0000001-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000011','t1000000-0000-0000-0000-000000000003',5,'La impresora funciona perfecto. El tecnico fue muy amable.'),
('s0000001-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000013','t1000000-0000-0000-0000-000000000007',5,'Rosa es la mejor, mi iPhone carga perfectamente ahora.');

-- -- NOTIFICACIONES -------------------------------------------
INSERT INTO notificaciones (usuario_id, servicio_id, tipo, titulo, mensaje) VALUES
('c1000000-0000-0000-0000-000000000001','s0000001-0000-0000-0000-000000000013','cambio_estado','Tecnico en camino','Luis Mamani esta en camino a tu domicilio. Llegara en aprox. 20 minutos.'),
('c1000000-0000-0000-0000-000000000003','s0000001-0000-0000-0000-000000000014','cambio_estado','Servicio en proceso','Maria Torres esta trabajando en tu equipo.'),
('c1000000-0000-0000-0000-000000000002','s0000001-0000-0000-0000-000000000018','asignacion','Tecnico asignado','Tu servicio ha sido asignado a Luis Mamani (4.80). Te contactara pronto.'),
('c1000000-0000-0000-0000-000000000005','s0000001-0000-0000-0000-000000000023','recordatorio','Servicio pendiente','Tu solicitud esta siendo procesada. Pronto asignaremos un tecnico.'),
('t1000000-0000-0000-0000-000000000001','s0000001-0000-0000-0000-000000000018','asignacion','Nuevo servicio asignado','Se te ha asignado un servicio para manana. Cliente: Jorge Lopez, Distrito: SJL.');

-- -- RESUMEN --------------------------------------------------
DO $$
DECLARE
  total_u INT; total_s INT; total_t INT; total_c INT; total_cal INT;
BEGIN
  SELECT COUNT(*) INTO total_u FROM usuarios;
  SELECT COUNT(*) INTO total_s FROM servicios;
  SELECT COUNT(*) INTO total_t FROM tecnicos;
  SELECT COUNT(*) INTO total_c FROM clientes;
  SELECT COUNT(*) INTO total_cal FROM calificaciones;
  RAISE NOTICE '==========================================';
  RAISE NOTICE '  SEED completado exitosamente';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '  Usuarios totales : %', total_u;
  RAISE NOTICE '  Tecnicos         : %', total_t;
  RAISE NOTICE '  Clientes         : %', total_c;
  RAISE NOTICE '  Servicios        : %', total_s;
  RAISE NOTICE '  Calificaciones   : %', total_cal;
  RAISE NOTICE '==========================================';
END $$;
