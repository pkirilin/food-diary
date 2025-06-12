import { render } from '@testing-library/react';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { type noteModel } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface GivenMealsListItemArgs {
  mealType: noteModel.MealType;
  preloadNotes?: boolean;
}

export const givenMealsListItem = async ({ mealType }: GivenMealsListItemArgs): Promise<void> => {
  const store = configureStore();
  const date = '2023-10-19';

  render(
    <RootProvider store={store}>
      <MealsListItem date={date} mealType={mealType} />
    </RootProvider>,
  );
};
