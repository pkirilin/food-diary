import { type SelectOption } from 'src/types';

export interface CategoryAutocompleteResultBuilder {
  please: () => SelectOption[];
  withOption: (name: string) => CategoryAutocompleteResultBuilder;
}

export default function createCategoryAutocompleteResultBuilder(): CategoryAutocompleteResultBuilder {
  let id = 0;
  const options: SelectOption[] = [];

  const builder: CategoryAutocompleteResultBuilder = {
    please: (): SelectOption[] => options,

    withOption: (name: string): CategoryAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
