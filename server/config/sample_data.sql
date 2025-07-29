USE animal_shelter_db;

-- =====================================================
-- SAMPLE DATA FOR ANIMAL SHELTER DATABASE
-- =====================================================

-- Insert sample states
INSERT INTO `state` (`state_id`, `state`) VALUES
(1, 'Texas'),
(2, 'California'),
(3, 'New York'),
(4, 'Florida'),
(5, 'Illinois');

-- Insert sample addresses
INSERT INTO `adrees` (`idadrees_id`, `line_1`, `line_2`, `city`, `state_state_id`) VALUES
(1, '123 Main St', 'Apt 101', 'Houston', 1),
(2, '456 Oak Ave', NULL, 'Dallas', 1),
(3, '789 Pine Rd', 'Suite 200', 'Austin', 1),
(4, '321 Elm St', NULL, 'San Antonio', 1),
(5, '654 Maple Dr', 'Unit 5', 'Fort Worth', 1);

-- Insert sample users
INSERT INTO `users` (`id_user`, `name`, `email`, `password_hash`, `role`, `created_at`, `sex`, `date_of_birth`, `Security_question`, `adrees_idadrees_id`, `adrees_state_state_id`) VALUES
(1, 'John Smith', 'john.smith@email.com', 'hashed_password_1', 'manager', '2024-01-15', 'Male', '1985-03-15', 'What is your pet name?', 1, 1),
(2, 'Sarah Johnson', 'sarah.j@email.com', 'hashed_password_2', 'volunteer', '2024-01-20', 'Female', '1990-07-22', 'What is your favorite color?', 2, 1),
(3, 'Dr. Mike Wilson', 'dr.mike@email.com', 'hashed_password_3', 'veterinarian', '2024-01-25', 'Male', '1980-11-08', 'What is your hometown?', 3, 1),
(4, 'Lisa Davis', 'lisa.d@email.com', 'hashed_password_4', 'public', '2024-02-01', 'Female', '1995-05-12', 'What is your first pet?', 4, 1),
(5, 'Tom Brown', 'tom.b@email.com', 'hashed_password_5', 'volunteer', '2024-02-05', 'Male', '1988-09-30', 'What is your favorite food?', 5, 1);

-- Insert sample animals
INSERT INTO `animals` (`id_animal`, `name`, `species`, `age`, `status`, `intake_date`, `photo_url`, `sex`, `note`, `notes`, `donation_date`, `surrender_requests_USERS_id_user`, `surrender_requests_USERS_adrees_idadrees_id`, `surrender_requests_USERS_adrees_state_state_id`) VALUES
(1, 'Buddy', 'Dog', 3, 'available', '2024-01-10', '/images/animals/buddy.png', 'Male', 'Friendly golden retriever', 'Good with kids', NULL, 4, 4, 1),
(2, 'Luna', 'Cat', 2, 'available', '2024-01-15', '/images/animals/luna.png', 'Female', 'Calm and affectionate', 'Loves to cuddle', NULL, 4, 4, 1),
(3, 'Max', 'Dog', 4, 'adopted', '2024-01-05', '/images/animals/max.png', 'Male', 'Energetic border collie', 'Great for active families', '2024-02-01', 4, 4, 1),
(4, 'Whiskers', 'Cat', 1, 'available', '2024-01-20', '/images/animals/whiskers.png', 'Male', 'Playful kitten', 'Loves toys', NULL, 4, 4, 1),
(5, 'Rocky', 'Dog', 5, 'available', '2024-01-25', '/images/animals/rocky.png', 'Male', 'Gentle giant', 'Great with other dogs', NULL, 4, 4, 1);

-- Insert sample adoption requests
INSERT INTO `adoption_requests` (`id`, `request_date`, `status`, `decision_date`, `USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`) VALUES
(1, '2024-02-01 10:30:00', 'approved', '2024-02-05 14:20:00', 4, 4, 1),
(2, '2024-02-10 09:15:00', 'pending', NULL, 4, 4, 1),
(3, '2024-02-15 16:45:00', 'rejected', '2024-02-18 11:30:00', 4, 4, 1);

-- Insert sample donations
INSERT INTO `donations` (`id`, `donation_type`, `amount`, `donation_date`) VALUES
(1, 'Monetary', '100.00', '2024-01-15'),
(2, 'Food', '50.00', '2024-01-20'),
(3, 'Toys', '25.00', '2024-01-25'),
(4, 'Monetary', '200.00', '2024-02-01'),
(5, 'Supplies', '75.00', '2024-02-05');

-- Insert sample medical records
INSERT INTO `medical_records` (`records_id`, `record_type`, `record_date`, `created_at`, `note`, `medical_recordscol`, `ANIMALS_id_animal`, `USERS_id_user`) VALUES
(1, 'Vaccination', '2024-01-12', '2024-01-12 09:00:00', 'Rabies vaccine administered', NULL, 1, 3),
(2, 'Checkup', '2024-01-17', '2024-01-17 14:30:00', 'Routine health check - all good', NULL, 2, 3),
(3, 'Surgery', '2024-01-22', '2024-01-22 11:00:00', 'Spay surgery completed successfully', NULL, 3, 3),
(4, 'Vaccination', '2024-01-27', '2024-01-27 10:15:00', 'FVRCP vaccine given', NULL, 4, 3),
(5, 'Checkup', '2024-02-01', '2024-02-01 16:45:00', 'Annual physical - healthy', NULL, 5, 3);

-- Insert sample volunteer requests
INSERT INTO `volunteer_requests` (`id`, `availability_date`, `skills`, `motivation`, `request_date`, `status`, `availability_time`, `USERS_id_user`) VALUES
(1, '2024-01-25', 'Animal handling, Cleaning', 'I love animals and want to help', '2024-01-20', 'approved', 'Weekends 9AM-2PM', 2),
(2, '2024-02-01', 'Administrative, Customer service', 'Looking to gain experience', '2024-01-28', 'pending', 'Weekdays 3PM-7PM', 5),
(3, '2024-02-05', 'Animal training, Walking', 'Passionate about animal welfare', '2024-02-01', 'approved', 'Mornings 8AM-12PM', 2);

-- Insert sample volunteer tasks
INSERT INTO `volunteer_tasks` (`task_id`, `task_name`, `description`, `task_date`, `status`, `created_at`, `USERS_id_user`) VALUES
(1, 'Dog Walking', 'Walk dogs in the morning', '2024-02-01', 'completed', '2024-01-30 08:00:00', 2),
(2, 'Cat Socialization', 'Spend time with cats', '2024-02-02', 'completed', '2024-01-30 08:00:00', 2),
(3, 'Cleaning', 'Clean kennels and common areas', '2024-02-03', 'pending', '2024-01-30 08:00:00', 2),
(4, 'Administrative', 'Help with paperwork', '2024-02-04', 'pending', '2024-01-30 08:00:00', 5);

-- Insert sample notifications
INSERT INTO `notifications` (`notifications_id`, `is_read`, `created_at`, `USERS_id`) VALUES
(1, 0, '2024-02-01 10:30:00', 4),
(2, 1, '2024-02-05 14:20:00', 4),
(3, 0, '2024-02-10 09:15:00', 4),
(4, 0, '2024-02-15 16:45:00', 4);

-- Insert sample surrender requests
INSERT INTO `surrender_requests` (`animal_description`, `reason`, `surrender_requestscol`, `status`, `surrender_requestscol1`, `USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`) VALUES
('Golden retriever, 3 years old', 'Moving to apartment that doesn\'t allow pets', NULL, 'approved', NULL, 4, 4, 1),
('Siamese cat, 2 years old', 'Allergic reaction in family', NULL, 'approved', NULL, 4, 4, 1),
('Mixed breed puppy, 6 months', 'Unable to provide proper care', NULL, 'pending', NULL, 4, 4, 1);

-- Insert sample user-donation relationships
INSERT INTO `users_has_donations` (`USERS_id`, `donations_id`) VALUES
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5);

-- Insert sample user-notification relationships
INSERT INTO `users_has_notifications` (`USERS_id`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`, `USERS_volunteer_requests_id`, `notifications_idnotifications_id`) VALUES
(4, 4, 1, 1, 1),
(4, 4, 1, 1, 2),
(4, 4, 1, 1, 3),
(4, 4, 1, 1, 4);

-- Insert sample animal-adoption request relationships
INSERT INTO `animals_has_adoption_requests` (`ANIMALS_id_animal`, `adoption_requests_id`, `adoption_requests_USERS_id_user`, `adoption_requests_USERS_adrees_idadrees_id`, `adoption_requests_USERS_adrees_state_state_id`) VALUES
(3, 1, 4, 4, 1),
(1, 2, 4, 4, 1),
(2, 3, 4, 4, 1);

-- =====================================================
-- SAMPLE DATA INSERTION COMPLETE
-- ===================================================== 