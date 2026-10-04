import { productSchema } from './productSchema';

const validProduct = {
  name: 'Oat granola',
  defaultQuantity: 100,
  category: { id: 1, name: 'Cereals' },
  calories: 412,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

const getNameErrors = (name: string): string[] => {
  const result = productSchema.safeParse({ ...validProduct, name });
  return (result.error?.issues ?? [])
    .filter(issue => issue.path.join('.') === 'name')
    .map(issue => issue.message);
};

describe('productSchema name', () => {
  test.each([
    ['3 characters', 'abc'],
    ['100 characters', 'a'.repeat(100)],
    ['an emoji and a letter, 3 UTF-16 units', '😀a'],
  ])('should accept %s', (_, name) => {
    expect(getNameErrors(name)).toStrictEqual<string[]>([]);
  });

  test.each([
    ['2 characters', 'ab'],
    ['101 characters', 'a'.repeat(101)],
    ['51 emoji, 102 UTF-16 units', '😀'.repeat(51)],
  ])('should reject %s', (_, name) => {
    expect(getNameErrors(name)).toStrictEqual<string[]>([
      'Product name must be between 3 and 100 characters',
    ]);
  });
});
