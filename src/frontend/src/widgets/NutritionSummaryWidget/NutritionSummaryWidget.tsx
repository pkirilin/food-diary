import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  Slide,
  Stack,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import { Fragment, type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product';
import { nutritionComponents, type NutritionComponent } from '@/entities/product/model';
import { NutritionComponentIcon } from '@/entities/product/ui/NutritionComponentIcon';
import { NutritionComponentSummary } from '@/entities/product/ui/NutritionComponentSummary';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';

interface Props {
  date: string;
}

interface NutritionSummaryItem {
  value: number;
  type: NutritionComponent;
}

export const NutritionSummaryWidget: FC<Props> = ({ date }) => {
  const scrolled = useScrollTrigger({
    // TODO: calculate threshold
    threshold: 300,
    disableHysteresis: true,
  });

  const totalCalories = noteLib.useTotalCalories(date);

  // TODO: calculate nutrition summary
  const nutritionSummaryItems: NutritionSummaryItem[] = [
    {
      value: totalCalories,
      type: 'calories',
    },
    {
      value: 12,
      type: 'protein',
    },
    {
      value: 34,
      type: 'fats',
    },
    {
      value: 56,
      type: 'carbs',
    },
    {
      value: 78,
      type: 'sugar',
    },
    {
      value: 90,
      type: 'salt',
    },
  ];

  if (scrolled) {
    return (
      <Slide in={scrolled}>
        <Box
          sx={theme => ({
            top: APP_BAR_HEIGHT_XS,
            position: 'sticky',
            zIndex: 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            paddingY: 2,
            overflowX: 'scroll',

            [theme.breakpoints.up('sm')]: {
              top: APP_BAR_HEIGHT_SM,
            },
          })}
        >
          {/* TODO(optional): add scroll buttons */}
          <Stack
            component={Container}
            direction="row"
            spacing={2}
            sx={{
              '&::after': {
                content: '""',
                minWidth: theme => theme.spacing(2),
                display: 'block',
              },
            }}
          >
            {nutritionSummaryItems.map(({ value, type }, index) => (
              <Fragment key={type}>
                {/* TODO: use better naming to avoid relation with NutritionComponentInput */}
                <NutritionComponentLabel value={value} type={type} size="medium" bold />
                {index < nutritionSummaryItems.length - 1 && (
                  <Divider orientation="vertical" flexItem />
                )}
              </Fragment>
            ))}
          </Stack>
        </Box>
      </Slide>
    );
  }

  return (
    <Box px={1} py={2} component={Container}>
      <Grid container spacing={2}>
        <Grid size={12}>
          {/* TODO: move to component */}
          <Stack
            p={1}
            direction="row"
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" component="span" fontWeight="bold">
              Total calories
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <NutritionComponentIcon type="calories" size="medium" />
              <Typography variant="h6" component="span" fontWeight="bold">
                {totalCalories} {nutritionComponents.calories.unit}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid size={4}>
          <NutritionComponentSummary value={12} type="protein" />
        </Grid>
        <Grid size={4}>
          <NutritionComponentSummary value={12} type="fats" />
        </Grid>
        <Grid size={4}>
          <NutritionComponentSummary value={12} type="carbs" />
        </Grid>
        <Grid size={4}>
          <NutritionComponentSummary value={12} type="sugar" />
        </Grid>
        <Grid size={4}>
          <NutritionComponentSummary value={12} type="salt" />
        </Grid>
      </Grid>
    </Box>
  );
};
