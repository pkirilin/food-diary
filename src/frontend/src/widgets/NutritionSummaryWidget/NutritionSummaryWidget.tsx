import { Box, Container, Stack, Typography, useScrollTrigger } from '@mui/material';
import { type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionComponentIcon } from '@/entities/product/ui/NutritionComponentIcon';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';

interface Props {
  date: string;
}

export const NutritionSummaryWidget: FC<Props> = ({ date }) => {
  const scrolled = useScrollTrigger({
    threshold: APP_BAR_HEIGHT_XS / 2,
    disableHysteresis: true,
  });

  const totalCalories = noteLib.useTotalCalories(date);

  return (
    <Box
      sx={theme => ({
        top: APP_BAR_HEIGHT_XS,
        position: 'sticky',
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
        boxShadow: scrolled ? theme.shadows[2] : 'none',
        paddingY: 1,

        [theme.breakpoints.up('sm')]: {
          top: APP_BAR_HEIGHT_SM,
        },
      })}
    >
      <Stack component={Container} direction="row" spacing={1} justifyContent="space-between">
        <Typography variant="h6" component="span" fontWeight="bold">
          Total calories
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <NutritionComponentIcon type="calories" size="medium" />
          <Typography variant="h6" component="span" fontWeight="bold">
            {totalCalories} kcal
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
