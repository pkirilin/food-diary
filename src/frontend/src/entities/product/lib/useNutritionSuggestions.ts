import { useState } from 'react';
import { parseClientError } from '@/shared/api';
import { productApi } from '../api';
import { type NutritionValueType } from '../model';

interface Params {
  getName: () => string;
  getFieldValue: (field: NutritionValueType) => number | null;
  setFieldValue: (field: NutritionValueType, value: number) => void;
  onNutritionSuggestingChange?: (nutritionSuggesting: boolean) => void;
  onHasMacroSuggestion: () => void;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
}

interface Result {
  suggestingField: NutritionValueType | null;
  isSuggesting: boolean;
  handleSuggestClick: (clicked: NutritionValueType) => () => void;
}

export const useNutritionSuggestions = ({
  getName,
  getFieldValue,
  setFieldValue,
  onNutritionSuggestingChange,
  onHasMacroSuggestion,
  onError,
  onInfo,
}: Params): Result => {
  const [trigger] = productApi.useSuggestNutritionMutation();
  const [suggestingField, setSuggestingField] = useState<NutritionValueType | null>(null);

  const isSuggesting = suggestingField !== null;

  const applyEligible = (
    field: NutritionValueType,
    clicked: NutritionValueType,
    value: number | null,
  ): void => {
    if (value === null) {
      return;
    }

    if (getFieldValue(field) === null || field === clicked) {
      setFieldValue(field, value);
    }
  };

  const handleSuggest = async (clicked: NutritionValueType): Promise<void> => {
    setSuggestingField(clicked);
    onNutritionSuggestingChange?.(true);

    try {
      const suggestion = await trigger({ name: getName() }).unwrap();
      const values = [
        suggestion.calories,
        suggestion.protein,
        suggestion.fats,
        suggestion.carbs,
        suggestion.sugar,
        suggestion.salt,
      ];

      if (values.every(value => value === null)) {
        onInfo("Couldn't estimate nutrition for this product");
        return;
      }

      applyEligible('calories', clicked, suggestion.calories);
      applyEligible('protein', clicked, suggestion.protein);
      applyEligible('fats', clicked, suggestion.fats);
      applyEligible('carbs', clicked, suggestion.carbs);
      applyEligible('sugar', clicked, suggestion.sugar);
      applyEligible('salt', clicked, suggestion.salt);

      const hasMacroSuggestion = [
        suggestion.protein,
        suggestion.fats,
        suggestion.carbs,
        suggestion.sugar,
        suggestion.salt,
      ].some(value => value !== null);

      if (hasMacroSuggestion) {
        onHasMacroSuggestion();
      }
    } catch (error) {
      const clientError = parseClientError(error);
      onError(clientError.message);
    } finally {
      setSuggestingField(null);
      onNutritionSuggestingChange?.(false);
    }
  };

  const handleSuggestClick = (clicked: NutritionValueType) => (): void => {
    void handleSuggest(clicked);
  };

  return {
    suggestingField,
    isSuggesting,
    handleSuggestClick,
  };
};
