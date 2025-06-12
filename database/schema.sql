-- Crear base de datos
CREATE DATABASE IF NOT EXISTS artesanos;
USE artesanos;

CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    contraseña VARCHAR(255),
    imagen_perfil VARCHAR(255),
    intereses TEXT,
    antecedentes TEXT,
    fecha_registro DATE,
    modo_vitrina BOOLEAN,
    moderador BOOLEAN,
    cuenta_suspendida BOOLEAN
);

CREATE TABLE Album (
    id_album INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Imagen (
    id_imagen INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255),
    descripcion TEXT,
    ruta_imagen VARCHAR(255),
    privacidad INT,
    fecha_subida DATE,
    id_album INT,
    FOREIGN KEY (id_album) REFERENCES Album(id_album)
);

CREATE TABLE Comentario (
    id_comentario INT PRIMARY KEY AUTO_INCREMENT,
    texto TEXT,
    fecha DATE,
    id_imagen INT,
    id_usuario INT,
    FOREIGN KEY (id_imagen) REFERENCES Imagen(id_imagen),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Etiqueta (
    id_etiqueta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255)
);

CREATE TABLE EtiquetaImagen (
    id_imagen INT,
    id_etiqueta INT,
    PRIMARY KEY (id_imagen, id_etiqueta),
    FOREIGN KEY (id_imagen) REFERENCES Imagen(id_imagen),
    FOREIGN KEY (id_etiqueta) REFERENCES Etiqueta(id_etiqueta)
);

CREATE TABLE EstadoSeguimiento (
    id_estadoseguimiento INT PRIMARY KEY AUTO_INCREMENT,
    estado VARCHAR(50)
);

CREATE TABLE Seguimiento (
    id_amistad INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    id_usuario INT,
    id_usuarioseguido INT,
    id_estadosolicitud INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_usuarioseguido) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_estadosolicitud) REFERENCES EstadoSeguimiento(id_estadoseguimiento)
);

CREATE TABLE ImagenCompartida (
    id_imagen INT,
    id_usuario INT,
    id_usuarioacompartir INT,
    PRIMARY KEY (id_imagen, id_usuario, id_usuarioacompartir),
    FOREIGN KEY (id_imagen) REFERENCES Imagen(id_imagen),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_usuarioacompartir) REFERENCES Usuario(id_usuario)
);

CREATE TABLE TipoNotificacion (
    id_tiponotificacion INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(100),
    mensajepordefecto TEXT
);

CREATE TABLE Notificacion (
    id_notificacion INT PRIMARY KEY AUTO_INCREMENT,
    mensaje TEXT,
    leida BOOLEAN,
    fecha DATE,
    id_usuario INT,
    id_tiponotificacion INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_tiponotificacion) REFERENCES TipoNotificacion(id_tiponotificacion)
);

CREATE TABLE EstadoEvento (
    id_eventoestado INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50)
);

CREATE TABLE Evento (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255),
    descripcion TEXT,
    fecha_evento DATE,
    ubicacion VARCHAR(255),
    id_eventoestado INT,
    id_imagen INT,
    id_creador INT,
    FOREIGN KEY (id_eventoestado) REFERENCES EstadoEvento(id_eventoestado),
    FOREIGN KEY (id_imagen) REFERENCES Imagen(id_imagen),
    FOREIGN KEY (id_creador) REFERENCES Usuario(id_usuario)
);

CREATE TABLE ParticipanteEvento (
    id_evento INT,
    id_usuario INT,
    estado VARCHAR(50),
    PRIMARY KEY (id_evento, id_usuario),
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE TipoReporte (
    id_tiporeporte INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50)
);

CREATE TABLE EstadoReporte (
    id_estadoreporte INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50)
);

CREATE TABLE MotivoReporte (
    id_motivoreporte INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255)
);

CREATE TABLE Reporte (
    id_reporte INT PRIMARY KEY AUTO_INCREMENT,
    id_contenido INT,
    fecha DATE,
    id_imagen INT,
    id_comentario INT,
    id_tiporeporte INT,
    id_motivoreporte INT,
    id_estadoreporte INT,
    id_usuario_reporta INT,
    FOREIGN KEY (id_imagen) REFERENCES Imagen(id_imagen),
    FOREIGN KEY (id_comentario) REFERENCES Comentario(id_comentario),
    FOREIGN KEY (id_tiporeporte) REFERENCES TipoReporte(id_tiporeporte),
    FOREIGN KEY (id_motivoreporte) REFERENCES MotivoReporte(id_motivoreporte),
    FOREIGN KEY (id_estadoreporte) REFERENCES EstadoReporte(id_estadoreporte),
    FOREIGN KEY (id_usuario_reporta) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Penalizacion (
    id_penalizacion INT PRIMARY KEY AUTO_INCREMENT,
    explicacion VARCHAR(255),
    id_motivoreporte INT,
    id_usuario INT,
    FOREIGN KEY (id_motivoreporte) REFERENCES MotivoReporte(id_motivoreporte),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE EstadisticaPerfil (
    id_estadisticaperfil INT PRIMARY KEY AUTO_INCREMENT,
    TotalImagenes INT,
    TotalReacciones INT,
    TotalComentariosRecibidos INT,
    UltimaActividad DATE,
    id_usuario INT UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Datos por defecto

-- EstadoSeguimiento: - Aceptada - Rechazada - Pendiente
INSERT INTO EstadoSeguimiento (estado) VALUES
('Aceptada'),
('Rechazada'),
('Pendiente');

-- TipoReporte: - imagen - comentario
INSERT INTO TipoReporte (nombre) VALUES
('imagen'),
('comentario');

-- EstadoReporte: - Sin revisar - Revisado y cancelado. - Revisado y aprobado.
INSERT INTO EstadoReporte (nombre) VALUES
('Sin revisar'),
('Revisado y cancelado'),
('Revisado y aprobado');

-- MotivoReporte: - Rasismo - Contenido pornografico - etc (son muchos)
INSERT INTO MotivoReporte (nombre) VALUES
('Rasismo'),
('Contenido pornografico'),
('Otro');

-- EstadoEvento: - Realizado - Pendiente - Cancelado
INSERT INTO EstadoEvento (nombre) VALUES
('Realizado'),
('Pendiente'),
('Cancelado');

-- TipoNotificacion: ver comentarios en el plantuml
INSERT INTO TipoNotificacion (tipo, mensajepordefecto) VALUES
('Seguimiento', 'Nueva solicitud de seguimiento'),
('Seguimiento', 'Solicitud de seguimiento aceptada'),
('Seguimiento', 'Solicitud de seguimiento rechazada'),
('Seguimiento', 'Seguimiento eliminado por el seguido'),
('Evento', 'Nueva solicitud de evento'),
('Evento', 'Solicitud de evento aceptada'),
('Evento', 'Solicitud de evento rechazada'),
('Evento', 'Evento eliminado'),
('Reporte', 'Nuevo reporte realizado'),
('Reporte', 'Advertencia: Imagen reportada positivamente'),
('Reporte', 'Advertencia: Comentario reportado positivamente'),
('Reporte', 'Solicitud de reporte aceptada'),
('Reporte', 'Solicitud de reporte rechazada'),
('Penalizacion', 'Nueva penalización');
