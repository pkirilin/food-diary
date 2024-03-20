import { type Theme, useMediaQuery } from '@mui/material';
import { type FC } from 'react';
import { FullScreenDialog } from './FullScreenDialog';
import { ModalDialog } from './ModalDialog';
import { type RenderActionFn, type DialogBaseProps } from './types';

type DisplayMode = 'modal' | 'fullScreenOnMobile';

interface Props extends DialogBaseProps {
  displayMode?: DisplayMode;
  renderCancel: RenderActionFn;
}

export const Dialog: FC<Props> = ({ displayMode = 'modal', renderCancel, ...props }) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return isMobile && displayMode === 'fullScreenOnMobile' ? (
    <FullScreenDialog {...props} />
  ) : (
    <ModalDialog {...props} renderCancel={renderCancel} />
  );
};
