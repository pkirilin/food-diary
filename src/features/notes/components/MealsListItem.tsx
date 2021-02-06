import React, { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotesTable from './NotesTable';
import { Meals, MealType } from '../models';

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
      <AccordionSummary expandIcon={<ExpandMoreIcon></ExpandMoreIcon>}>
        <Typography variant="h2">{mealName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NotesTable mealType={mealType}></NotesTable>
      </AccordionDetails>
    </Accordion>
  );
};

export default MealsListItem;
