import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';

interface Props {
  product: foodLogModel.MealDraftProduct;
  onFoodLogAdded: () => void;
}

export const FoundProductListItem: FC<Props> = ({ product, onFoodLogAdded }) => {
  const dispatch = useAppDispatch();
  const isInMealDraft = useAppSelector(state =>
    foodLogModel.selectors.isInMealDraft(state, product.id),
  );

  const handleToggle = (): void => {
    if (isInMealDraft) {
      dispatch(foodLogModel.actions.foodLogRemoved(product.id));
      return;
    }

    dispatch(foodLogModel.actions.foodLogAdded({ product, quantity: product.defaultQuantity }));
    onFoodLogAdded();
  };

  return (
    <ListItem
      sx={{ bgcolor: isInMealDraft ? 'action.selected' : undefined, borderRadius: 1 }}
      secondaryAction={
        <IconButton
          edge="end"
          color={isInMealDraft ? 'success' : 'primary'}
          aria-label={`${isInMealDraft ? 'Remove' : 'Add'} ${product.name}`}
          // Keeps focus in the search field, so a phone's keyboard stays open
          onMouseDown={event => {
            event.preventDefault();
          }}
          onClick={handleToggle}
        >
          {isInMealDraft ? <CheckCircleIcon /> : <AddCircleOutlineIcon />}
        </IconButton>
      }
    >
      <ListItemText
        primary={product.name}
        secondary={`${product.defaultQuantity} g · ${foodLogModel.calculateCalories({ product, quantity: product.defaultQuantity })} kcal`}
      />
    </ListItem>
  );
};
