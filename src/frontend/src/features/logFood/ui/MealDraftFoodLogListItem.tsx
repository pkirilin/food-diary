import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';

interface Props {
  foodLog: foodLogModel.MealDraftFoodLog;
}

export const MealDraftFoodLogListItem: FC<Props> = ({ foodLog }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = foodLog;

  return (
    <ListItem
      disableGutters
      secondaryAction={
        <IconButton
          edge="end"
          aria-label={`Delete ${product.name}`}
          onClick={() => dispatch(foodLogModel.actions.foodLogRemoved(product.id))}
        >
          <DeleteOutlineIcon />
        </IconButton>
      }
    >
      <ListItemText
        primary={product.name}
        secondary={`${quantity} g · ${foodLogModel.calculateCalories(foodLog)} kcal`}
      />
    </ListItem>
  );
};
