import { NutritionValueSchema } from './NutritionValueSchema';

describe('NutritionValueSchema', () => {
  test.each([
    [null, null],
    ['', null],
    [' ', null],
    ['\t', null],
    ['  ', null],
    ['0', 0],
    ['1', 1],
    ['1.1', 1.1],
    ['1,1', 1.1],
    ['1.23', 1.23],
  ])('should parse "%s" to %s', (input, expected) => {
    const { success, data } = NutritionValueSchema.safeParse(input);

    expect(success).toBeTruthy();
    expect(data).toBe(expected);
  });

  test.each(['-1', '100500', '1.', 'x1,5', '1.5x', '1.1.1', '1,1,1', '1.234', '1,234'])(
    'should show error for "%s"',
    input => {
      const { success } = NutritionValueSchema.safeParse(input);

      expect(success).toBeFalsy();
    },
  );
});
