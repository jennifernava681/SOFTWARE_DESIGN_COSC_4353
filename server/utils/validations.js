/**
 * Centralized validation functions for the animal shelter API
 * This module contains all validation logic for different entities
 */

// Animal validation
const validateAnimalData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length > 100) {
    errors.push('Animal name is required and must be under 100 characters');
  }
  
  if (!data.species || data.species.length > 100) {
    errors.push('Species is required and must be under 100 characters');
  }
  
  if (data.age !== undefined && (isNaN(data.age) || data.age < 0 || data.age > 50)) {
    errors.push('Age must be a valid number between 0 and 50');
  }
  
  if (!data.status || !['available', 'adopted', 'surrendered'].includes(data.status)) {
    errors.push('Status must be available, adopted, or surrendered');
  }
  
  if (data.intake_date && !Date.parse(data.intake_date)) {
    errors.push('Intake date must be a valid date');
  }
  
  if (data.sex && !['male', 'female', 'unknown'].includes(data.sex.toLowerCase())) {
    errors.push('Sex must be male, female, or unknown');
  }
  
  if (data.note && data.note.length > 1000) {
    errors.push('Note must be under 1000 characters');
  }
  
  if (data.notes && data.notes.length > 45) {
    errors.push('Notes must be under 45 characters');
  }
  
  if (data.donation_date && !Date.parse(data.donation_date)) {
    errors.push('Donation date must be a valid date');
  }
  
  return errors;
};

// Donation validation
const validateDonationData = (data) => {
  const errors = [];
  
  if (!data.donation_type || data.donation_type.length > 50) {
    errors.push('Donation type is required and must be under 50 characters');
  }
  
  if (!data.amount || data.amount.length > 20) {
    errors.push('Amount is required and must be under 20 characters');
  }
  
  if (data.donation_date && !Date.parse(data.donation_date)) {
    errors.push('Donation date must be a valid date');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email must be a valid email format');
  }
  
  if (data.items && data.items.length > 500) {
    errors.push('Items description must be under 500 characters');
  }
  
  // Validate donation type values
  const validDonationTypes = ['monetary', 'food', 'toys', 'supplies', 'other'];
  if (data.donation_type && !validDonationTypes.includes(data.donation_type.toLowerCase())) {
    errors.push('Donation type must be monetary, food, toys, supplies, or other');
  }
  
  return errors;
};

// Event validation
const validateEventData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Event title is required and must be under 100 characters');
  }
  
  if (!data.description || data.description.length > 500) {
    errors.push('Event description is required and must be under 500 characters');
  }
  
  if (!data.date || !Date.parse(data.date)) {
    errors.push('Valid event date is required');
  }
  
  if (!data.location || data.location.length > 200) {
    errors.push('Event location is required and must be under 200 characters');
  }
  
  if (!data.urgency || !['low', 'medium', 'high', 'critical'].includes(data.urgency)) {
    errors.push('Urgency must be low, medium, high, or critical');
  }
  
  if (data.required_skills && !Array.isArray(data.required_skills)) {
    errors.push('Required skills must be an array');
  }
  
  return errors;
};

// User validation
const validateUserData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  
  if (data.skills && !Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  }
  
  return errors;
};

// User registration validation
const validateUserRegistration = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('name');
  }
  
  if (!data.email || data.email.trim() === '') {
    errors.push('email');
  }
  
  if (!data.password || data.password.trim() === '') {
    errors.push('password');
  }
  
  if (!data.address || data.address.trim() === '') {
    errors.push('address');
  }
  
  if (!data.city || data.city.trim() === '') {
    errors.push('city');
  }
  
  if (!data.state || data.state.trim() === '') {
    errors.push('state');
  }
  
  return errors;
};

// Volunteer validation
const validateVolunteerData = (data) => {
  const errors = [];
  
  if (!data.full_name || data.full_name.length > 100) {
    errors.push('Full name is required and must be under 100 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  
  if (data.address && data.address.length > 200) {
    errors.push('Address must be under 200 characters');
  }
  
  if (data.city && data.city.length > 100) {
    errors.push('City must be under 100 characters');
  }
  
  if (data.state && data.state.length > 50) {
    errors.push('State must be under 50 characters');
  }
  
  if (data.zip_code && !/^\d{5}(-\d{4})?$/.test(data.zip_code)) {
    errors.push('Zip code must be in valid format (12345 or 12345-6789)');
  }
  
  if (data.availability_date && !Date.parse(data.availability_date)) {
    errors.push('Availability date must be a valid date');
  }
  
  return errors;
};

// Adoption validation
const validateAdoptionData = (data) => {
  const errors = [];
  
  if (!data.adopter_name || data.adopter_name.length > 100) {
    errors.push('Adopter name is required and must be under 100 characters');
  }
  
  if (!data.adopter_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adopter_email)) {
    errors.push('Valid adopter email is required');
  }
  
  if (!data.adopter_phone || !/^\d{10}$/.test(data.adopter_phone.replace(/\D/g, ''))) {
    errors.push('Adopter phone must be 10 digits');
  }
  
  if (!data.adoption_date || !Date.parse(data.adoption_date)) {
    errors.push('Adoption date must be a valid date');
  }
  
  if (data.status && !['pending', 'approved', 'rejected', 'completed'].includes(data.status)) {
    errors.push('Status must be pending, approved, rejected, or completed');
  }
  
  return errors;
};

// Vet validation
const validateVetData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length > 100) {
    errors.push('Vet name is required and must be under 100 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  
  if (data.specialization && data.specialization.length > 200) {
    errors.push('Specialization must be under 200 characters');
  }
  
  return errors;
};

// Notification validation
const validateNotificationData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Notification title is required and must be under 100 characters');
  }
  
  if (!data.message || data.message.length > 500) {
    errors.push('Notification message is required and must be under 500 characters');
  }
  
  if (data.type && !['info', 'warning', 'error', 'success'].includes(data.type)) {
    errors.push('Type must be info, warning, error, or success');
  }
  
  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Priority must be low, medium, high, or urgent');
  }
  
  return errors;
};

// Generic validation helpers
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

const validateDate = (date) => {
  if (!date) return false;
  const parsed = Date.parse(date);
  return !isNaN(parsed) && parsed > 0;
};

const validateRequired = (value, fieldName) => {
  return value && value.toString().trim() !== '';
};

const validateLength = (value, maxLength, fieldName) => {
  return !value || value.length <= maxLength;
};

module.exports = {
  // Entity-specific validations
  validateAnimalData,
  validateDonationData,
  validateEventData,
  validateUserData,
  validateUserRegistration,
  validateVolunteerData,
  validateAdoptionData,
  validateVetData,
  validateNotificationData,
  
  // Generic validation helpers
  validateEmail,
  validatePhone,
  validateDate,
  validateRequired,
  validateLength
}; 