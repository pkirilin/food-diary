import { Box, Container, Divider, Stack, useScrollTrigger } from '@mui/material';
import { Fragment, type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionComponentLabel } from '@/entities/product';
import { type NutritionComponent } from '@/entities/product/model';
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
    threshold: APP_BAR_HEIGHT_XS / 2,
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

  return (
    <Box
      sx={theme => ({
        top: APP_BAR_HEIGHT_XS,
        position: 'sticky',
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
        boxShadow: scrolled ? theme.shadows[2] : 'none',
        paddingY: 2,
        overflowX: 'scroll',

        [theme.breakpoints.up('sm')]: {
          top: APP_BAR_HEIGHT_SM,
        },
      })}
    >
      {/* TODO(optional): add scroll buttons */}
      {/* TODO: add padding for last element in case of overflow */}
      <Stack component={Container} direction="row" spacing={2}>
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
  );
};
