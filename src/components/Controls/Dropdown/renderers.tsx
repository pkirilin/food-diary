import React, { ReactElement } from 'react';
import { ProductDropdownItem } from '../../../models';

export function defaultItemRenderer<T = string>(item: T): ReactElement {
  return <React.Fragment>{item}</React.Fragment>;
}

export const productDropdownItemRenderer = (item: ProductDropdownItem): ReactElement => {
  return <React.Fragment>{item.name}</React.Fragment>;
};
