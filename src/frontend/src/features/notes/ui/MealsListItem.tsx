import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import { type FC, useMemo, useState, type PropsWithChildren } from 'react';
import { Calories } from 'src/components';
import { getMealName, type NoteItem, type MealType } from '../models';

interface Props extends PropsWithChildren {
  mealType: MealType;
  notes: NoteItem[];
}

export const MealsListItem: FC<Props> = ({ children, mealType, notes }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const mealName = useMemo(() => getMealName(mealType), [mealType]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

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
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
