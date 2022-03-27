import { CategoryAutocompleteOption } from '../../features/categories/models';

export interface CategoryAutocompleteResultBuilder {
  please: () => CategoryAutocompleteOption[];
  withOption: (name: string) => CategoryAutocompleteResultBuilder;
}

export default function createCategoryAutocompleteResultBuilder() {
  let id = -1;
  const options: CategoryAutocompleteOption[] = [];

  const builder: CategoryAutocompleteResultBuilder = {
    please: (): CategoryAutocompleteOption[] => options,

    withOption: (name: string): CategoryAutocompleteResultBuilder => {
      options.push({ id: ++id, name });
      return builder;
    },
  };

  return builder;
}
