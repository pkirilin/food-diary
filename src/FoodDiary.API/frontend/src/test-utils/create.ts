import React from 'react';
import createComponentBuilder from './builders/componentBuilder';
import createResponseBuilder from './builders/responseBuilder';
import createPagesSearchResultModelBuilder from './builders/pagesSearchResultModelBuilder';

const create = {
  component: (ui: React.ReactElement) => createComponentBuilder(ui),
  response: () => createResponseBuilder(),
  pagesSearchResultModel: () => createPagesSearchResultModelBuilder(),
};

export default create;
