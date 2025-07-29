-- Create missing tables for the animal shelter database
-- Run this in MySQL Workbench to set up all required tables

-- 1. Create state table if it doesn't exist
CREATE TABLE IF NOT EXISTS `state` (
  `state_id` int NOT NULL AUTO_INCREMENT,
  `state` varchar(2) NOT NULL,
  PRIMARY KEY (`state_id`),
  UNIQUE KEY `state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create adrees table if it doesn't exist
CREATE TABLE IF NOT EXISTS `adrees` (
  `idadrees_id` int NOT NULL AUTO_INCREMENT,
  `line_1` varchar(45) DEFAULT NULL,
  `line_2` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state_state_id` int NOT NULL,
  PRIMARY KEY (`idadrees_id`),
  KEY `fk_adrees_state1_idx` (`state_state_id`),
  CONSTRAINT `fk_adrees_state1` FOREIGN KEY (`state_state_id`) REFERENCES `state` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(64) DEFAULT NULL,
  `role` enum('manager','volunteer','veterinarian','public') DEFAULT 'public',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `sex` varchar(45) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `Security_question` varchar(45) DEFAULT NULL,
  `adrees_idadrees_id` int NOT NULL,
  `adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_USERS_adrees1_idx` (`adrees_idadrees_id`,`adrees_state_state_id`),
  CONSTRAINT `fk_USERS_adrees1` FOREIGN KEY (`adrees_idadrees_id`, `adrees_state_state_id`) REFERENCES `adrees` (`idadrees_id`, `state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create user_skills table
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_skills_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create user_preferences table
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `preferences` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Create user_availability table
CREATE TABLE IF NOT EXISTS `user_availability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `available_date` date DEFAULT NULL,
  `day_of_week` varchar(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_availability_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Insert US states data
INSERT IGNORE INTO `state` (`state_id`, `state`) VALUES
(1, 'AL'), (2, 'AK'), (3, 'AZ'), (4, 'AR'), (5, 'CA'),
(6, 'CO'), (7, 'CT'), (8, 'DE'), (9, 'FL'), (10, 'GA'),
(11, 'HI'), (12, 'ID'), (13, 'IL'), (14, 'IN'), (15, 'IA'),
(16, 'KS'), (17, 'KY'), (18, 'LA'), (19, 'ME'), (20, 'MD'),
(21, 'MA'), (22, 'MI'), (23, 'MN'), (24, 'MS'), (25, 'MO'),
(26, 'MT'), (27, 'NE'), (28, 'NV'), (29, 'NH'), (30, 'NJ'),
(31, 'NM'), (32, 'NY'), (33, 'NC'), (34, 'ND'), (35, 'OH'),
(36, 'OK'), (37, 'OR'), (38, 'PA'), (39, 'RI'), (40, 'SC'),
(41, 'SD'), (42, 'TN'), (43, 'TX'), (44, 'UT'), (45, 'VT'),
(46, 'VA'), (47, 'WA'), (48, 'WV'), (49, 'WI'), (50, 'WY'); 