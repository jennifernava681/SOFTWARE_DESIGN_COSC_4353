# Animal Shelter Database Documentation

## Overview
This database manages all operations for an animal shelter including user management, animal tracking, adoption processes, volunteer management, and donations.

## Database Schema

### Core Tables

#### 1. Users (`users`)
**Purpose:** Store all user information including staff, volunteers, and public users.

**Key Fields:**
- `id_user` (Primary Key)
- `name` - User's full name
- `email` - User's email address
- `password_hash` - Encrypted password
- `role` - User role (manager, volunteer, veterinarian, public)
- `created_at` - Account creation date
- `sex` - User's gender
- `date_of_birth` - User's birth date
- `Security_question` - Security question for password recovery

**Relationships:**
- Links to `adrees` table for address information
- Referenced by multiple tables for user actions

#### 2. Animals (`animals`)
**Purpose:** Track all animals in the shelter system.

**Key Fields:**
- `id_animal` (Primary Key)
- `name` - Animal's name
- `species` - Type of animal (Dog, Cat, etc.)
- `age` - Animal's age in years
- `status` - Current status (available, adopted, surrendered)
- `intake_date` - When animal entered shelter
- `photo_url` - Link to animal's photo
- `sex` - Animal's gender
- `note` - General notes about the animal
- `notes` - Additional notes field

**Relationships:**
- Links to `surrender_requests` for surrendered animals
- Referenced by `medical_records` for health tracking
- Referenced by `animals_has_adoption_requests` for adoption tracking

#### 3. Adoption Requests (`adoption_requests`)
**Purpose:** Track adoption applications and their status.

**Key Fields:**
- `id` (Primary Key)
- `request_date` - When request was submitted
- `status` - Request status (pending, approved, rejected)
- `decision_date` - When decision was made
- `USERS_id_user` - User who submitted request

**Relationships:**
- Links to `users` table
- Referenced by `animals_has_adoption_requests` for animal-request relationships

#### 4. Medical Records (`medical_records`)
**Purpose:** Track animal health and medical history.

**Key Fields:**
- `records_id` (Primary Key)
- `record_type` - Type of medical record (Vaccination, Checkup, Surgery, etc.)
- `record_date` - Date of medical procedure
- `note` - Medical notes and observations
- `ANIMALS_id_animal` - Animal this record belongs to
- `USERS_id_user` - Veterinarian who created the record

**Relationships:**
- Links to `animals` table
- Links to `users` table (veterinarian)

#### 5. Volunteer Tasks (`volunteer_tasks`)
**Purpose:** Track tasks assigned to volunteers.

**Key Fields:**
- `task_id` (Primary Key)
- `task_name` - Name of the task
- `description` - Detailed task description
- `task_date` - Date task is scheduled
- `status` - Task status
- `USERS_id_user` - Volunteer assigned to task

**Relationships:**
- Links to `users` table (volunteer)

#### 6. Donations (`donations`)
**Purpose:** Track all donations to the shelter.

**Key Fields:**
- `id` (Primary Key)
- `donation_type` - Type of donation (Monetary, Food, Toys, Supplies)
- `amount` - Value of donation
- `donation_date` - Date donation was received

**Relationships:**
- Referenced by `users_has_donations` for donor tracking

### Supporting Tables

#### Address Management
- **`adrees`** - Store address information
- **`state`** - Store state information

#### Relationship Tables
- **`animals_has_adoption_requests`** - Many-to-many relationship between animals and adoption requests
- **`users_has_donations`** - Track which users made which donations
- **`users_has_notifications`** - Track user notifications

#### Request Management
- **`surrender_requests`** - Track animal surrender requests
- **`volunteer_requests`** - Track volunteer applications
- **`notifications`** - System notifications for users

## Database Relationships

### One-to-Many Relationships
- User → Adoption Requests (one user can have multiple adoption requests)
- User → Volunteer Tasks (one user can have multiple tasks)
- Animal → Medical Records (one animal can have multiple medical records)
- User → Donations (one user can make multiple donations)

### Many-to-Many Relationships
- Animals ↔ Adoption Requests (through `animals_has_adoption_requests`)
- Users ↔ Donations (through `users_has_donations`)
- Users ↔ Notifications (through `users_has_notifications`)

## Data Integrity

### Foreign Key Constraints
All relationships are properly enforced with foreign key constraints to maintain data integrity.

### Enums Used
- User roles: `manager`, `volunteer`, `veterinarian`, `public`
- Animal status: `available`, `adopted`, `surrendered`
- Adoption request status: `pending`, `approved`, `rejected`
- Surrender request status: `pending`, `approved`, `rejected`
- Volunteer request status: `pending`, `approved`, `rejected`

## Sample Queries

### Find Available Animals
```sql
SELECT name, species, age, sex, photo_url 
FROM animals 
WHERE status = 'available';
```

### Get Adoption Requests with User Info
```sql
SELECT ar.id, ar.request_date, ar.status, u.name, u.email
FROM adoption_requests ar
JOIN users u ON ar.USERS_id_user = u.id_user;
```

### Find Volunteer Tasks for a Specific User
```sql
SELECT task_name, description, task_date, status
FROM volunteer_tasks
WHERE USERS_id_user = [user_id];
```

### Get Medical Records for an Animal
```sql
SELECT record_type, record_date, note, u.name as veterinarian
FROM medical_records mr
JOIN users u ON mr.USERS_id_user = u.id_user
WHERE mr.ANIMALS_id_animal = [animal_id];
```

## Setup Instructions

1. **Create Database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE animal_shelter_db;
   ```

2. **Load Schema:**
   ```bash
   mysql -u root -p < server/config/schema.sql
   ```

3. **Load Sample Data (Optional):**
   ```bash
   mysql -u root -p < server/config/sample_data.sql
   ```

## Maintenance

### Backup Database
```bash
mysqldump -u root -p animal_shelter_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p animal_shelter_db < backup.sql
```

## Notes

- All timestamps use UTC timezone
- Passwords should be hashed before storage
- Photo URLs should point to actual image files
- Consider adding indexes on frequently queried columns for performance
- Regular backups recommended for production use 