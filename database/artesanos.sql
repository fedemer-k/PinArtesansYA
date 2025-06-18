-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.4.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para artesanos
CREATE DATABASE IF NOT EXISTS `artesanos` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `artesanos`;

-- Volcando estructura para tabla artesanos.album
CREATE TABLE IF NOT EXISTS `Album` (
  `id_album` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_album`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `album_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.album: ~3 rows (aproximadamente)
INSERT INTO `Album` (`id_album`, `titulo`, `id_usuario`) VALUES
	(1, 'Perritos', 1),
	(2, 'Robotnia', 2),
	(3, 'Futbol', 4);

-- Volcando estructura para tabla artesanos.comentario
CREATE TABLE IF NOT EXISTS `Comentario` (
  `id_comentario` int(11) NOT NULL AUTO_INCREMENT,
  `texto` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_imagen` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `id_imagen` (`id_imagen`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_imagen`) REFERENCES `Imagen` (`id_imagen`),
  CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.comentario: ~4 rows (aproximadamente)
INSERT INTO `Comentario` (`id_comentario`, `texto`, `fecha`, `id_imagen`, `id_usuario`) VALUES
	(2, 'Tremenda base de datos!', '2025-06-16', 1, 2),
	(3, 'Mas que amigos parecen una familia! :)', '2025-06-16', 7, 4),
	(4, 'El perro lampara!', '2025-06-16', 3, 2),
	(5, 'Jajaja tenes razon', '2025-06-17', 7, 2);

-- Volcando estructura para tabla artesanos.estadisticaperfil
CREATE TABLE IF NOT EXISTS `Estadisticaperfil` (
  `id_estadisticaperfil` int(11) NOT NULL AUTO_INCREMENT,
  `TotalImagenes` int(11) DEFAULT NULL,
  `TotalReacciones` int(11) DEFAULT NULL,
  `TotalComentariosRecibidos` int(11) DEFAULT NULL,
  `UltimaActividad` date DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_estadisticaperfil`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `estadisticaperfil_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.estadisticaperfil: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.estadoevento
CREATE TABLE IF NOT EXISTS `Estadoevento` (
  `id_eventoestado` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_eventoestado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.estadoevento: ~3 rows (aproximadamente)
INSERT INTO `Estadoevento` (`id_eventoestado`, `nombre`) VALUES
	(1, 'Realizado'),
	(2, 'Pendiente'),
	(3, 'Cancelado');

-- Volcando estructura para tabla artesanos.estadoreporte
CREATE TABLE IF NOT EXISTS `Estadoreporte` (
  `id_estadoreporte` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_estadoreporte`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.estadoreporte: ~3 rows (aproximadamente)
INSERT INTO `Estadoreporte` (`id_estadoreporte`, `nombre`) VALUES
	(1, 'Sin revisar'),
	(2, 'Revisado y cancelado'),
	(3, 'Revisado y aprobado');

-- Volcando estructura para tabla artesanos.estadoseguimiento
CREATE TABLE IF NOT EXISTS `Estadoseguimiento` (
  `id_estadoseguimiento` int(11) NOT NULL AUTO_INCREMENT,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_estadoseguimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.estadoseguimiento: ~3 rows (aproximadamente)
INSERT INTO `Estadoseguimiento` (`id_estadoseguimiento`, `estado`) VALUES
	(1, 'Aceptada'),
	(2, 'Rechazada'),
	(3, 'Pendiente');

-- Volcando estructura para tabla artesanos.etiqueta
CREATE TABLE IF NOT EXISTS `Etiqueta` (
  `id_etiqueta` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_etiqueta`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.etiqueta: ~2 rows (aproximadamente)
INSERT INTO `Etiqueta` (`id_etiqueta`, `nombre`) VALUES
	(1, 'Juegos'),
	(2, 'Tecnologia');

-- Volcando estructura para tabla artesanos.etiquetaimagen
CREATE TABLE IF NOT EXISTS `Etiquetaimagen` (
  `id_imagen` int(11) NOT NULL,
  `id_etiqueta` int(11) NOT NULL,
  PRIMARY KEY (`id_imagen`,`id_etiqueta`),
  KEY `id_etiqueta` (`id_etiqueta`),
  CONSTRAINT `etiquetaimagen_ibfk_1` FOREIGN KEY (`id_imagen`) REFERENCES `Imagen` (`id_imagen`),
  CONSTRAINT `etiquetaimagen_ibfk_2` FOREIGN KEY (`id_etiqueta`) REFERENCES `Etiqueta` (`id_etiqueta`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.etiquetaimagen: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.evento
CREATE TABLE IF NOT EXISTS `Evento` (
  `id_evento` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` date DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `id_eventoestado` int(11) DEFAULT NULL,
  `id_imagen` int(11) DEFAULT NULL,
  `id_creador` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_evento`),
  KEY `id_eventoestado` (`id_eventoestado`),
  KEY `id_imagen` (`id_imagen`),
  KEY `id_creador` (`id_creador`),
  CONSTRAINT `evento_ibfk_1` FOREIGN KEY (`id_eventoestado`) REFERENCES `Estadoevento` (`id_eventoestado`),
  CONSTRAINT `evento_ibfk_2` FOREIGN KEY (`id_imagen`) REFERENCES `Imagen` (`id_imagen`),
  CONSTRAINT `evento_ibfk_3` FOREIGN KEY (`id_creador`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.evento: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.imagen
CREATE TABLE IF NOT EXISTS `Imagen` (
  `id_imagen` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `privacidad` int(11) DEFAULT NULL,
  `fecha_subida` date DEFAULT NULL,
  `id_album` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_imagen`),
  KEY `id_album` (`id_album`),
  CONSTRAINT `imagen_ibfk_1` FOREIGN KEY (`id_album`) REFERENCES `Album` (`id_album`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.imagen: ~13 rows (aproximadamente)
INSERT INTO `Imagen` (`id_imagen`, `titulo`, `descripcion`, `ruta_imagen`, `privacidad`, `fecha_subida`, `id_album`) VALUES
	(1, 'Imagen 1', '', '/uploads/images/image-1749706917017-453144639.png', 1, '2025-06-12', 1),
	(3, 'Perro lampara', 'El perrito que ilumina tus solitarias noches.', '/uploads/images/image-1749858892123-689593966.jpg', 2, '2025-06-13', 1),
	(4, 'Imagen 1', '', '/uploads/images/image-1749861531380-446593200.jfif', 1, '2025-06-13', 1),
	(5, 'Imagen 2', '', '/uploads/images/image-1749861531380-67720639.jpg', 1, '2025-06-13', 1),
	(6, 'Imagen 3', '', '/uploads/images/image-1749861531380-352593687.webp', 3, '2025-06-13', 1),
	(7, 'Amigos', 'Muchos robots que parecen estar contentos con la compania', '/uploads/images/image-1750023362222-853189374.jpg', 2, '2025-06-15', 2),
	(8, 'Mirando', 'Robot estirando el cuello para ver algo', '/uploads/images/image-1750023362223-245505136.jpg', 1, '2025-06-15', 2),
	(9, 'Que es eso!?', 'Robot que parece estar mal armado.', '/uploads/images/image-1750023362226-373592583.jpg', 1, '2025-06-15', 2),
	(10, 'Pateando', 'Dando un pase', '/uploads/images/image-1750114156383-579755332.jpg', 1, '2025-06-16', 3),
	(11, 'Chilena', 'Disparando al arco', '/uploads/images/image-1750114156383-719953362.jpg', 1, '2025-06-16', 3),
	(12, 'Atajando!', 'Atajando tremendo disparo', '/uploads/images/image-1750114156384-401171957.jpg', 2, '2025-06-16', 3),
	(13, 'PENAAAL!', 'A punto de dar vuelta el marcador', '/uploads/images/image-1750114156384-718012501.jpg', 1, '2025-06-16', 3),
	(14, 'Super chilena', 'Simplemente tremendo el tiempo que tiene esta gente en crear este tipo de cosas.', '/uploads/images/image-1750114156385-491210780.jpg', 1, '2025-06-16', 3);

-- Volcando estructura para tabla artesanos.imagencompartida
CREATE TABLE IF NOT EXISTS `Imagencompartida` (
  `id_imagen` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_usuarioacompartir` int(11) NOT NULL,
  PRIMARY KEY (`id_imagen`,`id_usuario`,`id_usuarioacompartir`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_usuarioacompartir` (`id_usuarioacompartir`),
  CONSTRAINT `imagencompartida_ibfk_1` FOREIGN KEY (`id_imagen`) REFERENCES `Imagen` (`id_imagen`),
  CONSTRAINT `imagencompartida_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `imagencompartida_ibfk_3` FOREIGN KEY (`id_usuarioacompartir`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.imagencompartida: ~0 rows (aproximadamente)
INSERT INTO `Imagencompartida` (`id_imagen`, `id_usuario`, `id_usuarioacompartir`) VALUES
	(6, 1, 2);

-- Volcando estructura para tabla artesanos.motivoreporte
CREATE TABLE IF NOT EXISTS `Motivoreporte` (
  `id_motivoreporte` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_motivoreporte`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.motivoreporte: ~3 rows (aproximadamente)
INSERT INTO `Motivoreporte` (`id_motivoreporte`, `nombre`) VALUES
	(1, 'Rasismo'),
	(2, 'Contenido pornografico'),
	(3, 'Otro');

-- Volcando estructura para tabla artesanos.notificacion
CREATE TABLE IF NOT EXISTS `Notificacion` (
  `id_notificacion` int(11) NOT NULL AUTO_INCREMENT,
  `mensaje` text DEFAULT NULL,
  `leida` tinyint(1) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_usuario_propietario` int(11) DEFAULT NULL,
  `id_usuario_generador` int(11) DEFAULT NULL,
  `id_tiponotificacion` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_notificacion`),
  KEY `id_tiponotificacion` (`id_tiponotificacion`),
  KEY `id_usuario` (`id_usuario_propietario`) USING BTREE,
  KEY `FK_notificacion_usuario_generador` (`id_usuario_generador`),
  CONSTRAINT `FK_notificacion_usuario_generador` FOREIGN KEY (`id_usuario_generador`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `FK_notificacion_usuario_propietario` FOREIGN KEY (`id_usuario_propietario`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `notificacion_ibfk_2` FOREIGN KEY (`id_tiponotificacion`) REFERENCES `Tiponotificacion` (`id_tiponotificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.notificacion: ~30 rows (aproximadamente)
INSERT INTO `Notificacion` (`id_notificacion`, `mensaje`, `leida`, `fecha`, `id_usuario_propietario`, `id_usuario_generador`, `id_tiponotificacion`) VALUES
	(11, 'javier perez te ha enviado una solicitud de seguimiento', 1, '2025-06-16', 1, 4, 1),
	(12, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-16', 4, 1, 2),
	(14, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-16', 1, 2, 1),
	(15, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-16', 2, 1, 2),
	(16, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-16', 1, 2, 1),
	(17, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 1, 2),
	(18, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(20, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(22, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(24, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(26, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(28, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(30, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(31, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 1, 2, 1),
	(32, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 4, 2, 1),
	(33, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 1, 2),
	(34, 'javier perez aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 4, 2),
	(35, 'federico mercado te ha enviado una solicitud de seguimiento', 0, '2025-06-17', 4, 1, 1),
	(36, 'fede merk te ha enviado una solicitud de seguimiento', 0, '2025-06-17', 4, 2, 1),
	(37, 'javier perez te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 2, 4, 1),
	(38, 'federico mercado te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 2, 1, 1),
	(39, 'javier perez te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 2, NULL, 1),
	(40, 'javier perez te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 2, NULL, 1),
	(41, 'federico mercado te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 2, NULL, 1),
	(42, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 1, NULL, 1),
	(43, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 1, NULL, 1),
	(44, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 1, NULL, 1),
	(45, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 1, 2),
	(46, 'fede merk te ha enviado una solicitud de seguimiento', 1, '2025-06-17', 1, 2, 1),
	(47, 'federico mercado aceptó tu solicitud de seguimiento', 1, '2025-06-17', 2, 1, 2);

-- Volcando estructura para tabla artesanos.participanteevento
CREATE TABLE IF NOT EXISTS `Participanteevento` (
  `id_evento` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_evento`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `participanteevento_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `Evento` (`id_evento`),
  CONSTRAINT `participanteevento_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.participanteevento: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.penalizacion
CREATE TABLE IF NOT EXISTS `Penalizacion` (
  `id_penalizacion` int(11) NOT NULL AUTO_INCREMENT,
  `explicacion` varchar(255) DEFAULT NULL,
  `id_motivoreporte` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_penalizacion`),
  KEY `id_motivoreporte` (`id_motivoreporte`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `penalizacion_ibfk_1` FOREIGN KEY (`id_motivoreporte`) REFERENCES `Motivoreporte` (`id_motivoreporte`),
  CONSTRAINT `penalizacion_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.penalizacion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.reporte
CREATE TABLE IF NOT EXISTS `Reporte` (
  `id_reporte` int(11) NOT NULL AUTO_INCREMENT,
  `id_contenido` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id_imagen` int(11) DEFAULT NULL,
  `id_comentario` int(11) DEFAULT NULL,
  `id_tiporeporte` int(11) DEFAULT NULL,
  `id_motivoreporte` int(11) DEFAULT NULL,
  `id_estadoreporte` int(11) DEFAULT NULL,
  `id_usuario_reporta` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `id_imagen` (`id_imagen`),
  KEY `id_comentario` (`id_comentario`),
  KEY `id_tiporeporte` (`id_tiporeporte`),
  KEY `id_motivoreporte` (`id_motivoreporte`),
  KEY `id_estadoreporte` (`id_estadoreporte`),
  KEY `id_usuario_reporta` (`id_usuario_reporta`),
  CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`id_imagen`) REFERENCES `Imagen` (`id_imagen`),
  CONSTRAINT `reporte_ibfk_2` FOREIGN KEY (`id_comentario`) REFERENCES `Comentario` (`id_comentario`),
  CONSTRAINT `reporte_ibfk_3` FOREIGN KEY (`id_tiporeporte`) REFERENCES `Tiporeporte` (`id_tiporeporte`),
  CONSTRAINT `reporte_ibfk_4` FOREIGN KEY (`id_motivoreporte`) REFERENCES `Motivoreporte` (`id_motivoreporte`),
  CONSTRAINT `reporte_ibfk_5` FOREIGN KEY (`id_estadoreporte`) REFERENCES `Estadoreporte` (`id_estadoreporte`),
  CONSTRAINT `reporte_ibfk_6` FOREIGN KEY (`id_usuario_reporta`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.reporte: ~0 rows (aproximadamente)

-- Volcando estructura para tabla artesanos.seguimiento
CREATE TABLE IF NOT EXISTS `Seguimiento` (
  `id_amistad` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_usuarioseguido` int(11) DEFAULT NULL,
  `id_estadosolicitud` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_amistad`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_usuarioseguido` (`id_usuarioseguido`),
  KEY `id_estadosolicitud` (`id_estadosolicitud`),
  CONSTRAINT `seguimiento_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `seguimiento_ibfk_2` FOREIGN KEY (`id_usuarioseguido`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `seguimiento_ibfk_3` FOREIGN KEY (`id_estadosolicitud`) REFERENCES `Estadoseguimiento` (`id_estadoseguimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.seguimiento: ~7 rows (aproximadamente)
INSERT INTO `Seguimiento` (`id_amistad`, `fecha`, `id_usuario`, `id_usuarioseguido`, `id_estadosolicitud`) VALUES
	(2, '2025-06-14', 2, 3, 1),
	(7, '2025-06-16', 4, 1, 1),
	(19, '2025-06-17', 1, 4, 3),
	(20, '2025-06-17', 2, 4, 3),
	(25, '2025-06-17', 4, 2, 3),
	(26, '2025-06-17', 1, 2, 3),
	(30, '2025-06-17', 2, 1, 1);

-- Volcando estructura para tabla artesanos.tiponotificacion
CREATE TABLE IF NOT EXISTS `Tiponotificacion` (
  `id_tiponotificacion` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) DEFAULT NULL,
  `mensajepordefecto` text DEFAULT NULL,
  PRIMARY KEY (`id_tiponotificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.tiponotificacion: ~14 rows (aproximadamente)
INSERT INTO `Tiponotificacion` (`id_tiponotificacion`, `tipo`, `mensajepordefecto`) VALUES
	(1, 'Seguimiento', 'Nueva solicitud de seguimiento'),
	(2, 'Seguimiento', 'Solicitud de seguimiento aceptada'),
	(3, 'Seguimiento', 'Solicitud de seguimiento rechazada'),
	(4, 'Seguimiento', 'Seguimiento eliminado por el seguido'),
	(5, 'Evento', 'Nueva solicitud de evento'),
	(6, 'Evento', 'Solicitud de evento aceptada'),
	(7, 'Evento', 'Solicitud de evento rechazada'),
	(8, 'Evento', 'Evento eliminado'),
	(9, 'Reporte', 'Nuevo reporte realizado'),
	(10, 'Reporte', 'Advertencia: Imagen reportada positivamente'),
	(11, 'Reporte', 'Advertencia: Comentario reportado positivamente'),
	(12, 'Reporte', 'Solicitud de reporte aceptada'),
	(13, 'Reporte', 'Solicitud de reporte rechazada'),
	(14, 'Penalizacion', 'Nueva penalización');

-- Volcando estructura para tabla artesanos.tiporeporte
CREATE TABLE IF NOT EXISTS `Tiporeporte` (
  `id_tiporeporte` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_tiporeporte`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.tiporeporte: ~2 rows (aproximadamente)
INSERT INTO `Tiporeporte` (`id_tiporeporte`, `nombre`) VALUES
	(1, 'imagen'),
	(2, 'comentario');

-- Volcando estructura para tabla artesanos.usuario
CREATE TABLE IF NOT EXISTS `Usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `imagen_perfil` varchar(255) DEFAULT NULL,
  `intereses` text DEFAULT NULL,
  `antecedentes` text DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `modo_vitrina` tinyint(1) DEFAULT NULL,
  `moderador` tinyint(1) DEFAULT NULL,
  `cuenta_suspendida` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla artesanos.usuario: ~4 rows (aproximadamente)
INSERT INTO `Usuario` (`id_usuario`, `nombre`, `email`, `contraseña`, `imagen_perfil`, `intereses`, `antecedentes`, `fecha_registro`, `modo_vitrina`, `moderador`, `cuenta_suspendida`) VALUES
	(1, 'federico mercado', 'federico_mercado_92@hotmail.com', '$2a$12$XcOI6Y87ussJnhS85UVcLOX6rIyeTE8l2Jw5R9d67g..OcHqplvZ.', '/uploads/profiles/profile-1749706002830-297982269.png', 'Programar y aprender técnicas nuevas. La electrónica y robótica también me gusta mucho.', NULL, '2025-06-12', 1, 0, 0),
	(2, 'fede merk', 'merk.fede@gmail.com', '$2a$12$IXIabJKYUiAN127DGdYUju43FcvisB0InyQ4EJLVQf1vef2YWrVOS', NULL, 'programar\r\n', NULL, '2025-06-12', 1, 0, 0),
	(3, 'Erica Busto', 'ericabusto15@gmail.com', '$2a$12$mdWi4yqMEvGeuRT/p.C0TeyutSNurXgNsjjENUr4mpLVotxQAyCNC', NULL, 'Perritos', NULL, '2025-06-12', 0, 0, 0),
	(4, 'javier perez', 'javierperez@hotmail.com', '$2a$12$VLWtrYg4EUSxgJOiY3GykOjluq8ja2wnpD2glXGVAT1TpwHn9ZOQG', '/uploads/profiles/profile-1750163461551-523327468.jpg', 'Futbol y el basket', NULL, '2025-06-16', 0, 0, 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
