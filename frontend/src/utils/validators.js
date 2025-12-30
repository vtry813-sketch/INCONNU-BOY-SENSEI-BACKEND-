import * as Yup from 'yup';

// Common validation schemas
export const emailSchema = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const passwordSchema = Yup.string()
  .min(6, 'Password must be at least 6 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )
  .required('Password is required');

export const nameSchema = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')
  .required('Name is required');

export const phoneSchema = Yup.string()
  .matches(/^[0-9]+$/, 'Phone must contain only numbers')
  .min(10, 'Phone must be at least 10 digits');

export const referralCodeSchema = Yup.string()
  .max(6, 'Referral code must be 6 characters')
  .transform((value) => value?.toUpperCase());

// Server validation
export const serverNameSchema = Yup.string()
  .min(3, 'Server name must be at least 3 characters')
  .max(50, 'Server name cannot exceed 50 characters')
  .required('Server name is required');

export const sessionIdSchema = Yup.string()
  .test('session-id', 'Invalid session ID format', (value) => {
    if (!value) return false;
    return value.startsWith('INCONNU~XD~');
  })
  .required('SESSION_ID is required');

export const ownerNumberSchema = Yup.string()
  .matches(/^[0-9]+$/, 'Phone number must contain only numbers')
  .min(10, 'Phone number must be at least 10 digits')
  .required('OWNER_NUMBER is required');

export const prefixSchema = Yup.string()
  .max(3, 'Prefix cannot exceed 3 characters')
  .default('.');

export const modeSchema = Yup.string()
  .oneOf(['public', 'private'], 'Mode must be either public or private')
  .default('public');

// Complete validation schemas
export const loginSchema = Yup.object().shape({
  email: emailSchema,
  password: Yup.string().required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: phoneSchema,
  referralCode: referralCodeSchema,
});

export const serverSchema = Yup.object().shape({
  name: serverNameSchema,
  sessionId: sessionIdSchema,
  ownerNumber: ownerNumberSchema,
  prefix: prefixSchema,
  mode: modeSchema,
});

export const profileSchema = Yup.object().shape({
  name: nameSchema,
  phone: phoneSchema,
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: emailSchema,
});

export const coinsSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be a whole number'),
  description: Yup.string()
    .required('Description is required')
    .max(500, 'Description too long'),
});

// Environment variables validation
export const validateEnvVars = (env) => {
  const errors = {};
  
  if (!env.SESSION_ID) {
    errors.SESSION_ID = 'SESSION_ID is required';
  } else if (!env.SESSION_ID.startsWith('INCONNU~XD~')) {
    errors.SESSION_ID = 'Invalid SESSION_ID format';
  }
  
  if (!env.OWNER_NUMBER) {
    errors.OWNER_NUMBER = 'OWNER_NUMBER is required';
  } else if (!/^[0-9]+$/.test(env.OWNER_NUMBER)) {
    errors.OWNER_NUMBER = 'OWNER_NUMBER must contain only numbers';
  } else if (env.OWNER_NUMBER.length < 10) {
    errors.OWNER_NUMBER = 'OWNER_NUMBER must be at least 10 digits';
  }
  
  if (env.PREFIX && env.PREFIX.length > 3) {
    errors.PREFIX = 'PREFIX cannot exceed 3 characters';
  }
  
  if (env.MODE && !['public', 'private'].includes(env.MODE)) {
    errors.MODE = 'MODE must be either public or private';
  }
  
  return errors;
};

// Validation helper functions
export const isValidEmail = (email) => {
  return emailSchema.isValidSync(email);
};

export const isValidPassword = (password) => {
  return passwordSchema.isValidSync(password);
};

export const isValidPhone = (phone) => {
  return phoneSchema.isValidSync(phone);
};

export const isValidSessionId = (sessionId) => {
  return sessionIdSchema.isValidSync(sessionId);
};

export const isValidReferralCode = (code) => {
  return referralCodeSchema.isValidSync(code);
};

// Form validation helper
export const validateForm = async (schema, values) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous attributes
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');
  sanitized = sanitized.replace(/on\w+=\w+/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Validate URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate numeric range
export const isValidRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Validate date
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Validate file size
export const isValidFileSize = (fileSize, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

// Validate file type
export const isValidFileType = (fileName, allowedTypes) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};
