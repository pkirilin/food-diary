import { MenuItem, TextField } from '@mui/material';
import { type FC, type ChangeEventHandler, useState } from 'react';
import { categoriesApi } from 'src/features/categories';
import { useAppDispatch } from 'src/store';
import { type SelectOption } from 'src/types';
import { filterByCategoryChanged } from '../store';
import * as styles from '../styles';

const ALL_CATEGORIES_VALUE = ' ';

export const SearchByCategory: FC = () => {
  const [category, setCategory] = useState<SelectOption | null>(null);
  const getCategoriesQuery = categoriesApi.useGetCategorySelectOptionsQuery();
  const categoryOptions = getCategoriesQuery.data ?? [];
  const dispatch = useAppDispatch();

  const findSelectedCategory = (selectedValue: string): SelectOption | null => {
    if (selectedValue === ALL_CATEGORIES_VALUE) {
      return null;
    }
    return categoryOptions.find(c => c.id === Number(selectedValue)) ?? null;
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => {
    const selectedCategory = findSelectedCategory(event.target.value);
    setCategory(selectedCategory);
    dispatch(filterByCategoryChanged(selectedCategory));
  };

  return (
    <TextField
      select
      size="small"
      label="Category"
      sx={styles.searchField}
      value={category?.id ?? ALL_CATEGORIES_VALUE}
      onChange={handleChange}
    >
      <MenuItem value={ALL_CATEGORIES_VALUE}>All</MenuItem>
      {categoryOptions.map(({ id, name }) => (
        <MenuItem key={id} value={id}>
          {name}
        </MenuItem>
      ))}
    </TextField>
  );
};
