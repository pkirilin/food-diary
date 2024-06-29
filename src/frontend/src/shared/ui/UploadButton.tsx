import { Button, styled } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type PropsWithChildren, type ChangeEventHandler, type FC } from 'react';

const FileInputStyled = styled('input')(() => ({ ...visuallyHidden }));

interface Props {
  name: string;
  accept: string;
  onUpload: (file: File) => Promise<void>;
}

export const UploadButton: FC<PropsWithChildren<Props>> = ({
  children,
  name,
  accept,
  onUpload,
}) => {
  const handleUpload: ChangeEventHandler<HTMLInputElement> = async event => {
    try {
      const file = event.target?.files?.item(0);

      if (file) {
        await onUpload(file);
      }
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Button role={undefined} component="label" variant="outlined" fullWidth>
      {children}
      <FileInputStyled type="file" name={name} accept={accept} onChange={handleUpload} />
    </Button>
  );
};
