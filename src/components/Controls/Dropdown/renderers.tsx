import React, { ReactElement } from 'react';
import { ProductDropdownItem } from '../../../models';

export const productDropdownItemRenderer = (item: ProductDropdownItem): ReactElement => {
  return <React.Fragment>{item.name}</React.Fragment>;
};
