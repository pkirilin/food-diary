import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { type FC } from 'react';

export const AddWeightLog: FC = () => (
  <Button startIcon={<AddIcon />} color="primary" variant="contained">
    Log weight
  </Button>
);
