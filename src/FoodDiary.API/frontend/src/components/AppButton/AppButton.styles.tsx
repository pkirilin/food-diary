import { CircularProgress, styled } from '@mui/material';

export const AppButtonRoot = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));

export const AppButtonWrapper = styled('div')(() => ({
  position: 'relative',
}));

export const AppButtonProgress = styled(CircularProgress)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
}));
