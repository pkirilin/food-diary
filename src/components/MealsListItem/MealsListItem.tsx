import React from 'react';
import './MealsListItem.scss';
import { MealItem } from '../../models';
import Icon from '../Icon';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';

interface MealsListItemProps {
  data: MealItem;
}

const MealsListItem: React.FC<MealsListItemProps> = ({ data: meal }: MealsListItemProps) => {
  // TODO: take this from global state
  const isExpanded = true;

  return (
    <div className="meals-list-item">
      <div className="meals-list-item__header">
        <Icon
          type="right-arrow"
          size="small"
          svgStyle={
            isExpanded
              ? {
                  transform: 'rotate(90deg)',
                }
              : {}
          }
        ></Icon>
        <div className="meals-list-item__header__name">{meal.name}</div>
        <BadgesContainer>
          <Badge label={`${meal.countNotes} ${meal.countNotes === 1 ? 'note' : 'notes'}`}></Badge>
          <Badge label={`${meal.countCalories} cal`}></Badge>
        </BadgesContainer>
      </div>
      {isExpanded && <div className="meals-list-item__content">Content</div>}
    </div>
  );
};

export default MealsListItem;
