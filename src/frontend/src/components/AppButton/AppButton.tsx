import { Button, type ButtonProps } from '@mui/material';
import { type FC } from 'react';
import { AppButtonProgress, AppButtonRoot, AppButtonWrapper } from './AppButton.styles';

interface AppButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const AppButton: FC<AppButtonProps> = ({ isLoading, disabled, ...props }) => {
  return (
    <AppButtonRoot>
      <AppButtonWrapper>
        <Button {...props} disabled={!!disabled || isLoading} />
        {isLoading && <AppButtonProgress size={24} color="primary" />}
      </AppButtonWrapper>
    </AppButtonRoot>
  );
};

export default AppButton;
