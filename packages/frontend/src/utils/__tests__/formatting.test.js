import {
  formatDate,
  formatPrice,
  formatStock,
  formatUserName,
  formatSearchTerm
} from '../formatting';

describe('Formatting Utilities', () => {
  describe('formatDate', () => {
    test('returns "Invalid Date" for null or undefined date', () => {
      expect(formatDate(null)).toBe('Invalid Date');
      expect(formatDate(undefined)).toBe('Invalid Date');
    });

    test('formats valid date string', () => {
      const date = new Date('2026-09-14T10:00:00Z');
      expect(formatDate(date)).toContain('/2026');
    });
  });

  describe('formatPrice', () => {
    test('formats price numbers with currency symbol and 2 decimals', () => {
      expect(formatPrice(99.99)).toBe('$99.99');
      expect(formatPrice(1000)).toBe('$1,000.00');
      expect(formatPrice('50.5')).toBe('$50.50');
    });

    test('returns $0.00 for falsy or invalid price input', () => {
      expect(formatPrice(null)).toBe('$0.00');
      expect(formatPrice(0)).toBe('$0.00');
      expect(formatPrice('abc')).toBe('$0.00');
    });
  });

  describe('formatStock', () => {
    test('handles invalid or NaN stock', () => {
      expect(formatStock('abc')).toBe('Out of Stock');
      expect(formatStock(null)).toBe('Out of Stock');
    });

    test('returns "Out of Stock" for 0 stock', () => {
      expect(formatStock(0)).toBe('Out of Stock');
    });

    test('returns low stock indicator for stock < 5', () => {
      expect(formatStock(3)).toBe('Low Stock (3 left)');
    });

    test('returns limited stock indicator for 5 <= stock < 10', () => {
      expect(formatStock(7)).toBe('Limited Stock (7 available)');
    });

    test('returns in stock indicator for stock >= 10', () => {
      expect(formatStock(15)).toBe('In Stock (15)');
    });
  });

  describe('formatUserName', () => {
    test('formats firstname and lastname', () => {
      expect(formatUserName('john', 'doe')).toBe('John Doe');
    });

    test('formats firstname only', () => {
      expect(formatUserName('john', '')).toBe('John');
    });

    test('formats lastname only', () => {
      expect(formatUserName('', 'doe')).toBe('Doe');
    });

    test('returns Unknown User if both are missing', () => {
      expect(formatUserName('', '')).toBe('Unknown User');
      expect(formatUserName(null, null)).toBe('Unknown User');
    });
  });

  describe('formatSearchTerm', () => {
    test('returns empty string for empty input', () => {
      expect(formatSearchTerm('')).toBe('');
      expect(formatSearchTerm(null)).toBe('');
    });

    test('capitalizes words in search term', () => {
      expect(formatSearchTerm('laptop computer')).toBe('Laptop Computer');
      expect(formatSearchTerm('  phone  ')).toBe('Phone');
    });
  });
});
