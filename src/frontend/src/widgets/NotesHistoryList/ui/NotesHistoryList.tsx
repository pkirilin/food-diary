import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { type NoteHistoryItem } from '@/entities/note';
import { createUrl, dateLib } from '@/shared/lib';

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
            <ListItemButton component={Link} to={createUrl('/', { date })}>
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
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
