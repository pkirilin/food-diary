import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Divider, List, makeStyles, Typography } from '@material-ui/core';
import CategoriesListItem from './CategoriesListItem';
import { getCategories } from '../thunks';
import { useTypedSelector } from '../../__shared__/hooks';

const useStyles = makeStyles(theme => ({
  emptyItems: {
    padding: theme.spacing(2),
  },
}));

const CategoriesList: React.FC = () => {
  const categoryItems = useTypedSelector(state => state.categories.categoryItems);
  const categoryItemsChangingStatus = useTypedSelector(
    state => state.categories.categoryItemsChangingStatus,
  );
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    if (categoryItemsChangingStatus === 'idle' || categoryItemsChangingStatus === 'succeeded') {
      dispatch(getCategories());
    }
  }, [categoryItemsChangingStatus]);

  if (categoryItems.length === 0) {
    return (
      <Typography color="textSecondary" align="center" className={classes.emptyItems}>
        No categories found
      </Typography>
    );
  }

  return (
    <List>
      {categoryItems.map((category, index) => (
        <React.Fragment key={category.id}>
          <CategoriesListItem category={category}></CategoriesListItem>
          {index >= 0 && index < categoryItems.length - 1 && <Divider></Divider>}
        </React.Fragment>
      ))}
    </List>
  );
};

export default CategoriesList;
