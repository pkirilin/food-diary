import { type ProductSelectOption } from '@/entities/product';
import { searchProductsByName, shouldSuggestAddingNewProduct } from './searchProducts';

type GivenProducts = 'cheese' | 'cheesecake' | 'chocolateCake' | 'creamCheese';

const create = {
  product: ({
    id = 0,
    name = '',
    defaultQuantity = 100,
  }: Partial<ProductSelectOption>): ProductSelectOption => ({
    id,
    name,
    defaultQuantity,
    calories: 100,
    protein: null,
    fats: null,
    carbs: null,
    sugar: null,
    salt: null,
  }),
} as const;

const given: Record<GivenProducts, ProductSelectOption> = {
  cheese: create.product({ id: 1, name: 'Cheese', defaultQuantity: 120 }),
  cheesecake: create.product({ id: 2, name: 'Cheesecake', defaultQuantity: 50 }),
  chocolateCake: create.product({ id: 3, name: 'Chocolate cake', defaultQuantity: 60 }),
  creamCheese: create.product({ id: 4, name: 'Cream cheese', defaultQuantity: 100 }),
} as const;

const sourceProducts = Object.values(given);

describe('searchProductsByName', () => {
  test.each<[string, ProductSelectOption[]]>([
    ['che', [given.cheese, given.cheesecake, given.creamCheese]],
    ['cream', [given.creamCheese]],
    ['Cake ', [given.cheesecake, given.chocolateCake]],
  ])('should find products by search query: "%s"', (query, foundProducts) => {
    expect(searchProductsByName(sourceProducts, query)).toStrictEqual(foundProducts);
  });

  test.each<string>(['', ' ', 'ch', 'sadsfafds'])(
    'should not find any products by search query: "%s"',
    query => {
      expect(searchProductsByName(sourceProducts, query)).toStrictEqual<ProductSelectOption[]>([]);
    },
  );
});

describe('shouldSuggestAddingNewProduct', () => {
  test.each(['che', 'cheese', ' Cheese'])(
    'should suggest adding new product by search query: "%s"',
    query => {
      expect(shouldSuggestAddingNewProduct(sourceProducts, query)).toBeTruthy();
    },
  );

  test.each(['', ' ', 'Cheese'])(
    'should not suggest adding new product by search query: "%s"',
    query => {
      expect(shouldSuggestAddingNewProduct(sourceProducts, query)).toBeFalsy();
    },
  );
});
