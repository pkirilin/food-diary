import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { noteLib, type noteModel } from '@/entities/note';
import { Button } from '@/shared/ui';
import { toFoodLogMealType } from '../lib/mapping';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  onOpenLogFood: () => void;
}

export const MultiItemLogFood: FC<Props> = ({ date, mealType, onOpenLogFood }) => {
  const dispatch = useAppDispatch();

  const handleClick = (): void => {
    dispatch(
      foodLogModel.actions.mealDraftStarted({ date, mealType: toFoodLogMealType(mealType) }),
    );
    onOpenLogFood();
  };

  return (
    <Button fullWidth startIcon={<AddIcon />} onClick={handleClick}>
      Add {noteLib.getMealName(mealType)}
    </Button>
  );
};
