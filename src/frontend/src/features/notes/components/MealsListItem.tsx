import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Meals, MealType } from '../models';
import NotesTable from './NotesTable';

type MealsListItemProps = {
  mealType: MealType;
};

const MealsListItem: React.FC<MealsListItemProps> = ({ mealType }: MealsListItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const mealName = useMemo(() => Meals.getName(mealType), [mealType]);

  const handleAccordionChange = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Accordion variant="outlined" square expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h2">{mealName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NotesTable mealType={mealType} />
      </AccordionDetails>
    </Accordion>
  );
};

export default MealsListItem;