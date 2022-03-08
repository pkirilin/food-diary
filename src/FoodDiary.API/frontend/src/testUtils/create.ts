import React from 'react';
import createComponentBuilder from './builders/componentBuilder';

const create = {
  component: (ui: React.ReactElement) => createComponentBuilder(ui),
};

export default create;
