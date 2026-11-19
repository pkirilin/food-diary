import { HttpResponse, http } from 'msw';
import { type SuggestProductNutritionResponse } from '@/entities/product';
import { API_URL } from '@/shared/config';
import { server } from '@tests/mockApi/server';

interface HeldNutritionSuggestion {
  readonly answered: boolean;
  release: () => void;
}

const holdNextSuggestionAnswer = (answer: () => Response): HeldNutritionSuggestion => {
  const { promise: released, resolve: release } = Promise.withResolvers<void>();
  let answered = false;

  server.use(
    http.post(
      `${API_URL}/api/v1/products/nutrition/suggestions`,
      async () => {
        await released;
        answered = true;
        return answer();
      },
      { once: true },
    ),
  );

  return {
    get answered() {
      return answered;
    },
    release,
  };
};

export const holdNextNutritionSuggestion = (
  suggestion: Partial<SuggestProductNutritionResponse>,
): HeldNutritionSuggestion =>
  holdNextSuggestionAnswer(() =>
    HttpResponse.json<SuggestProductNutritionResponse>({
      calories: null,
      protein: null,
      fats: null,
      carbs: null,
      sugar: null,
      salt: null,
      ...suggestion,
    }),
  );

export const holdNextFailingNutritionSuggestion = (): HeldNutritionSuggestion =>
  holdNextSuggestionAnswer(() => HttpResponse.json({}, { status: 500 }));
