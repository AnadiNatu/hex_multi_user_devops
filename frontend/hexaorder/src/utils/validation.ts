export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean;
  message?: string;
};

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rules.message || 'This field is required';
  }

  if (value) {
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return rules.message || 'Invalid email address';
    }

    if (rules.url && !/^https?:\/\/.+/.test(value)) {
      return rules.message || 'Invalid URL';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return rules.message || `Minimum value is ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return rules.message || `Maximum value is ${rules.max}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }

    if (rules.custom && !rules.custom(value)) {
      return rules.message || 'Invalid value';
    }
  }

  return null;
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule>>
): { isValid: boolean; errors: ValidationErrors<T> } {
  const errors: ValidationErrors<T> = {};

  for (const field in rules) {
    const error = validateField(data[field], rules[field]!);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Pre-defined validation rules
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: { required: true, minLength: 6 },
  strongPassword: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain uppercase, lowercase, and number',
  },
  positiveNumber: { required: true, min: 0 },
  url: { url: true },
  phone: {
    pattern: /^\+?[\d\s\-()]+$/,
    message: 'Invalid phone number',
  },
};