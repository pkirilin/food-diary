import { Box, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { NutritionValueIcon, productModel } from '@/entities/product';

interface Props {
  value: number | null;
  type: productModel.NutritionValueType;
}

export const NutritionSummaryItem: FC<Props> = ({ value, type }) => {
  const { unit, color } = productModel.nutritionValuesConfig[type];

  return (
    <Stack
      direction="column"
      sx={{
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
        }}
      >
        <NutritionValueIcon type={type} size="medium" />
      </Box>
      <Typography
        variant="body2"
        component="span"
        color="textSecondary"
        sx={{
          textTransform: 'capitalize',
        }}
      >
        {type}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: 'baseline',
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color, fontWeight: 'bold' }}>
          {value ?? <>&mdash;</>}
        </Typography>
        <Typography variant="body2" component="span" color="textSecondary">
          {unit}
        </Typography>
      </Stack>
    </Stack>
  );
};
