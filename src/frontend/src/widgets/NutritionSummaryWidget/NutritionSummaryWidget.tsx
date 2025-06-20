import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  Slide,
  Stack,
  useScrollTrigger,
} from '@mui/material';
import { type FC } from 'react';
import { noteLib } from '@/entities/note';
import { NutritionValueDisplay } from '@/entities/product';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { NutritionSummaryItem } from '@/widgets/NutritionSummaryWidget/NutritionSummaryItem';

interface Props {
  date: string;
}

export const NutritionSummaryWidget: FC<Props> = ({ date }) => {
  const scrolled = useScrollTrigger({
    threshold: 180,
    disableHysteresis: true,
  });

  const { calories, protein, fats, carbs, sugar, salt } = noteLib.useNutritionValues(date);

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
        </Box>
      </Slide>
    );
  }

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
