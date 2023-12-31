import { Divider, MenuItem, TextField, Typography } from '@mui/material';
import { type FC, type ChangeEventHandler } from 'react';
import { categoriesApi } from 'src/features/categories';
import { useAppDispatch, useAppSelector } from 'src/store';
import { type SelectOption } from 'src/types';
import { filterByCategoryChanged } from '../store';
import * as styles from '../styles';

const ANY_CATEGORY_VALUE = ' ';

export const SearchByCategory: FC = () => {
  const category = useAppSelector(state => state.products.filter.category);
  const getCategoriesQuery = categoriesApi.useGetCategorySelectOptionsQuery();
  const categoryOptions = getCategoriesQuery.data ?? [];
  const dispatch = useAppDispatch();

  const findSelectedCategory = (selectedValue: string): SelectOption | null => {
    if (selectedValue === ANY_CATEGORY_VALUE) {
      return null;
    }
    return categoryOptions.find(c => c.id === Number(selectedValue)) ?? null;
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => {
    const selectedCategory = findSelectedCategory(event.target.value);
    dispatch(filterByCategoryChanged(selectedCategory));
  };

  return (
    <TextField
      select
      size="small"
      label="Category"
      sx={styles.searchField}
      value={category?.id ?? ANY_CATEGORY_VALUE}
      onChange={handleChange}
    >
      <MenuItem value={ANY_CATEGORY_VALUE}>Any</MenuItem>
      {categoryOptions.length > 0 && <Divider />}
      {categoryOptions.map(({ id, name }) => (
        <MenuItem key={id} value={id}>
          <Typography noWrap>{name}</Typography>
        </MenuItem>
      ))}
    </TextField>
  );
};
