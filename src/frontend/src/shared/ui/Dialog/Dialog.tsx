import { type Theme, useMediaQuery } from '@mui/material';
import { lazy, type FC, Suspense } from 'react';
import { type RenderActionFn, type DialogBaseProps } from './types';

type RenderMode = 'modal' | 'fullScreenOnMobile';

interface Props extends DialogBaseProps {
  renderMode?: RenderMode;
  renderCancel: RenderActionFn;
}

const FullScreenDialog = lazy(() => import('./FullScreenDialog'));

const ModalDialog = lazy(() => import('./ModalDialog'));

export const Dialog: FC<Props> = ({ renderMode = 'modal', renderCancel, ...props }) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <Suspense>
      {isMobile && renderMode === 'fullScreenOnMobile' ? (
        <FullScreenDialog {...props} />
      ) : (
        <ModalDialog {...props} renderCancel={renderCancel} />
      )}
    </Suspense>
  );
};
