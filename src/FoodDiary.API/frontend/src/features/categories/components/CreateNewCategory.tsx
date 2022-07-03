import { styled, Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(3),
  bottom: theme.spacing(3),
}));

export default function CreateNewCategory() {
  return (
    <Tooltip title="Create new category">
      <StyledFab color="primary" aria-label="add">
        <AddIcon />
      </StyledFab>
    </Tooltip>
  );
}
