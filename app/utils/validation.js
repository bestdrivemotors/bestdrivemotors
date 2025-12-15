/**
 * Validation utilities for New Zealand-specific fields
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNZ = (phone) => {
  // NZ phone number format: 02x xxx xxxx or 04x xxx xxxx or similar
  const phoneRegex = /^(\+64|0)[\d\s\-()]{8,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDriversLicenceNumber = (licenceNumber) => {
  // NZ driver's license numbers are typically AA000000 format
  const licenceRegex = /^[A-Z]{2}\d{6}$/;
  return licenceRegex.test(licenceNumber.toUpperCase().trim());
};

export const validateVersionNumber = (version) => {
  // Version number should be 1-3 digits
  const versionRegex = /^\d{1,3}$/;
  return versionRegex.test(version.trim());
};

export const validateDateNotInPast = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateDateOfBirth = (date) => {
  if (!date) return false;
  const birthDate = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Must be at least 16 years old
  return age >= 16 && age <= 120;
};

export const validatePostcode = (postcode) => {
  // NZ postcodes are 4 digits
  const postcodeRegex = /^\d{4}$/;
  return postcodeRegex.test(postcode.trim());
};

export const validateAddress = (address) => {
  return address && address.trim().length >= 5;
};

export const validateSuburb = (suburb) => {
  return suburb && suburb.trim().length >= 2;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateIncome = (income) => {
  const incomeNum = parseFloat(income);
  return !isNaN(incomeNum) && incomeNum >= 0;
};

export const validateExpense = (expense) => {
  const expenseNum = parseFloat(expense);
  return !isNaN(expenseNum) && expenseNum >= 0;
};

export const validateDependents = (dependents) => {
  const depNum = parseInt(dependents, 10);
  return !isNaN(depNum) && depNum >= 0 && depNum <= 20;
};

/**
 * Step-specific validation functions
 */
export const validateStep1 = (data) => {
  const errors = {};

  if (!validateName(data.firstName)) {
    errors.firstName = 'First name is required and must be 2-100 characters';
  }

  if (data.middleName && !validateName(data.middleName)) {
    errors.middleName = 'Middle name must be 2-100 characters';
  }

  if (!validateName(data.lastName)) {
    errors.lastName = 'Last name is required and must be 2-100 characters';
  }

  if (!validateDateOfBirth(data.dateOfBirth)) {
    errors.dateOfBirth = 'You must be at least 16 years old';
  }

  if (!data.driverLicenceType) {
    errors.driverLicenceType = 'Driver licence type is required';
  }

  if (!validateDriversLicenceNumber(data.driverLicenceNumber)) {
    errors.driverLicenceNumber = 'Invalid driver licence number (format: AA000000)';
  }

  if (!validateVersionNumber(data.versionNumber)) {
    errors.versionNumber = 'Version number must be 1-3 digits';
  }

  if (!validateDateNotInPast(data.licenceExpiry)) {
    errors.licenceExpiry = 'Licence expiry date must be in the future';
  }

  if (!data.maritalStatus) {
    errors.maritalStatus = 'Marital status is required';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Valid email address is required';
  }

  if (!validatePhoneNZ(data.phone)) {
    errors.phone = 'Valid NZ phone number is required';
  }

  return errors;
};

export const validateStep2 = (data) => {
  const errors = {};

  if (!validateAddress(data.currentAddress)) {
    errors.currentAddress = 'Current address is required (minimum 5 characters)';
  }

  if (!validateSuburb(data.suburb)) {
    errors.suburb = 'Suburb is required';
  }

  if (!validatePostcode(data.postcode)) {
    errors.postcode = 'Postcode must be 4 digits';
  }

  if (!data.residentialStatus) {
    errors.residentialStatus = 'Residential status is required';
  }

  if (!data.yearsAtAddress || parseInt(data.yearsAtAddress) < 0) {
    errors.yearsAtAddress = 'Years must be a valid number';
  }

  if (!data.monthsAtAddress || parseInt(data.monthsAtAddress) < 0 || parseInt(data.monthsAtAddress) > 11) {
    errors.monthsAtAddress = 'Months must be between 0-11';
  }

  return errors;
};

export const validateStep3 = (data) => {
  const errors = {};

  if (!data.employmentStatus) {
    errors.employmentStatus = 'Employment status is required';
  }

  if (!validateName(data.employerName)) {
    errors.employerName = 'Employer name is required';
  }

  if (!validateName(data.occupation)) {
    errors.occupation = 'Occupation is required';
  }

  return errors;
};

export const validateStep4 = (data) => {
  const errors = {};

  if (!validateIncome(data.income)) {
    errors.income = 'Income must be a valid number';
  }

  if (!data.payFrequency) {
    errors.payFrequency = 'Pay frequency is required';
  }

  if (!validateDependents(data.dependents)) {
    errors.dependents = 'Dependents must be a valid number between 0-20';
  }

  if (!validateExpense(data.rentMortgage)) {
    errors.rentMortgage = 'Rent/Mortgage must be a valid number';
  }

  if (!validateExpense(data.otherLoans)) {
    errors.otherLoans = 'Other loans must be a valid number';
  }

  if (!data.termsConsent) {
    errors.termsConsent = 'You must accept the terms';
  }

  if (!data.privacyConsent) {
    errors.privacyConsent = 'You must accept the privacy policy';
  }

  return errors;
};
