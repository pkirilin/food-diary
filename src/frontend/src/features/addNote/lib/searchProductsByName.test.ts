import { type ProductSelectOption } from '@/entities/product';
import { searchProductsByName } from './searchProductsByName';

type GivenProducts = 'cheese' | 'cheesecake' | 'chocolateCake' | 'creamCheese';

const given: Record<GivenProducts, ProductSelectOption> = {
  cheese: { id: 1, name: 'Cheese', defaultQuantity: 120 },
  cheesecake: { id: 2, name: 'Cheesecake', defaultQuantity: 50 },
  chocolateCake: { id: 3, name: 'Chocolate cake', defaultQuantity: 60 },
  creamCheese: { id: 4, name: 'Cream cheese', defaultQuantity: 100 },
};

const sourceProducts = Object.values(given);

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
