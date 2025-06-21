import { Box, Container, Divider, Grid2 as Grid, Stack } from '@mui/material';
import { type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product';
import { NutritionSummaryItem } from '@/widgets/NutritionSummaryWidget/NutritionSummaryItem';

interface Props {
  date: string;
}

export const NutritionSummaryWidget: FC<Props> = ({ date }) => {
  const { calories, protein, fats, carbs, sugar, salt } = noteLib.useNutritionValues(date);

  return (
    <Box px={1} py={2} component={Container}>
      <Grid container spacing={2}>
        <Grid size={4}>
          <NutritionSummaryItem type="calories" value={calories} />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem type="protein" value={protein} />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem type="fats" value={fats} />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem type="carbs" value={carbs} />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem type="sugar" value={sugar} />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem type="salt" value={salt} />
        </Grid>
      </Grid>
    </Box>
  );
};
