-- Complete Database Setup for Hope Paws Animal Shelter
-- This file contains all the missing tables and fixes needed for the project

USE animal_shelter_db;

-- =====================================================
-- 1. CREATE MISSING TABLES
-- =====================================================

-- Create events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `date` date NOT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(200) NOT NULL,
  `urgency` enum('low','medium','high','critical') DEFAULT 'low',
  `max_volunteers` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create event_skills table
CREATE TABLE IF NOT EXISTS `event_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `fk_event_skills_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create volunteer_history table for tracking event registrations
CREATE TABLE IF NOT EXISTS `volunteer_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `task_id` int NOT NULL,
  `participation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('registered','attended','cancelled','no_show') DEFAULT 'registered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `fk_volunteer_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `fk_volunteer_history_task` FOREIGN KEY (`task_id`) REFERENCES `volunteer_tasks` (`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create donation_designations table
CREATE TABLE IF NOT EXISTS `donation_designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. FIX EXISTING TABLES
-- =====================================================

-- Add missing columns to volunteer_tasks table
ALTER TABLE `volunteer_tasks` 
ADD COLUMN IF NOT EXISTS `event_id` int DEFAULT NULL AFTER `USERS_id_user`;

-- Add foreign key constraint for volunteer_tasks.event_id
ALTER TABLE `volunteer_tasks` 
ADD CONSTRAINT IF NOT EXISTS `fk_volunteer_tasks_event` 
FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL;

-- Add missing columns to notifications table
ALTER TABLE `notifications` 
ADD COLUMN IF NOT EXISTS `message` text AFTER `is_read`,
ADD COLUMN IF NOT EXISTS `type` varchar(50) DEFAULT 'general' AFTER `message`;

-- Add missing columns to donations table
ALTER TABLE `donations` 
ADD COLUMN IF NOT EXISTS `name` varchar(100) AFTER `id`,
ADD COLUMN IF NOT EXISTS `email` varchar(100) AFTER `name`,
ADD COLUMN IF NOT EXISTS `items` text AFTER `amount`,
ADD COLUMN IF NOT EXISTS `recurring_donation_period` varchar(50) AFTER `items`,
ADD COLUMN IF NOT EXISTS `recurring_donation_end_date` date AFTER `recurring_donation_period`,
ADD COLUMN IF NOT EXISTS `donation_designation_id` int AFTER `recurring_donation_end_date`;

-- Add foreign key constraint for donations.donation_designation_id
ALTER TABLE `donations` 
ADD CONSTRAINT IF NOT EXISTS `fk_donations_designation` 
FOREIGN KEY (`donation_designation_id`) REFERENCES `donation_designations` (`id`) ON DELETE SET NULL;

-- Add missing columns to animals table
ALTER TABLE `animals` 
ADD COLUMN IF NOT EXISTS `weight` decimal(5,2) AFTER `sex`,
ADD COLUMN IF NOT EXISTS `color` varchar(50) AFTER `weight`,
ADD COLUMN IF NOT EXISTS `microchipped` boolean DEFAULT FALSE AFTER `color`,
ADD COLUMN IF NOT EXISTS `microchip_number` varchar(50) AFTER `microchipped`,
ADD COLUMN IF NOT EXISTS `spayed_neutered` boolean DEFAULT FALSE AFTER `microchip_number`,
ADD COLUMN IF NOT EXISTS `vaccinated` boolean DEFAULT FALSE AFTER `spayed_neutered`;

-- =====================================================
-- 3. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample donation designations
INSERT IGNORE INTO `donation_designations` (`id`, `name`, `description`) VALUES
(1, 'General Fund', 'General operating expenses'),
(2, 'Medical Care', 'Veterinary care and medical supplies'),
(3, 'Animal Food', 'Food and treats for animals'),
(4, 'Facility Improvements', 'Building and facility maintenance'),
(5, 'Emergency Fund', 'Emergency medical care and urgent needs');

-- Insert sample events
INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `location`, `urgency`, `max_volunteers`) VALUES
(1, 'Adoption Fair', 'Join us for our monthly adoption fair! Meet wonderful animals looking for their forever homes.', '2024-03-15', '10:00:00', 'Community Park Pavilion', 'medium', 20),
(2, 'Volunteer Training', 'New volunteer orientation and training session', '2024-03-20', '14:00:00', 'Shelter Conference Room', 'low', 15),
(3, 'Emergency Rescue', 'Urgent rescue operation - need experienced volunteers', '2024-03-10', '08:00:00', 'Downtown Area', 'critical', 10),
(4, 'Pet Wellness Clinic', 'Free pet wellness checks and vaccinations', '2024-03-25', '09:00:00', 'Shelter Medical Wing', 'high', 25);

-- Insert sample event skills
INSERT IGNORE INTO `event_skills` (`event_id`, `skill_name`) VALUES
(1, 'Customer Service'),
(1, 'Animal Handling'),
(2, 'Training'),
(3, 'Animal Rescue'),
(3, 'First Aid'),
(4, 'Medical Assistance'),
(4, 'Animal Handling');

-- Insert sample volunteer history (event registrations)
INSERT IGNORE INTO `volunteer_history` (`user_id`, `task_id`, `status`) VALUES
(2, 1, 'attended'),
(2, 2, 'attended'),
(5, 3, 'registered'),
(5, 4, 'registered');

-- Update volunteer_tasks to link with events
UPDATE `volunteer_tasks` SET `event_id` = 1 WHERE `task_name` = 'Dog Walking';
UPDATE `volunteer_tasks` SET `event_id` = 1 WHERE `task_name` = 'Cat Socialization';
UPDATE `volunteer_tasks` SET `event_id` = 2 WHERE `task_name` = 'Cleaning';
UPDATE `volunteer_tasks` SET `event_id` = 2 WHERE `task_name` = 'Administrative';

-- Insert sample notifications with messages
INSERT IGNORE INTO `notifications` (`notifications_id`, `is_read`, `message`, `type`, `created_at`, `USERS_id`) VALUES
(1, 0, 'Your adoption request for Buddy has been approved!', 'adoption', '2024-02-01 10:30:00', 4),
(2, 1, 'Thank you for your donation of $100.00', 'donation', '2024-02-05 14:20:00', 4),
(3, 0, 'New event: Adoption Fair on March 15th', 'event', '2024-02-10 09:15:00', 4),
(4, 0, 'Your volunteer application has been reviewed', 'volunteer', '2024-02-15 16:45:00', 4);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_animals_status` ON `animals` (`status`);
CREATE INDEX IF NOT EXISTS `idx_animals_species` ON `animals` (`species`);
CREATE INDEX IF NOT EXISTS `idx_events_date` ON `events` (`date`);
CREATE INDEX IF NOT EXISTS `idx_events_urgency` ON `events` (`urgency`);
CREATE INDEX IF NOT EXISTS `idx_donations_date` ON `donations` (`donation_date`);
CREATE INDEX IF NOT EXISTS `idx_volunteer_tasks_status` ON `volunteer_tasks` (`status`);
CREATE INDEX IF NOT EXISTS `idx_volunteer_tasks_date` ON `volunteer_tasks` (`task_date`);
CREATE INDEX IF NOT EXISTS `idx_notifications_user_read` ON `notifications` (`USERS_id`, `is_read`);

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
SELECT 'Events table' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'Event Skills table', COUNT(*) FROM event_skills
UNION ALL
SELECT 'Volunteer History table', COUNT(*) FROM volunteer_history
UNION ALL
SELECT 'Donation Designations table', COUNT(*) FROM donation_designations;

-- Verify foreign key relationships
SELECT 'Animals with photos' as check_name, COUNT(*) as count FROM animals WHERE photo_url IS NOT NULL
UNION ALL
SELECT 'Events with skills', COUNT(DISTINCT e.id) FROM events e JOIN event_skills es ON e.id = es.event_id
UNION ALL
SELECT 'Volunteer tasks with events', COUNT(*) FROM volunteer_tasks WHERE event_id IS NOT NULL; 