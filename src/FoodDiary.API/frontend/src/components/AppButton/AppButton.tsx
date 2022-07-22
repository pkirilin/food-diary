import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { AppButtonProgress, AppButtonRoot, AppButtonWrapper } from './AppButton.styles';

interface AppButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ isLoading, disabled, ...props }) => {
  return (
    <AppButtonRoot>
      <AppButtonWrapper>
        <Button {...props} disabled={disabled || isLoading} />
        {isLoading && <AppButtonProgress size={24} color="primary" />}
      </AppButtonWrapper>
    </AppButtonRoot>
  );
};

export default AppButton;
