-- Complete setup for user registration functionality
-- Run this in MySQL Workbench to set up all required tables and fixes

-- 1. Fix users table to have auto-increment primary key
ALTER TABLE `users` MODIFY `id_user` int NOT NULL AUTO_INCREMENT;

-- 2. Fix adrees table to have auto-increment primary key  
ALTER TABLE `adrees` MODIFY `idadrees_id` int NOT NULL AUTO_INCREMENT;

-- 3. Create user_skills table
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_skills_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create user_preferences table
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

-- 5. Create user_availability table
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

