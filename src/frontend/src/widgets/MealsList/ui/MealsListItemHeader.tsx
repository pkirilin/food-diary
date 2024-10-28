import { Stack, Typography, type TypographyProps, styled } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { noteModel } from '@/entities/note';

interface Props {
  mealName: string;
}

const TextStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.secondary,
}));

export const MealsListItemHeader: FC<Props> = ({ mealName }) => {
  const totalCalories = useAppSelector(noteModel.selectors.totalCalories);

  return (
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
  );
};
