import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  Slide,
  Stack,
  useScrollTrigger,
} from '@mui/material';
import { Fragment, type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionValueDisplay, type productModel } from '@/entities/product';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { NutritionSummaryItem } from '@/widgets/NutritionSummaryWidget/NutritionSummaryItem';

interface Props {
  date: string;
}

interface NutritionSummaryData {
  value: number;
  type: productModel.NutritionValueType;
}

export const NutritionSummaryWidget: FC<Props> = ({ date }) => {
  const scrolled = useScrollTrigger({
    threshold: 100,
    disableHysteresis: true,
  });

  const totalCalories = noteLib.useTotalCalories(date);

  // TODO: calculate nutrition summary
  const nutritionSummaryItems: NutritionSummaryData[] = [
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
                <NutritionValueDisplay value={value} type={type} size="medium" bold />
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
        <Grid size={4}>
          <NutritionSummaryItem value={totalCalories} type="calories" />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem value={123} type="protein" />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem value={12} type="fats" />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem value={123} type="carbs" />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem value={12} type="sugar" />
        </Grid>
        <Grid size={4}>
          <NutritionSummaryItem value={12} type="salt" />
        </Grid>
      </Grid>
    </Box>
  );
};
