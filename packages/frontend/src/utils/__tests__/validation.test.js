import {
  validateEmail,
  validatePassword,
  validateUser,
  validateProduct
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    test('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('validates strong password', () => {
      const result = validatePassword('StrongPass1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('flags passwords missing length, uppercase, lowercase, or number', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateUser', () => {
    test('validates complete user payload', () => {
      const user = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'ValidPassword1'
      };
      const result = validateUser(user);
      expect(result.isValid).toBe(true);
    });

    test('catches missing user fields', () => {
      const result = validateUser({});
      expect(result.isValid).toBe(false);
      expect(result.errors.firstname).toBeDefined();
      expect(result.errors.lastname).toBeDefined();
      expect(result.errors.username).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    test('flags short username', () => {
      const result = validateUser({
        firstname: 'A',
        lastname: 'B',
        username: 'ab',
        password: 'ValidPassword1'
      });
      expect(result.errors.username).toBe('Username too short');
    });
  });

  describe('validateProduct', () => {
    test('validates correct product payload', () => {
      const product = { name: 'Item', price: 19.99, stock: 10 };
      const result = validateProduct(product);
      expect(result.valid).toBe(true);
    });

    test('rejects empty or missing fields', () => {
      const result = validateProduct({});
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.price).toBeDefined();
      expect(result.errors.stock).toBeDefined();
    });

    test('rejects negative price and stock', () => {
      const result = validateProduct({ name: 'Item', price: -5, stock: -10 });
      expect(result.valid).toBe(false);
      expect(result.errors.price).toBe('Price must be positive');
      expect(result.errors.stock).toContain('Stock cannot be negative');
    });
  });
});
