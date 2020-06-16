import React, { ReactElement } from 'react';
import { ProductDropdownItem, CategoryDropdownItem } from '../../../models';

export function defaultItemRenderer<T = string>(item: T): ReactElement {
  return <React.Fragment>{item}</React.Fragment>;
}

export const productDropdownItemRenderer = (item: ProductDropdownItem): ReactElement => {
  return <React.Fragment>{item.name}</React.Fragment>;
};

export const categoryDropdownItemRenderer = (item: CategoryDropdownItem): ReactElement => {
  return <React.Fragment>{item.name}</React.Fragment>;
};
