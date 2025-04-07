import { type ProductSelectOption } from '@/entities/product';
import { shouldSuggestAddingNewProduct } from './shouldSuggestAddingNewProduct';

type GivenProducts = 'cheese' | 'cheesecake';

const given: Record<GivenProducts, ProductSelectOption> = {
  cheese: { id: 1, name: 'Cheese', defaultQuantity: 120 },
  cheesecake: { id: 2, name: 'Cheesecake', defaultQuantity: 50 },
};

const sourceProducts = Object.values(given);

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
