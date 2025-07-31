const { 
  validateAnimalData, 
  validateDonationData, 
  validateEventData,
  validateUserData,
  validateUserRegistration,
  validateVolunteerData,
  validateEmail,
  validatePhone,
  validateDate
} = require('./utils/validations');

console.log('=== Testing Validation Functions ===\n');

// Test Animal Validation
console.log('1. Animal Validation Tests:');
const animalData = {
  name: '', // Invalid: empty name
  species: 'Dog',
  age: -5, // Invalid: negative age
  status: 'invalid_status', // Invalid: not in allowed values
  sex: 'invalid_sex' // Invalid: not in allowed values
};

const animalErrors = validateAnimalData(animalData);
console.log('Animal validation errors:', animalErrors);

// Test Donation Validation
console.log('\n2. Donation Validation Tests:');
const donationData = {
  donation_type: 'invalid_type', // Invalid: not in allowed types
  amount: '',
  email: 'invalid-email', // Invalid: not valid email format
  items: 'A'.repeat(600) // Invalid: too long
};

const donationErrors = validateDonationData(donationData);
console.log('Donation validation errors:', donationErrors);

// Test Event Validation
console.log('\n3. Event Validation Tests:');
const eventData = {
  title: 'Test Event',
  description: 'Test Description',
  date: 'invalid-date', // Invalid: not valid date
  location: 'Test Location',
  urgency: 'invalid_urgency', // Invalid: not in allowed values
  required_skills: 'not_an_array' // Invalid: not an array
};

const eventErrors = validateEventData(eventData);
console.log('Event validation errors:', eventErrors);

// Test User Registration Validation
console.log('\n4. User Registration Validation Tests:');
const userRegData = {
  name: '', // Invalid: empty name
  email: 'test@example.com',
  password: 'password123',
  address: '123 Main St',
  city: 'Test City',
  state: '' // Invalid: empty state
};

const userRegErrors = validateUserRegistration(userRegData);
console.log('User registration validation errors:', userRegErrors);

// Test Generic Validation Helpers
console.log('\n5. Generic Validation Helper Tests:');
console.log('Email validation (test@example.com):', validateEmail('test@example.com'));
console.log('Email validation (invalid-email):', validateEmail('invalid-email'));
console.log('Phone validation (1234567890):', validatePhone('1234567890'));
console.log('Phone validation (123):', validatePhone('123'));
console.log('Date validation (2024-01-01):', validateDate('2024-01-01'));
console.log('Date validation (invalid-date):', validateDate('invalid-date'));

console.log('\n=== Validation Tests Complete ==='); 