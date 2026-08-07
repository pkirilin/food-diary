import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton } from '@mui/material';
import { useState, type FC } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  opened: boolean;
  onClose: () => void;
}

export const ImageViewer: FC<Props> = ({ src, fallbackSrc, alt, opened, onClose }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Comparing against src rather than holding a boolean resets the fallback when src changes
  const displayedSrc = failedSrc === src ? fallbackSrc : src;

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      fullScreen
      slotProps={{ paper: { 'aria-label': alt, sx: { backgroundColor: 'common.black' } } }}
    >
      <Box sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <TransformWrapper
          minScale={1}
          maxScale={8}
          centerOnInit
          doubleClick={{ mode: 'toggle', step: 3 }}
          wheel={{ step: 0.2 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <Box
              component="img"
              src={displayedSrc}
              alt={alt}
              onError={() => setFailedSrc(src)}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </TransformComponent>
        </TransformWrapper>
        <IconButton
          aria-label="Close image viewer"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: theme => theme.spacing(1),
            right: theme => theme.spacing(1),
            zIndex: 1,
            color: 'common.white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
};
