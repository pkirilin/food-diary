import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from '@mui/material';
import { type FC } from 'react';
import { type Image } from '../model';

interface Props {
  images: Image[];
  onRemove: () => void;
}

export const ImagePreview: FC<Props> = ({ images, onRemove }) => (
  <ImageList cols={3} gap={16}>
    {images.map((image, index) => (
      <ImageListItem key={image.base64}>
        <Box
          component="img"
          src={image.base64}
          alt={`Uploaded image preview ${index + 1}`}
          sx={{
            height: '256px',
            objectFit: 'cover',
          }}
        />
        <ImageListItemBar
          title={image.name}
          position="below"
          actionIcon={
            <Tooltip title="Remove uploaded image">
              <IconButton onClick={onRemove}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          }
        />
      </ImageListItem>
    ))}
  </ImageList>
);
