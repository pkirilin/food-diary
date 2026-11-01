import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Collapse,
  Container,
  IconButton,
  List,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { type FC, useId, useState } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { noteLib } from '@/entities/note';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { Button } from '@/shared/ui';
import { toNoteMealType } from '../lib/mapping';
import { useLogMealDraft } from '../lib/useLogMealDraft';
import { MealDraftFoodLogListItem } from './MealDraftFoodLogListItem';

const COLLAPSED_ROW_HEIGHT = 64;

interface Props {
  onLogged: (date: string) => void;
}

export const MealDraftTray: FC<Props> = ({ onLogged }) => {
  const headingId = useId();
  const foodLogsListId = useId();
  const [expandRequested, setExpandRequested] = useState(false);
  const mealDraft = useAppSelector(foodLogModel.selectors.mealDraft);
  const foodLogsCount = useAppSelector(foodLogModel.selectors.foodLogsCount);
  const totalCalories = useAppSelector(foodLogModel.selectors.totalCalories);
  const { isLogging, error, logMealDraft } = useLogMealDraft(onLogged);

  if (mealDraft === null) {
    return null;
  }

  const expanded = expandRequested && foodLogsCount > 0;

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
          display: 'flex',
          flexDirection: 'column',
          maxHeight: {
            xs: `calc(100dvh - ${APP_BAR_HEIGHT_XS}px)`,
            sm: `calc(100dvh - ${APP_BAR_HEIGHT_SM}px)`,
          },
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Box sx={{ minHeight: 0, overflowY: 'auto' }}>
          <Container>
            {error && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                <AlertTitle>{error.title}</AlertTitle>
                {error.message}
              </Alert>
            )}
            <Collapse in={expanded} unmountOnExit>
              <List id={foodLogsListId} aria-label="Picked foods">
                {mealDraft.foodLogs.map(foodLog => (
                  <MealDraftFoodLogListItem key={foodLog.product.id} foodLog={foodLog} />
                ))}
              </List>
            </Collapse>
          </Container>
        </Box>
        <Container sx={{ flexShrink: 0 }}>
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
            <IconButton
              aria-label="Picked foods"
              aria-controls={expanded ? foodLogsListId : undefined}
              aria-expanded={expanded}
              disabled={foodLogsCount === 0}
              onClick={() => {
                setExpandRequested(!expanded);
              }}
            >
              {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
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
