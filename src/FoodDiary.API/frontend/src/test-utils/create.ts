import { ReactElement } from 'react';

import createComponentBuilder from './builders/componentBuilder';
import createPagesSearchResultBuilder from './builders/pagesSearchResultBuilder';
import createCategoryAutocompleteResultBuilder from './builders/categoryAutocompleteResultBuilder';
import createProductAutocompleteResultBuilder from './builders/productAutocompleteResultBuilder';

const create = {
  component: (ui: ReactElement) => createComponentBuilder(ui),
  pagesSearchResult: () => createPagesSearchResultBuilder(),
  categoryAutocompleteResult: () => createCategoryAutocompleteResultBuilder(),
  productAutocompleteResult: () => createProductAutocompleteResultBuilder(),
};

export default create;
