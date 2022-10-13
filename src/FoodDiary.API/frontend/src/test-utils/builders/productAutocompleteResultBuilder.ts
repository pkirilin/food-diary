import { ProductSelectOption } from 'src/features/products';

export interface ProductAutocompleteResultBuilder {
  please: () => ProductSelectOption[];
  withOption: (name: string) => ProductAutocompleteResultBuilder;
}

export default function createProductAutocompleteResultBuilder() {
  let id = 0;
  const options: ProductSelectOption[] = [];

  const builder: ProductAutocompleteResultBuilder = {
    please: (): ProductSelectOption[] => options,

    withOption: (name: string): ProductAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
