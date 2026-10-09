import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { type NoteHistoryItem } from '@/entities/note';
import { dateLib } from '@/shared/lib';
import { RouterListItemButton } from '@/shared/ui';

interface Props {
  notes: NoteHistoryItem[];
}

export const NotesHistoryList: FC<Props> = ({ notes }) => {
  if (notes.length === 0) {
    return <Typography color="textSecondary">No items found</Typography>;
  }

  return (
    <Paper>
      <List disablePadding>
        {notes.map(({ date, caloriesCount }) => (
          <ListItem key={date} disableGutters>
            <RouterListItemButton to="/" search={{ date }}>
              <ListItemIcon>
                <CalendarTodayIcon />
              </ListItemIcon>
              <ListItemText primary={dateLib.formatToUserFriendlyString(date)} />
              <Box
                component={ListItemSecondaryAction}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ListItemText secondary={`${caloriesCount} kcal`} />
                <ChevronRightIcon />
              </Box>
            </RouterListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
