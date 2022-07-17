import { Button, ButtonProps } from '@mui/material';
import { AppButtonProgress, AppButtonRoot, AppButtonWrapper } from './AppButton.styles';

export interface AppButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export default function AppButton({ isLoading, disabled, ...props }: AppButtonProps) {
  return (
    <AppButtonRoot>
      <AppButtonWrapper>
        <Button {...props} disabled={disabled || isLoading}></Button>
        {isLoading && <AppButtonProgress size={24} color="primary"></AppButtonProgress>}
      </AppButtonWrapper>
    </AppButtonRoot>
  );
}
