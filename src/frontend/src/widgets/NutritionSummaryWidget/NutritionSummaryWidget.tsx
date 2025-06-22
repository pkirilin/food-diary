import { Box, Container, Grid2 as Grid } from '@mui/material';
import { type FC } from 'react';
import { type productModel } from '@/entities/product';
import { NutritionSummaryItem } from '@/widgets/NutritionSummaryWidget/NutritionSummaryItem';

interface Props {
  nutritionValues: productModel.NutritionValues;
}

export const NutritionSummaryWidget: FC<Props> = ({ nutritionValues }) => {
  const { calories, protein, fats, carbs, sugar, salt } = nutritionValues;

  return (
    <Box pt={3} pb={2} component={Container}>
      <Grid container spacing={2}>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="calories" value={calories} />
        </Grid>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="protein" value={protein} />
        </Grid>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="fats" value={fats} />
        </Grid>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="carbs" value={carbs} />
        </Grid>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="sugar" value={sugar} />
        </Grid>
        <Grid size={4} display="flex" justifyContent="center">
          <NutritionSummaryItem type="salt" value={salt} />
        </Grid>
      </Grid>
    </Box>
  );
};
