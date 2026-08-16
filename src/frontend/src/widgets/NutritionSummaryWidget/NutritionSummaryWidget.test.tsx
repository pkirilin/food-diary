import { screen } from '@testing-library/react';
import { productModel } from '@/entities/product';
import { render } from '@tests/render';
import { NutritionSummaryWidget } from './NutritionSummaryWidget';

const nutritionValues: Record<productModel.NutritionValueType, number> = {
  calories: 2994,
  protein: 97.58,
  fats: 47.86,
  carbs: 146.34,
  sugar: 19.07,
  salt: 2.42,
};

const types: productModel.NutritionValueType[] = [
  'calories',
  'protein',
  'fats',
  'carbs',
  'sugar',
  'salt',
];

test.each(types)('the %s value is shown in the colour that identifies it', type => {
  render(<NutritionSummaryWidget nutritionValues={nutritionValues} />);

  const { color } = productModel.nutritionValuesConfig[type];

  expect(screen.getByText(nutritionValues[type].toString())).toHaveStyle({ color });
});
