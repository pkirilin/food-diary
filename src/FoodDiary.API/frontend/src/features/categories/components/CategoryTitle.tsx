import { styled } from '@mui/material';

const CategoryTitle = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: `calc(100vw - 4 * ${theme.spacing(2)})`,

  [theme.breakpoints.between('sm', 'lg')]: {
    maxWidth: `calc(50vw - ${theme.spacing(3)} - 2 * ${theme.spacing(2)})`,
  },

  [theme.breakpoints.up('lg')]: {
    maxWidth: '340px',
  },
}));

export default CategoryTitle;
