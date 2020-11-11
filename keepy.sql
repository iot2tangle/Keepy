CREATE DATABASE IF NOT EXISTS keepy;

USE keepy;

CREATE TABLE `messages` (
  `id` int(11) AUTO_INCREMENT NOT NULL,    
  `message` text NOT NULL,
  `channelId` varchar(300),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4;

CREATE USER 'keepy'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON * . * TO 'keepy'@'localhost';
ALTER USER 'keepy'@localhost IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
