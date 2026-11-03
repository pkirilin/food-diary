import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IconButton, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { holdSoftKeyboardForNextField } from '@/shared/lib';

interface Props {
  foodLog: foodLogModel.MealDraftFoodLog;
  onOpen: (productId: number) => void;
}

export const MealDraftFoodLogListItem: FC<Props> = ({ foodLog, onOpen }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = foodLog;

  return (
    <ListItem
      disablePadding
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
      <ListItemButton
        disableGutters
        onClick={() => {
          holdSoftKeyboardForNextField();
          onOpen(product.id);
        }}
      >
        <ListItemText
          primary={product.name}
          secondary={`${quantity} g · ${foodLogModel.calculateCalories(foodLog)} kcal`}
        />
      </ListItemButton>
    </ListItem>
  );
};
