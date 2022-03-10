import React from 'react';
import createComponentBuilder from './builders/componentBuilder';
import createResponseBuilder from './builders/responseBuilder';

const create = {
  component: (ui: React.ReactElement) => createComponentBuilder(ui),
  response: () => createResponseBuilder(),
};

export default create;
