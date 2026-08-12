// Register validation utilities
// Based on backend validation rules

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation rules:
// - Required
// - Valid email format
// - Max 65 characters
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'El email es requerido' };
  }

  if (email.length > 65) {
    return { isValid: false, error: 'El email no puede exceder 65 caracteres' };
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El formato del email es inválido' };
  }

  return { isValid: true };
}

// Password validation rules:
// - Required
// - Min 8 characters
// - Max 15 characters
// - Must contain letters
// - Must contain mixed case (uppercase and lowercase)
// - Must contain numbers
// - Must contain symbols
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 15) {
    return { isValid: false, error: 'La contraseña no puede exceder 15 caracteres' };
  }

  // Check for letters
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener letras' };
  }

  // Check for mixed case (both uppercase and lowercase)
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener mayúsculas y minúsculas' };
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener números' };
  }

  // Check for symbols (special characters)
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener símbolos especiales' };
  }

  return { isValid: true };
}

// Name validation rules:
// - Required
// - Min 3 characters
// - Max 15 characters
// - Only letters and spaces
export function validateName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'El nombre es requerido' };
  }

  if (name.length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (name.length > 15) {
    return { isValid: false, error: 'El nombre no puede exceder 15 caracteres' };
  }

  // Only letters and spaces
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'El nombre solo puede contener letras y espacios' };
  }

  return { isValid: true };
}

// Last name validation rules:
// - Required
// - Min 3 characters
// - Max 15 characters
// - Only letters and spaces
export function validateLastName(lastName: string): ValidationResult {
  if (!lastName || lastName.trim() === '') {
    return { isValid: false, error: 'El apellido es requerido' };
  }

  if (lastName.length < 3) {
    return { isValid: false, error: 'El apellido debe tener al menos 3 caracteres' };
  }

  if (lastName.length > 15) {
    return { isValid: false, error: 'El apellido no puede exceder 15 caracteres' };
  }

  // Only letters and spaces
  const lastNameRegex = /^[a-zA-Z\s]+$/;
  if (!lastNameRegex.test(lastName)) {
    return { isValid: false, error: 'El apellido solo puede contener letras y espacios' };
  }

  return { isValid: true };
}

// University validation rules:
// - Optional (nullable)
// - Only letters (alpha)
// - Min 3 characters (if provided)
// - Max 50 characters (assuming reasonable max)
export function validateUniversity(university: string): ValidationResult {
  if (!university || university.trim() === '') {
    return { isValid: true }; // Optional field
  }

  if (university.length < 3) {
    return { isValid: false, error: 'La universidad debe tener al menos 3 caracteres' };
  }

  if (university.length > 50) {
    return { isValid: false, error: 'La universidad no puede exceder 50 caracteres' };
  }

  // Only letters
  const universityRegex = /^[a-zA-Z]+$/;
  if (!universityRegex.test(university)) {
    return { isValid: false, error: 'La universidad solo puede contener letras' };
  }

  return { isValid: true };
}

// Validate register form
export interface RegisterValidationResult {
  name: ValidationResult;
  lastName: ValidationResult;
  email: ValidationResult;
  password: ValidationResult;
  university: ValidationResult;
  isValid: boolean;
}

export function validateRegisterForm(
  name: string,
  lastName: string,
  email: string,
  password: string,
  university: string
): RegisterValidationResult {
  const nameValidation = validateName(name);
  const lastNameValidation = validateLastName(lastName);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const universityValidation = validateUniversity(university);

  return {
    name: nameValidation,
    lastName: lastNameValidation,
    email: emailValidation,
    password: passwordValidation,
    university: universityValidation,
    isValid: nameValidation.isValid && lastNameValidation.isValid && emailValidation.isValid && passwordValidation.isValid && universityValidation.isValid,
  };
}
