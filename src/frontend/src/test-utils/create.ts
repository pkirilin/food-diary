import { type ReactElement } from 'react';

import createCategoryAutocompleteResultBuilder from './builders/categoryAutocompleteResultBuilder';
import createComponentBuilder from './builders/componentBuilder';
import createPagesSearchResultBuilder from './builders/pagesSearchResultBuilder';
import createProductAutocompleteResultBuilder from './builders/productAutocompleteResultBuilder';

const create = {
  component: (ui: ReactElement) => createComponentBuilder(ui),
  pagesSearchResult: () => createPagesSearchResultBuilder(),
  categoryAutocompleteResult: () => createCategoryAutocompleteResultBuilder(),
  productAutocompleteResult: () => createProductAutocompleteResultBuilder(),
};

export default create;
