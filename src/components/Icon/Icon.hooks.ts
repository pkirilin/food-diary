import { IconType } from './Icon.types';

import { ReactComponent as Add } from './assets/add.svg';
import { ReactComponent as Check } from './assets/check.svg';
import { ReactComponent as Close } from './assets/close.svg';
import { ReactComponent as Filter } from './assets/filter.svg';
import { ReactComponent as Refresh } from './assets/refresh.svg';
import { ReactComponent as SortAscending } from './assets/sort-ascending.svg';
import { ReactComponent as SortDescending } from './assets/sort-descending.svg';
import { ReactComponent as ThreeDots } from './assets/three-dots.svg';
import { ReactComponent as NextArrow } from './assets/next-arrow.svg';
import { ReactComponent as Expand } from './assets/expand.svg';
import { ReactComponent as RightArrow } from './assets/right-arrow.svg';

export const useIconType = (type: IconType): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  switch (type) {
    case 'add':
      return Add;
    case 'check':
      return Check;
    case 'close':
      return Close;
    case 'filter':
      return Filter;
    case 'refresh':
      return Refresh;
    case 'sort-ascending':
      return SortAscending;
    case 'sort-descending':
      return SortDescending;
    case 'three-dots':
      return ThreeDots;
    case 'next-arrow':
      return NextArrow;
    case 'expand':
      return Expand;
    case 'right-arrow':
      return RightArrow;
    default:
      return Add;
  }
};
