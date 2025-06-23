import { Container, Divider, Stack } from '@mui/material';
import { type FC } from 'react';
import { NutritionValueDisplay, type productModel } from '@/entities/product';

interface Props {
  nutritionValues: productModel.NutritionValues;
}

export const NutritionSummaryWidgetBar: FC<Props> = ({ nutritionValues }) => {
  const { calories, protein, fats, carbs, sugar, salt } = nutritionValues;

  return (
    <Container>
      <Stack
        py={2}
        direction="row"
        spacing={2}
        // Adds extra space after the last item. Padding doesn't work with overflow
        sx={{
          '&::after': {
            content: '""',
            minWidth: theme => theme.spacing(2),
            display: 'block',
          },
        }}
      >
        <NutritionValueDisplay type="calories" value={calories} size="medium" bold />
        <Divider orientation="vertical" flexItem />
        <NutritionValueDisplay type="protein" value={protein} size="medium" bold />
        <Divider orientation="vertical" flexItem />
        <NutritionValueDisplay type="fats" value={fats} size="medium" bold />
        <Divider orientation="vertical" flexItem />
        <NutritionValueDisplay type="carbs" value={carbs} size="medium" bold />
        <Divider orientation="vertical" flexItem />
        <NutritionValueDisplay type="sugar" value={sugar} size="medium" bold />
        <Divider orientation="vertical" flexItem />
        <NutritionValueDisplay type="salt" value={salt} size="medium" bold />
      </Stack>
    </Container>
  );
};
