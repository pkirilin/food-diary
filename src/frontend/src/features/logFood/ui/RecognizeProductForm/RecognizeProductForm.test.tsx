import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type FC, useState } from 'react';
import { type AppStore } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { type RecognizeNoteResponse } from '@/entities/note';
import { API_URL } from '@/shared/config';
import { holdNextNutritionSuggestion, pickPhotosForRecognition } from '@tests/lib';
import { server } from '@tests/mockApi/server';
import { render } from '@tests/render';
import { configureStoreWithMealDraft } from '../mealDraft.fixture';
import { RecognizeProductButton } from '../RecognizeProductButton';
import { RecognizeProductForm } from './RecognizeProductForm';

interface RecognitionScreenProps {
  onCreated: () => void;
}

// The form reads the picked photos once, on mount, so it must mount after the pick
const RecognitionScreen: FC<RecognitionScreenProps> = ({ onCreated }) => {
  const [photosPicked, setPhotosPicked] = useState(false);

  return photosPicked ? (
    <RecognizeProductForm onCreated={onCreated} />
  ) : (
    <RecognizeProductButton
      onPhotosPicked={() => {
        setPhotosPicked(true);
      }}
    />
  );
};

const renderRecognitionScreen = async (store: AppStore = configureStoreWithMealDraft()) => {
  const onCreated = vi.fn<() => void>();

  await render(<RecognitionScreen onCreated={onCreated} />, { store });

  return { onCreated };
};

const answerNextRecognition = (response: () => Response | Promise<Response>): void => {
  server.use(http.post(`${API_URL}/api/v1/notes/recognitions`, response, { once: true }));
};

test('the recognition form is prefilled from the first suggestion, with its quantity as the default quantity', async () => {
  const user = userEvent.setup();
  answerNextRecognition(() =>
    HttpResponse.json<RecognizeNoteResponse>({
      notes: [
        {
          product: {
            name: 'Greek yogurt',
            caloriesCost: 60,
            protein: 10,
            fats: 0.4,
            carbs: 3.6,
            sugar: null,
            salt: null,
          },
          quantity: 250,
        },
        {
          product: {
            name: 'Honey',
            caloriesCost: 304,
            protein: null,
            fats: null,
            carbs: 82,
            sugar: 82,
            salt: null,
          },
          quantity: 20,
        },
      ],
    }),
  );
  const store = configureStoreWithMealDraft();
  const { onCreated } = await renderRecognitionScreen(store);

  await pickPhotosForRecognition(user, ['front.jpg', 'label.jpg']);

  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Greek yogurt');
  expect(screen.getByRole('textbox', { name: 'Calories, kcal' })).toHaveValue('60');
  expect(screen.getByRole('textbox', { name: 'Default quantity, g' })).toHaveValue('250');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
  expect(foodLogModel.selectors.foodLogsCount(store.getState())).toBe(1);
  expect(foodLogModel.selectors.totalCalories(store.getState())).toBe(150);
});

test('Create on the recognition form is disabled while nutrition values are being suggested', async () => {
  const user = userEvent.setup();
  await renderRecognitionScreen();
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await screen.findByRole('textbox', { name: 'Name' });
  const suggestion = holdNextNutritionSuggestion({ calories: 60 });

  await user.click(screen.getByRole('button', { name: 'Suggest Calories' }));

  const create = screen.getByRole('button', { name: 'Create' });
  expect(create).toBeDisabled();

  suggestion.release();

  await waitFor(() => expect(create).toBeEnabled());
});

test('the recognition form shows the picked photos', async () => {
  const user = userEvent.setup();
  await renderRecognitionScreen();

  await pickPhotosForRecognition(user, ['front.jpg', 'label.jpg']);

  await screen.findByRole('textbox', { name: 'Name' });
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 2' })).toBeVisible();
});

test('the picked photos are shown when no food is found on them', async () => {
  const user = userEvent.setup();
  answerNextRecognition(() => HttpResponse.json<RecognizeNoteResponse>({ notes: [] }));
  await renderRecognitionScreen();

  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  expect(await screen.findByText('No food found. Please try other photos')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
});

test('a failed recognition shows an error, and Retry shows skeletons while it sends the same photos again', async () => {
  const user = userEvent.setup();
  answerNextRecognition(() => HttpResponse.json({}, { status: 500 }));
  await renderRecognitionScreen();
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent('Something went wrong. Please try again later.');

  const { promise: retryAnswered, resolve: answerRetry } = Promise.withResolvers<void>();
  server.use(
    http.post(`${API_URL}/api/v1/notes/recognitions`, async () => await retryAnswered, {
      once: true,
    }),
  );
  await user.click(within(error).getByRole('button', { name: 'Retry' }));

  expect(await screen.findByRole('progressbar', { name: 'Recognizing product' })).toBeVisible();
  answerRetry();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt.jpg');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('one pick sends exactly one recognition request', async () => {
  const user = userEvent.setup();
  let requestsSent = 0;
  server.use(
    http.post(`${API_URL}/api/v1/notes/recognitions`, () => {
      requestsSent += 1;
      return HttpResponse.json<RecognizeNoteResponse>({ notes: [] });
    }),
  );
  await renderRecognitionScreen();

  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  await screen.findByText('No food found. Please try other photos');
  expect(requestsSent).toBe(1);
});
