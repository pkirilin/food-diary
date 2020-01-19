import { IconType } from './Icon.types';

import { ReactComponent as Check } from './assets/check.svg';
import { ReactComponent as Close } from './assets/close.svg';

export const useIconType = (type: IconType): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  switch (type) {
    case 'check':
      return Check;
    case 'close':
      return Close;
    default:
      return Check;
  }
};
