import { createUrl } from '../urlHelper';

describe('createUrl', () => {
  describe('for no parameters', () => {
    test('should return base url', () => {
      // Arrange
      const base = 'https://my-url.com';

      // Act
      const url = createUrl(base, {});

      // Assert
      expect(url).toBe(base);
    });
  });

  describe('for single parameter', () => {
    test('should return base url with this parameter', () => {
      // Arrange
      const base = 'https://my-url.com';

      // Act
      const url = createUrl(base, {
        myParam: 'test',
      });

      // Assert
      expect(url).toBe(`${base}?myParam=test`);
    });
  });

  describe('for many parameters', () => {
    test('should create correct url', () => {
      // Arrange
      const base = 'https://my-url.com';

      // Act
      const url = createUrl(base, {
        param1: 123,
        param2: 'testValue',
        param3: null,
        param4: undefined,
        param5: 'hello world',
      });

      // Assert
      expect(url).toBe(`${base}?param1=123&param2=testValue&param5=hello%20world`);
    });
  });
});
