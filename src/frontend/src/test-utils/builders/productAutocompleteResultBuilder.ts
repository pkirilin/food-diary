import { type SelectOption } from 'src/types';

export interface ProductAutocompleteResultBuilder {
  please: () => SelectOption[];
  withOption: (name: string) => ProductAutocompleteResultBuilder;
}

export default function createProductAutocompleteResultBuilder(): ProductAutocompleteResultBuilder {
  let id = 0;
  const options: SelectOption[] = [];

  const builder: ProductAutocompleteResultBuilder = {
    please: (): SelectOption[] => options,

    withOption: (name: string): ProductAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
