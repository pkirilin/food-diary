import { Fab, styled } from '@mui/material';

const AppFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(3),
  bottom: theme.spacing(3),
}));

export default AppFab;
