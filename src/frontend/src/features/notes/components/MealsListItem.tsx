import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import { type FC, useMemo, useState } from 'react';
import { Calories } from 'src/components';
import { useAppSelector } from 'src/store';
import { getMealName, type MealType } from '../models';
import NotesTable from './NotesTable';

interface MealsListItemProps {
  mealType: MealType;
}

const MealsListItem: FC<MealsListItemProps> = ({ mealType }: MealsListItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const mealName = useMemo(() => getMealName(mealType), [mealType]);

  const noteItems = useAppSelector(state =>
    state.notes.noteItems.filter(n => n.mealType === mealType),
  );

  const totalCalories = useMemo(
    () => noteItems.reduce((sum, note) => sum + note.calories, 0),
    [noteItems],
  );

  const handleAccordionChange = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h2">{mealName}</Typography>
          <Calories amount={totalCalories} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <NotesTable mealType={mealType} />
      </AccordionDetails>
    </Accordion>
  );
};

export default MealsListItem;
