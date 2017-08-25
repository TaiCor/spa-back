CREATE TABLE `photos` (
  `photo_id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(200) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `created` TIMESTAMP  NOT NULL DEFAULT  CURRENT_TIMESTAMP,
  `updated` DATETIME  DEFAULT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `users_user_id_fk` (`user_id`),
  CONSTRAINT `users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;