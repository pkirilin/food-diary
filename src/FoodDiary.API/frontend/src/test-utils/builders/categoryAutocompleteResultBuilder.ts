import { CategorySelectOption } from 'src/features/categories';

export interface CategoryAutocompleteResultBuilder {
  please: () => CategorySelectOption[];
  withOption: (name: string) => CategoryAutocompleteResultBuilder;
}

export default function createCategoryAutocompleteResultBuilder() {
  let id = 0;
  const options: CategorySelectOption[] = [];

  const builder: CategoryAutocompleteResultBuilder = {
    please: (): CategorySelectOption[] => options,

    withOption: (name: string): CategoryAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
