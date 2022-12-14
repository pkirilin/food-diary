import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export default styled(Link)(({ theme }) => ({
  fontSize: theme.typography.h1.fontSize,
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
}));
