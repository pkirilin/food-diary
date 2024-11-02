import {
  Box,
  ListItem,
  Paper,
  Stack,
  Typography,
  type TypographyProps,
  styled,
} from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { noteLib, noteModel } from '@/entities/note';
import { NotesList } from './NotesList';

interface Props {
  date: string;
  mealType: noteModel.MealType;
}

const TextStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.secondary,
}));

export const MealsListItem: FC<Props> = ({ date, mealType }) => {
  const totalCalories = useAppSelector(state =>
    noteModel.selectors.totalCaloriesByMeal(state, mealType),
  );

  const mealName = noteLib.getMealName(mealType);

  return (
    <ListItem
      disableGutters
      disablePadding
      aria-label={`${mealName}, ${totalCalories} kilocalories`}
    >
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            mt: 2,
            mb: 3,
          }}
        >
          <TextStyled component="h2">{mealName}</TextStyled>
          <TextStyled component="span">{`${totalCalories} kcal`}</TextStyled>
        </Stack>
        <Paper component="section">
          <NotesList date={date} mealType={mealType} />
        </Paper>
      </Box>
    </ListItem>
  );
};
