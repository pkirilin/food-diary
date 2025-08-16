import { Card, CardContent, Typography, Stack, Divider } from '@mui/material';
import type { FC } from 'react';
import { type RecognizeNoteItem } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product';

interface Props {
  suggestion: RecognizeNoteItem;
}

export const SuggestedProductCard: FC<Props> = ({ suggestion }) => {
  const { product, quantity } = suggestion;
  const { caloriesCost, protein, fats, carbs, sugar, salt } = product;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {quantity} g
          </Typography>
          <Divider />
          <Stack direction="row" py={1} spacing={2} overflow={['auto', 'hidden']}>
            <NutritionValueDisplay type="calories" size="small" value={caloriesCost} />
            <NutritionValueDisplay type="protein" size="small" value={protein} />
            <NutritionValueDisplay type="fats" size="small" value={fats} />
            <NutritionValueDisplay type="carbs" size="small" value={carbs} />
            <NutritionValueDisplay type="sugar" size="small" value={sugar} />
            <NutritionValueDisplay type="salt" size="small" value={salt} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
