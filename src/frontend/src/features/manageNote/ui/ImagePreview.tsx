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
  image: Image;
  onRemove: () => void;
}

export const ImagePreview: FC<Props> = ({ image, onRemove }) => (
  <ImageList cols={2} gap={16}>
    <ImageListItem>
      <Box
        component="img"
        src={image.base64}
        alt="Uploaded image preview"
        sx={{
          height: '194px',
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
  </ImageList>
);
