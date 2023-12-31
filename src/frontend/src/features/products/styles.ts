import { type SxProps, type Theme } from '@mui/system';

export const searchField: SxProps<Theme> = theme => ({
  minWidth: '200px',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
  [theme.breakpoints.up('lg')]: {
    width: '300px',
  },
});
