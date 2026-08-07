import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, Dialog, IconButton } from '@mui/material';
import { useState, type FC, type ReactNode } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  opened: boolean;
  footer: ReactNode;
  onClose: () => void;
}

export const ImageViewer: FC<Props> = ({ src, fallbackSrc, alt, opened, footer, onClose }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [footerExpanded, setFooterExpanded] = useState(true);

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
        {footer != null && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              px: 2,
              pb: 'env(safe-area-inset-bottom)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <Box display="flex" justifyContent="flex-end">
              <IconButton
                aria-label={footerExpanded ? 'Collapse image details' : 'Expand image details'}
                aria-expanded={footerExpanded}
                onClick={() => setFooterExpanded(expanded => !expanded)}
                sx={{ color: 'common.white' }}
              >
                {footerExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Box>
            <Collapse in={footerExpanded} unmountOnExit>
              <Box pb={2}>{footer}</Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};
