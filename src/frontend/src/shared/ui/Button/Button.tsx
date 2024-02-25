import {
  CircularProgress,
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';
import { type FC } from 'react';

interface Props extends MuiButtonProps {
  loading?: boolean;
}

export const Button: FC<Props> = ({ children, loading, disabled, color, startIcon, ...props }) => (
  <MuiButton
    {...props}
    disabled={!!disabled || loading}
    color={color}
    startIcon={loading ? <CircularProgress size={16} color={color} /> : startIcon}
  >
    {children}
  </MuiButton>
);
