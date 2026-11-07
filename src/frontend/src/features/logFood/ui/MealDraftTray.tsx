import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  ButtonBase,
  Collapse,
  Container,
  List,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { type FC, type MouseEvent, useId, useState } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { noteLib } from '@/entities/note';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { Button } from '@/shared/ui';
import { toNoteMealType } from '../lib/mapping';
import { useLogMealDraft } from '../lib/useLogMealDraft';
import { MealDraftFoodLogListItem } from './MealDraftFoodLogListItem';

const COLLAPSED_ROW_HEIGHT = 64;
const ROW_GUTTER = { xs: 2, sm: 3 };

interface Props {
  query: string;
  onOpenProduct: (productId: number) => void;
  onLogged: (date: string) => void;
}

export const MealDraftTray: FC<Props> = ({ query, onOpenProduct, onLogged }) => {
  const headingId = useId();
  const foodLogsListId = useId();
  const [queryWhenExpanded, setQueryWhenExpanded] = useState<string | null>(null);
  const mealDraft = useAppSelector(foodLogModel.selectors.mealDraft);
  const foodLogsCount = useAppSelector(foodLogModel.selectors.foodLogsCount);
  const totalCalories = useAppSelector(foodLogModel.selectors.totalCalories);
  const { isLogging, error, logMealDraft } = useLogMealDraft(onLogged);

  if (mealDraft === null) {
    return null;
  }

  const expanded = queryWhenExpanded === query && foodLogsCount > 0;
  const empty = foodLogsCount === 0;

  const handleToggle = (event: MouseEvent<HTMLButtonElement>): void => {
    if (expanded) {
      setQueryWhenExpanded(null);
      return;
    }
    setQueryWhenExpanded(query);
    // iOS Safari doesn't focus a tapped button, and its keyboard stays open until the field loses focus
    event.currentTarget.focus();
  };

  return (
    <Paper
      component="section"
      aria-labelledby={headingId}
      elevation={4}
      square
      sx={{
        position: 'sticky',
        top: { xs: APP_BAR_HEIGHT_XS, sm: APP_BAR_HEIGHT_SM },
        zIndex: theme => theme.zIndex.appBar - 2,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '60dvh',
        overflow: 'hidden',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      }}
    >
      <Container disableGutters sx={{ flexShrink: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', height: COLLAPSED_ROW_HEIGHT }}>
          <ButtonBase
            aria-label="Picked foods"
            aria-controls={expanded ? foodLogsListId : undefined}
            aria-expanded={expanded}
            disabled={empty}
            onClick={handleToggle}
            sx={{
              flex: 1,
              minWidth: 0,
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              gap: 2,
              pl: ROW_GUTTER,
              pr: 2,
              textAlign: 'left',
            }}
          >
            <Badge badgeContent={foodLogsCount} color="primary" showZero>
              <RestaurantIcon />
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                id={headingId}
                component="span"
                noWrap
                sx={{ display: 'block', fontWeight: 'bold', lineHeight: 1.2 }}
              >
                {noteLib.getMealName(toNoteMealType(mealDraft.mealType))}
              </Typography>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ display: 'block' }}
              >
                {empty ? 'Tap ⊕ to add a food' : `${totalCalories} kcal`}
              </Typography>
            </Box>
            {expanded ? (
              <ExpandLessIcon color="action" />
            ) : (
              <ExpandMoreIcon color={empty ? 'disabled' : 'action'} />
            )}
          </ButtonBase>
          <Box sx={{ pr: ROW_GUTTER }}>
            <Button
              variant="contained"
              loading={isLogging}
              disabled={empty}
              onClick={() => void logMealDraft(mealDraft)}
            >
              Log food
            </Button>
          </Box>
        </Stack>
      </Container>
      <Box sx={{ minHeight: 0, overflowY: 'auto' }}>
        <Container>
          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              <AlertTitle>{error.title}</AlertTitle>
              {error.message}
            </Alert>
          )}
          <Collapse in={expanded} unmountOnExit>
            <List id={foodLogsListId} aria-label="Picked foods">
              {mealDraft.foodLogs.map(foodLog => (
                <MealDraftFoodLogListItem
                  key={foodLog.product.id}
                  foodLog={foodLog}
                  onOpen={onOpenProduct}
                />
              ))}
            </List>
          </Collapse>
        </Container>
      </Box>
    </Paper>
  );
};
