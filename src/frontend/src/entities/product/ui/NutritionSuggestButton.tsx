import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CircularProgress, IconButton } from '@mui/material';
import { type FC } from 'react';

interface Props {
  label: string;
  generating: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const NutritionSuggestButton: FC<Props> = ({ label, generating, disabled, onClick }) => {
  if (generating) {
    return <CircularProgress size={20} aria-label={`Suggesting ${label}`} />;
  }

  return (
    <IconButton
      edge="end"
      size="small"
      aria-label={`Suggest ${label}`}
      disabled={disabled}
      onClick={onClick}
    >
      <AutoAwesomeIcon fontSize="small" />
    </IconButton>
  );
};
