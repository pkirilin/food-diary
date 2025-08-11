import AddIcon from '@mui/icons-material/Add';
import {
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Stack } from '@mui/system';
import { type FC, type MouseEventHandler } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { actions, type Image } from '../model';

interface Props {
  image: Image;
}

export const ProductSearchResultsOnImage: FC<Props> = ({ image }) => {
  const { suggestions, isLoading, error } = useAppSelector(
    state => state.manageNote.noteRecognition,
  );

  const dispatch = useAppDispatch();
  const recognizeNotes = useRecognizeNotes();
  const { data: categories } = categoryLib.useCategorySelectData();

  if (isLoading) {
    return (
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => recognizeNotes(image)}>
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  const note = suggestions.at(0);

  if (!note?.product) {
    return <Alert severity="warning">No food found on your image</Alert>;
  }

  const { product, quantity } = note;
  const productName = product.name.trim();

  const handleAddProduct: MouseEventHandler = () =>
    dispatch(
      actions.productDraftCreated({
        name: productName,
        defaultQuantity: quantity,
        category: categories.at(0) ?? null,
        calories: product.caloriesCost,
        protein: product.protein,
        fats: product.fats,
        carbs: product.carbs,
        sugar: product.sugar,
        salt: product.salt,
      }),
    );

  return (
    <List>
      <ListItem disableGutters disablePadding>
        <ListItemButton onClick={handleAddProduct}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>{`Add "${productName}"`}</ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
  );
};
