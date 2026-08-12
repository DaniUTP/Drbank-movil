// Login validation utilities
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

// Validate login form
export interface LoginValidationResult {
  email: ValidationResult;
  password: ValidationResult;
  isValid: boolean;
}

export function validateLoginForm(email: string, password: string): LoginValidationResult {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  return {
    email: emailValidation,
    password: passwordValidation,
    isValid: emailValidation.isValid && passwordValidation.isValid,
  };
}
