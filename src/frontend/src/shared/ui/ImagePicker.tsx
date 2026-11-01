import { Box, IconButton, type IconButtonProps, Tooltip } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type ChangeEventHandler, type FC, type ReactNode, useRef } from 'react';
import { type imageLib, toImages } from '../lib';

interface Props {
  label: string;
  icon: ReactNode;
  color: IconButtonProps['color'];
  onPick: (images: imageLib.Image[]) => void;
}

export const ImagePicker: FC<Props> = ({ label, icon, color, onPick }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesChange: ChangeEventHandler<HTMLInputElement> = async event => {
    try {
      const files = Array.from(event.target?.files ?? []);

      if (files.length === 0) {
        return;
      }

      onPick(await toImages(files));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to upload images: ', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <Tooltip title={label} placement="left">
        <IconButton color={color} edge="end" onClick={() => inputRef.current?.click()}>
          {icon}
        </IconButton>
      </Tooltip>
      <Box
        component="input"
        ref={inputRef}
        sx={visuallyHidden}
        type="file"
        name="images"
        accept="image/*"
        multiple
        aria-label={label}
        aria-hidden
        tabIndex={-1}
        onChange={handleFilesChange}
      />
    </>
  );
};
