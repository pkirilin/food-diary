import {
  Box,
  CircularProgress,
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';
import { type FC } from 'react';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  hiddenWhenDisabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  loading,
  disabled,
  hiddenWhenDisabled,
  color,
  ...props
}) => (
  <MuiButton
    {...props}
    disabled={!!disabled || loading}
    color={color}
    sx={{
      '&.Mui-disabled': {
        color: loading ? 'inherit' : color,
        display: disabled && hiddenWhenDisabled ? 'none' : 'block',
      },
    }}
  >
    {loading && <CircularProgress size={16} color={color} sx={{ position: 'absolute' }} />}
    <Box visibility={loading ? 'hidden' : 'visible'}>{children}</Box>
  </MuiButton>
);
