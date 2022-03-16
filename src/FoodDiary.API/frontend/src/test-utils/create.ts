import React from 'react';
import createComponentBuilder from './builders/componentBuilder';
import createResponseBuilder from './builders/responseBuilder';
import createPagesSearchResultModelBuilder from './builders/pagesSearchResultModelBuilder';
import createCategoryAutocompleteResultBuilder from './builders/categoryAutocompleteResultBuilder';

const create = {
  component: (ui: React.ReactElement) => createComponentBuilder(ui),
  response: () => createResponseBuilder(),
  pagesSearchResultModel: () => createPagesSearchResultModelBuilder(),
  categoryAutocompleteResult: () => createCategoryAutocompleteResultBuilder(),
};

export default create;
