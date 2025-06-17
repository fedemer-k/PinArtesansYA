ALTER TABLE `notificacion`
	DROP FOREIGN KEY `notificacion_ibfk_1`;
ALTER TABLE `notificacion`
	CHANGE COLUMN `id_usuario` `id_usuario_propietario` INT(11) NULL DEFAULT NULL AFTER `fecha`,
	DROP INDEX `id_usuario`,
	ADD INDEX `id_usuario` (`id_usuario_propietario`) USING BTREE,
	ADD CONSTRAINT `FK_notificacion_usuario_propietario` FOREIGN KEY (`id_usuario_propietario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE RESTRICT ON DELETE RESTRICT;