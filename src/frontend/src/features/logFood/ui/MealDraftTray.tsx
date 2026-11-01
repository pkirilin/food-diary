import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Alert, AlertTitle, Badge, Box, Container, Paper, Stack, Typography } from '@mui/material';
import { type FC, useId } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { noteLib } from '@/entities/note';
import { Button } from '@/shared/ui';
import { toNoteMealType } from '../lib/mapping';
import { useLogMealDraft } from '../lib/useLogMealDraft';

const COLLAPSED_ROW_HEIGHT = 64;

interface Props {
  onLogged: (date: string) => void;
}

export const MealDraftTray: FC<Props> = ({ onLogged }) => {
  const headingId = useId();
  const mealDraft = useAppSelector(foodLogModel.selectors.mealDraft);
  const foodLogsCount = useAppSelector(foodLogModel.selectors.foodLogsCount);
  const totalCalories = useAppSelector(foodLogModel.selectors.totalCalories);
  const { isLogging, error, logMealDraft } = useLogMealDraft(onLogged);

  if (mealDraft === null) {
    return null;
  }

  return (
    <>
      <Box sx={{ height: `calc(${COLLAPSED_ROW_HEIGHT}px + env(safe-area-inset-bottom))` }} />
      <Paper
        component="section"
        aria-labelledby={headingId}
        elevation={12}
        square
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme => theme.zIndex.appBar,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Container>
          {error && (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              <AlertTitle>{error.title}</AlertTitle>
              {error.message}
            </Alert>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', height: COLLAPSED_ROW_HEIGHT }}
          >
            <Badge badgeContent={foodLogsCount} color="primary" showZero>
              <RestaurantIcon />
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography id={headingId} noWrap sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {noteLib.getMealName(toNoteMealType(mealDraft.mealType))}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {foodLogsCount > 0 ? `${totalCalories} kcal` : 'Tap ⊕ to add a food'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              loading={isLogging}
              disabled={foodLogsCount === 0}
              onClick={() => void logMealDraft(mealDraft)}
            >
              Log food
            </Button>
          </Stack>
        </Container>
      </Paper>
    </>
  );
};
