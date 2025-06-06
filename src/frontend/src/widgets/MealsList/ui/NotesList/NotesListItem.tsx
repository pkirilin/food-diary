import DeleteIcon from '@mui/icons-material/Delete';
import {
  ListItem,
  IconButton,
  ListItemButton,
  ListItemText,
  Tooltip,
  Grid,
  Typography,
  styled,
  type TypographyProps,
} from '@mui/material';
import { type FC } from 'react';
import { type NoteItem } from '@/entities/note';
import { EditNote } from '@/features/manageNote';
import { DeleteNote } from '@/features/note/delete';

interface Props {
  note: NoteItem;
}

const SecondaryTextStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const NotesListItem: FC<Props> = ({ note }) => (
  <ListItem
    key={note.id}
    disablePadding
    secondaryAction={
      <DeleteNote
        note={note}
        renderTrigger={openDeleteDialog => (
          <Tooltip title="Delete note" placement="left">
            <IconButton edge="end" onClick={openDeleteDialog}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      />
    }
  >
    <EditNote
      note={note}
      renderTrigger={openDialog => (
        <ListItemButton onClick={openDialog}>
          <Grid
            container
            columnSpacing={2}
            component={ListItemText}
            disableTypography
            primary={
              <Grid item xs={12} md={8}>
                {note.productName}
              </Grid>
            }
            secondary={
              <Grid item xs={12} md={4}>
                <Grid container columnSpacing={{ xs: 1, md: 2 }}>
                  <Grid item md={4}>
                    <SecondaryTextStyled align="right">
                      {note.productQuantity} g
                    </SecondaryTextStyled>
                  </Grid>
                  <Grid item md={4}>
                    <SecondaryTextStyled align="right">{note.calories} kcal</SecondaryTextStyled>
                  </Grid>
                  <Grid item md={4} />
                </Grid>
              </Grid>
            }
          />
        </ListItemButton>
      )}
    />
  </ListItem>
);
