import React from 'react';
import {
  Chip,
  Grid,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { CategoryItem } from '../models';

type CategoriesListItemProps = {
  category: CategoryItem;
};

const useStyles = makeStyles(() => ({
  root: {
    height: '100px',
  },
}));

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({
  category,
}: CategoriesListItemProps) => {
  const classes = useStyles();

  return (
    <ListItem className={classes.root}>
      <ListItemText>
        <Grid container spacing={2}>
          <Grid item>{category.name}</Grid>
          <Grid item>
            {category.countProducts > 0 ? (
              <Chip
                label={`products: ${category.countProducts}`}
                variant="outlined"
                size="small"
              ></Chip>
            ) : (
              <Chip label="empty" size="small"></Chip>
            )}
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <Tooltip title="Edit category">
          <IconButton>
            <EditIcon></EditIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete category">
          <IconButton edge="end">
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default CategoriesListItem;
