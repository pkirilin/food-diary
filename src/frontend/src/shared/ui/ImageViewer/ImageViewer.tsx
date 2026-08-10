import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  opened: boolean;
  onClose: () => void;
}

export const ImageViewer: FC<Props> = ({ src, fallbackSrc, alt, opened, onClose }) => {
  const [decodedSrc, setDecodedSrc] = useState<string | null>(null);

  // An object URL is not read from disk until an <img> asks for it, and decoding a full-resolution
  // camera file costs hundreds of milliseconds on a phone. Decoding out of band keeps that cost off
  // the frame that opens the viewer.
  useEffect(() => {
    if (!opened) {
      return;
    }

    let cancelled = false;
    const image = new window.Image();
    image.src = src;

    image
      .decode()
      .then(() => {
        if (!cancelled) {
          setDecodedSrc(src);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [opened, src]);

  const displayedSrc = decodedSrc === src ? src : fallbackSrc;

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
