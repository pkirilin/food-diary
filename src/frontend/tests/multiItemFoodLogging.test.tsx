import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import { act, configure, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type RecognizeNoteResponse } from '@/entities/note';
import { API_URL } from '@/shared/config';
import { imageLib } from '@/shared/lib';
import { renderApp } from '@tests/render';
import { server } from './mockApi/server';

configure({ asyncUtilTimeout: 3000 });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const findMultiItemSwitch = (): Promise<HTMLElement> =>
  screen.findByRole('switch', { name: 'Log several foods at once' });

const openDayPageWithMultiItemFoodLoggingOn = async (user: UserEvent): Promise<void> => {
  await renderApp('/settings', { signedIn: true });
  await user.click(await findMultiItemSwitch());
  await user.click(screen.getByRole('button', { name: /open menu/i }));
  await user.click(screen.getByRole('link', { name: 'Today' }));
};

const clickAddMeal = async (user: UserEvent, mealName: string): Promise<void> => {
  const addMealButton = await screen.findByRole('button', { name: `Add ${mealName}` });
  await waitFor(() => expect(addMealButton).toBeEnabled());
  await user.click(addMealButton);
};

const findSearchField = (): Promise<HTMLElement> =>
  screen.findByRole('searchbox', { name: 'Search products' });

const findTray = (mealName: string): Promise<HTMLElement> =>
  screen.findByRole('region', { name: mealName });

const findFoodLogsOfMeal = async (mealName: string): Promise<(string | null)[]> => {
  const meal = await screen.findByRole('listitem', {
    name: new RegExp(`^${mealName}, \\d+ kilocalories$`),
  });
  return within(meal)
    .getAllByRole('button', { name: / g/ })
    .map(foodLog => foodLog.textContent);
};

const searchProducts = async (user: UserEvent, query: string): Promise<HTMLElement> => {
  await user.type(await findSearchField(), query);
  return await screen.findByRole('list', { name: 'Found products' });
};

const addFoundProduct = async (
  user: UserEvent,
  query: string,
  productName: string,
): Promise<void> => {
  const foundProducts = await searchProducts(user, query);
  await user.click(
    await within(foundProducts).findByRole('button', { name: `Add ${productName}` }),
  );
};

test('the Settings drawer link opens a "Log several foods at once" switch that is off by default', async () => {
  const user = userEvent.setup();
  await renderApp('/', { signedIn: true });

  await user.click(await screen.findByRole('button', { name: /open menu/i }));
  await user.click(screen.getByRole('link', { name: 'Settings' }));

  expect(await findMultiItemSwitch()).not.toBeChecked();
  expect(screen.getByText('Stored on this device')).toBeVisible();
});

test('the "Log several foods at once" switch keeps its value across a reload', async () => {
  const user = userEvent.setup();
  const { unmount } = await renderApp('/settings', { signedIn: true });
  await user.click(await findMultiItemSwitch());

  unmount();
  await renderApp('/settings', { signedIn: true });

  expect(await findMultiItemSwitch()).toBeChecked();
});

test('the "Log several foods at once" switch reads as off when the device storage throws', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage is disabled');
  });

  await renderApp('/settings', { signedIn: true });

  expect(await findMultiItemSwitch()).not.toBeChecked();
});

test.each([
  { storage: 'empty', prepareStorage: () => {} },
  {
    storage: 'throwing',
    prepareStorage: () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage is disabled');
      });
    },
  },
])(
  'with the switch off and $storage device storage, Add breakfast opens the old dialog',
  async ({ prepareStorage }) => {
    prepareStorage();
    const user = userEvent.setup();
    await renderApp('/', { signedIn: true });

    await clickAddMeal(user, 'Breakfast');

    expect(await screen.findByRole('dialog', { name: /breakfast/i })).toBeVisible();
  },
);

test('with the switch on, Add breakfast opens an empty search screen with the search field focused', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);

  await clickAddMeal(user, 'Breakfast');

  expect(await findSearchField()).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test("searching shows each found product's name, default quantity and calories", async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');

  await user.type(await findSearchField(), 'chick');

  const foundProducts = await screen.findByRole('list', { name: 'Found products' });
  const chicken = await within(foundProducts).findByRole('listitem');
  expect(chicken).toHaveTextContent('Chicken');
  expect(chicken).toHaveTextContent('150 g · 358 kcal');
});

test('fast typing in the search field keeps every typed letter', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  const searchField = await findSearchField();

  await userEvent.setup({ delay: null }).type(searchField, 'chick');

  expect(searchField).toHaveValue('chick');
  expect(await screen.findByText('Chicken')).toBeVisible();
});

test('the back arrow returns from the search screen to the day page, however much was typed', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await user.type(await findSearchField(), 'chick');
  await screen.findByText('Chicken');

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});

test('the tray is headed with the Meal and asks for a first food while the Meal Draft is empty', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);

  await clickAddMeal(user, 'Lunch');

  const tray = await findTray('Lunch');
  expect(within(tray).getByText('0')).toBeVisible();
  expect(tray).toHaveTextContent('Tap ⊕ to add a food');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeDisabled();
});

test('⊕ adds a product with its default quantity, then clears the search and keeps it focused', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');

  await addFoundProduct(user, 'chick', 'Chicken');

  const searchField = await findSearchField();
  await waitFor(() => expect(searchField).toHaveValue(''));
  expect(searchField).toHaveFocus();
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(tray).toHaveTextContent('358 kcal');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeEnabled();
});

test('a product in the Meal Draft shows as selected, and ⊕ on it takes it out', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));

  const foundProducts = await searchProducts(user, 'chick');
  await user.click(await within(foundProducts).findByRole('button', { name: 'Remove Chicken' }));

  expect(await within(foundProducts).findByRole('button', { name: 'Add Chicken' })).toBeVisible();
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('0')).toBeVisible();
  expect(tray).toHaveTextContent('Tap ⊕ to add a food');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeDisabled();
});

test('Log food logs the Meal Draft in the order picked, after the Meal’s existing Food Logs', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));
  await addFoundProduct(user, 'oat', 'Oats');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('2')).toBeVisible();
  expect(tray).toHaveTextContent('737 kcal');

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toEqual([
      expect.stringMatching(/^Beef200 g/),
      expect.stringMatching(/^Spinach Leaves.*300 g/),
      expect.stringMatching(/^Chicken150 g/),
      expect.stringMatching(/^Oats100 g/),
    ]),
  );
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});

test('a failed Log food keeps the Meal Draft, shows an error and can be retried', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  const tray = await findTray('Breakfast');
  server.use(
    http.post(`${API_URL}/api/v1/notes/batch`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  expect(await within(tray).findByRole('alert')).toHaveTextContent(
    'Something went wrong. Please try again later.',
  );
  expect(within(tray).getByText('1')).toBeVisible();
  expect(tray).toHaveTextContent('358 kcal');

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Chicken150 g/),
    ),
  );
});

test('a search that finds nothing offers to create the product, prefilled with the query', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');

  await user.type(await findSearchField(), 'Yogurt');
  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));

  expect(await screen.findByRole('heading', { name: 'New product' })).toBeVisible();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt');
  expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();
});

test('Create adds the new product to the Meal Draft with its default quantity, back on the search, ready to log', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await user.type(await findSearchField(), 'Yogurt');
  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));
  const calories = await screen.findByRole('textbox', { name: 'Calories, kcal' });
  await user.clear(calories);
  await user.type(calories, '60');
  const defaultQuantity = screen.getByRole('textbox', { name: 'Default quantity, g' });
  await user.clear(defaultQuantity);
  await user.type(defaultQuantity, '250');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  const foundProducts = await screen.findByRole('list', { name: 'Found products' });
  expect(await within(foundProducts).findByRole('button', { name: 'Remove Yogurt' })).toBeVisible();
  expect(await findSearchField()).toHaveValue('Yogurt');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(tray).toHaveTextContent('150 kcal');

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Yogurt250 g150$/),
    ),
  );
});

test('Create with the name of an existing product shows the clash on the form and keeps the input', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await user.type(await findSearchField(), 'Yogurt');
  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));
  const name = await screen.findByRole('textbox', { name: 'Name' });
  await user.clear(name);
  await user.type(name, 'Cheese');
  const calories = screen.getByRole('textbox', { name: 'Calories, kcal' });
  await user.clear(calories);
  await user.type(calories, '350');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByText("Product with the name 'Cheese' already exists")).toBeVisible();
  expect(name).toHaveValue('Cheese');
  expect(calories).toHaveValue('350');
  expect(screen.getByRole('heading', { name: 'New product' })).toBeVisible();

  await user.type(name, ' yogurt');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  const foundProducts = await screen.findByRole('list', { name: 'Found products' });
  expect(
    await within(foundProducts).findByRole('button', { name: 'Remove Cheese yogurt' }),
  ).toBeVisible();
});

test('a failed Create shows an error and keeps the input', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await user.type(await findSearchField(), 'Yogurt');
  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));
  server.use(
    http.post(`${API_URL}/api/v1/products`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );

  await user.click(await screen.findByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Something went wrong. Please try again later.',
  );
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt');
});

const moveThroughBrowserHistory = async (move: () => void): Promise<void> => {
  const popped = new Promise(resolve => {
    window.addEventListener('popstate', resolve, { once: true });
  });
  move();
  await act(() => popped);
};

const findDiscardPrompt = (foodLogsCount: number): Promise<HTMLElement> =>
  screen.findByRole('dialog', { name: `Discard ${foodLogsCount} food logs?` });

test('the back arrow asks to discard the picked products when the Meal Draft is not empty', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await findDiscardPrompt(2)).toBeVisible();
});

test('Discard empties the Meal Draft and leaves for the day page', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);
  await user.click(screen.getByRole('button', { name: 'Back' }));

  await user.click(within(await findDiscardPrompt(2)).getByRole('button', { name: 'Discard' }));

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  expect(await findFoodLogsOfMeal('Breakfast')).toEqual([
    expect.stringMatching(/^Beef200 g/),
    expect.stringMatching(/^Spinach Leaves.*300 g/),
  ]);

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).not.toMatch(/^#\/log\/food/));
  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
});

test('Cancel stays on the search screen with the Meal Draft intact', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);
  await user.click(screen.getByRole('button', { name: 'Back' }));

  await user.click(within(await findDiscardPrompt(2)).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(await findSearchField()).toBeVisible();
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('2')).toBeVisible();
  expect(tray).toHaveTextContent('737 kcal');
});

test("the browser's back button asks to discard the picked products, too", async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);

  await moveThroughBrowserHistory(() => window.history.back());

  expect(await findDiscardPrompt(2)).toBeVisible();
});

test('the discard prompt names a single picked product in the singular', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('dialog', { name: 'Discard 1 food log?' })).toBeVisible();
});

test('leaving the flow with an empty Meal Draft does not ask', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));
  const foundProducts = await searchProducts(user, 'chick');
  await user.click(await within(foundProducts).findByRole('button', { name: 'Remove Chicken' }));

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('searching again after picking a product stays in the flow without asking', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));

  const foundProducts = await searchProducts(user, 'oat');

  expect(await within(foundProducts).findByText('Oats')).toBeVisible();
  expect(window.location.hash).toBe('#/log/food?q=oat');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

const addChickenAndOatsToBreakfast = async (user: UserEvent): Promise<HTMLElement> => {
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'oat', 'Oats');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));
  await addFoundProduct(user, 'chick', 'Chicken');
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));
  return await findTray('Breakfast');
};

const findPickedFoods = (tray: HTMLElement): Promise<HTMLElement> =>
  within(tray).findByRole('list', { name: 'Picked foods' });

test('the expanded tray lists the picked products in the order picked, without a quantity field', async () => {
  const user = userEvent.setup();
  const tray = await addChickenAndOatsToBreakfast(user);
  const toggle = within(tray).getByRole('button', { name: 'Picked foods' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await user.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const rows = within(await findPickedFoods(tray)).getAllByRole('listitem');
  expect(rows.map(row => row.textContent)).toEqual([
    expect.stringMatching(/^Oats100 g · 379 kcal/),
    expect.stringMatching(/^Chicken150 g · 358 kcal/),
  ]);
  expect(within(tray).queryByRole('textbox')).not.toBeInTheDocument();
  expect(within(tray).queryByRole('spinbutton')).not.toBeInTheDocument();

  await user.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() =>
    expect(within(tray).queryByRole('list', { name: 'Picked foods' })).not.toBeInTheDocument(),
  );
});

test('deleting a product from the expanded tray updates the count and the total', async () => {
  const user = userEvent.setup();
  const tray = await addChickenAndOatsToBreakfast(user);
  await user.click(within(tray).getByRole('button', { name: 'Picked foods' }));
  const pickedFoods = await findPickedFoods(tray);

  await user.click(within(pickedFoods).getByRole('button', { name: 'Delete Oats' }));

  expect(within(pickedFoods).getAllByRole('listitem')).toHaveLength(1);
  expect(within(pickedFoods).getByRole('listitem')).toHaveTextContent('Chicken');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(within(tray).getByText('358 kcal')).toBeVisible();

  await user.click(within(pickedFoods).getByRole('button', { name: 'Delete Chicken' }));

  expect(within(tray).getByText('0')).toBeVisible();
  expect(tray).toHaveTextContent('Tap ⊕ to add a food');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeDisabled();
});

// Vitest's jsdom environment fails to send a jsdom FormData holding a Blob (it reads jsdom
// internals that jsdom 30 no longer has), so the recognition request is built from Node's classes
const sendMultipartRequestsWithNodeClasses = async (): Promise<void> => {
  const nodeFormData = await new Response(new URLSearchParams()).formData();
  vi.stubGlobal('Blob', NodeBlob);
  vi.stubGlobal('File', NodeFile);
  vi.stubGlobal('FormData', nodeFormData.constructor);
};

const pickPhotosForRecognition = async (user: UserEvent, photoNames: string[]): Promise<void> => {
  // Created before the stubs, as jsdom reads only its own files
  const photos = photoNames.map(name => new File([name], name, { type: 'image/jpeg' }));
  await sendMultipartRequestsWithNodeClasses();
  // jsdom draws no images, so resizing passes the picked file through
  vi.spyOn(imageLib, 'resize').mockImplementation(async file => await Promise.resolve(file));

  await user.upload(
    await screen.findByLabelText('Recognize product from photos', { selector: 'input' }),
    photos,
  );
};

test('a product recognized from a photo through the mock suggestion lands in the Meal Draft', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');

  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  expect(await screen.findByRole('heading', { name: 'Recognize product' })).toBeVisible();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt.jpg');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await findSearchField()).toBeVisible();
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  await user.click(within(tray).getByRole('button', { name: 'Picked foods' }));
  expect(within(await findPickedFoods(tray)).getByRole('listitem')).toHaveTextContent('Yogurt.jpg');
});

test('the recognition form is prefilled from the first suggestion, with its quantity as the default quantity', async () => {
  const user = userEvent.setup();
  server.use(
    http.post(
      `${API_URL}/api/v1/notes/recognitions`,
      () =>
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
      { once: true },
    ),
  );
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');

  await pickPhotosForRecognition(user, ['front.jpg', 'label.jpg']);

  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Greek yogurt');
  expect(screen.getByRole('textbox', { name: 'Calories, kcal' })).toHaveValue('60');
  expect(screen.getByRole('textbox', { name: 'Default quantity, g' })).toHaveValue('250');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(within(tray).getByText('150 kcal')).toBeVisible();
});

test('a failed recognition shows an error, and Retry shows skeletons while it sends the same photos again', async () => {
  const user = userEvent.setup();
  server.use(
    http.post(
      `${API_URL}/api/v1/notes/recognitions`,
      () => HttpResponse.json({}, { status: 500 }),
      { once: true },
    ),
  );
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
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

test('going forward to the recognition screen after Create lands on the search instead', async () => {
  const user = userEvent.setup();
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await user.click(await screen.findByRole('button', { name: 'Create' }));
  await findSearchField();

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Recognize product' })).not.toBeInTheDocument();
});

const openRecognitionScreenByUrl = async (): Promise<void> => {
  await moveThroughBrowserHistory(() => {
    window.location.hash = '#/log/food/recognition';
  });
};

test.each([
  {
    leaving: 'logging the Meal Draft',
    leave: async (user: UserEvent) => {
      await user.click(
        within(await findTray('Breakfast')).getByRole('button', { name: 'Log food' }),
      );
    },
  },
  {
    leaving: 'discarding the Meal Draft',
    leave: async (user: UserEvent) => {
      await user.click(screen.getByRole('button', { name: 'Back' }));
      const discardPrompt = await screen.findByRole('dialog', { name: 'Discard 1 food log?' });
      await user.click(within(discardPrompt).getByRole('button', { name: 'Discard' }));
    },
  },
])('photos left after a failed recognition are forgotten after $leaving', async ({ leave }) => {
  const user = userEvent.setup();
  server.use(
    http.post(
      `${API_URL}/api/v1/notes/recognitions`,
      () => HttpResponse.json({}, { status: 500 }),
      { once: true },
    ),
  );
  await openDayPageWithMultiItemFoodLoggingOn(user);
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await screen.findByRole('alert');
  await user.click(screen.getByRole('button', { name: 'Back' }));
  await findSearchField();
  await leave(user);
  await screen.findByRole('button', { name: /19 oct 2023/i });
  await clickAddMeal(user, 'Breakfast');
  await findSearchField();

  await openRecognitionScreenByUrl();

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Recognize product' })).not.toBeInTheDocument();
});

test('opening the search screen with no Meal Draft lands on the day page', async () => {
  await renderApp('/log/food?q=chicken', { signedIn: true });

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});
