/**
 * Validation utilities for New Zealand-specific fields
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNZ = (phone) => {
  // Validate phone as a numeric value with at least 7 digits
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length >= 7;
};

export const validateFileUpload = (file) => {
  if (!file) return false;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',      // JPG, JPEG
    'image/png',       // PNG
    'application/pdf', // PDF
    'image/svg+xml',   // SVG
    'image/webp',      // WebP
    'image/gif',       // GIF
    'image/tiff',      // TIFF
  ];
  return file.size <= maxSize && allowedTypes.includes(file.type);
};

export const getFileUploadError = (file) => {
  if (!file) return null;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'application/pdf', 'image/svg+xml',
    'image/webp', 'image/gif', 'image/tiff',
  ];
  
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `File size ${sizeMB}MB exceeds 5MB limit`;
  }
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload JPG, JPEG, PNG, PDF, SVG, WebP, GIF, or TIFF';
  }
  return null;
};

export const validateDriversLicenceNumber = (licenceNumber) => {
  // NZ driver's license numbers are typically AA000000 format
  const licenceRegex = /^[A-Z]{2}\d{6}$/;
  return licenceRegex.test(licenceNumber.toUpperCase().trim());
};

export const validateVersionNumber = (version) => {
  // Version number should be 1-3 digits (1-999)
  if (!version || version === '') return false;
  const num = parseInt(version, 10);
  return !isNaN(num) && num >= 1 && num <= 999;
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
  // NZ postcodes are exactly 4 digits (1000-9999)
  if (!postcode || postcode === '') return false;
  const num = parseInt(postcode, 10);
  return !isNaN(num) && num >= 1000 && num <= 9999;
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

export const combineDateFromParts = (day, month, year) => {
  // Combine day, month, year into a date string format YYYY-MM-DD
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (!day || !month || !year || isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    return null;
  }
  
  // Pad with zeros
  const paddedMonth = String(monthNum).padStart(2, '0');
  const paddedDay = String(dayNum).padStart(2, '0');
  
  return `${yearNum}-${paddedMonth}-${paddedDay}`;
};

export const validateDateOfBirthFromParts = (day, month, year) => {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Validate day (1-31)
  if (!day || isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    return false;
  }
  
  // Validate month (1-12)
  if (!month || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  // Validate year (reasonable range)
  const currentYear = new Date().getFullYear();
  if (!year || isNaN(yearNum) || yearNum < (currentYear - 120) || yearNum > (currentYear - 16)) {
    return false;
  }
  
  const dateStr = combineDateFromParts(day, month, year);
  if (!dateStr) return false;
  
  const birthDate = new Date(dateStr);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) return false;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Must be at least 16 years old
  return age >= 16 && age <= 120;
};

export const validateDateNotInPastFromParts = (day, month, year) => {
  const dateStr = combineDateFromParts(day, month, year);
  if (!dateStr) return false;
  
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if date is valid
  if (isNaN(selectedDate.getTime())) return false;
  
  return selectedDate >= today;
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

  if (!validateDateOfBirthFromParts(data.dateOfBirthDay, data.dateOfBirthMonth, data.dateOfBirthYear)) {
    errors.dateOfBirth = 'Please enter a valid date of birth (day 1-31, month 1-12, and you must be 16-120 years old)';
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

  if (!validateDateNotInPastFromParts(data.licenceExpiryDay, data.licenceExpiryMonth, data.licenceExpiryYear)) {
    errors.licenceExpiry = 'Licence expiry date must be in the future. Please check day, month, and year.';
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

  // Licence front and back are now optional

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

  if (!data.yearsAtEmployment || parseInt(data.yearsAtEmployment) < 0) {
    errors.yearsAtEmployment = 'Years must be a valid number';
  }

  if (!data.monthsAtEmployment || parseInt(data.monthsAtEmployment) < 0 || parseInt(data.monthsAtEmployment) > 11) {
    errors.monthsAtEmployment = 'Months must be between 0-11';
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
