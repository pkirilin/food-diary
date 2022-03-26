import { ProductAutocompleteOption } from '../../features/products/models';

export interface ProductAutocompleteResultBuilder {
  please: () => ProductAutocompleteOption[];
  withOption: (name: string) => ProductAutocompleteResultBuilder;
}

export default function createProductAutocompleteResultBuilder() {
  let id = -1;
  const options: ProductAutocompleteOption[] = [];

  const builder: ProductAutocompleteResultBuilder = {
    please: (): ProductAutocompleteOption[] => options,

    withOption: (name: string): ProductAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
