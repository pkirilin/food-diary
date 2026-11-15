import { act, configure, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { delay, HttpResponse, http } from 'msw';
import { API_URL } from '@/shared/config';
import { captureFocusDuring } from '@tests/captureFocusDuring';
import { pickPhotosForRecognition } from '@tests/pickPhotosForRecognition';
import { renderApp } from '@tests/render';
import { server } from './mockApi/server';

configure({ asyncUtilTimeout: 3000 });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('devicePreferences.multiItemFoodLogging', 'true');
});

afterEach(() => {
  vi.restoreAllMocks();
});

const openDayPage = async (): Promise<void> => {
  await renderApp('/', { signedIn: true });
};

const clickAddMeal = async (user: UserEvent, mealName: string): Promise<void> => {
  const addMealButton = await screen.findByRole('button', { name: `Add ${mealName}` });
  await waitFor(() => expect(addMealButton).toBeEnabled());
  await user.click(addMealButton);
};

const openBreakfastSearch = async (user: UserEvent): Promise<void> => {
  await openDayPage();
  await clickAddMeal(user, 'Breakfast');
};

const findDayPage = (): Promise<HTMLElement> =>
  screen.findByRole('button', { name: /19 oct 2023/i });

const findSearchField = (): Promise<HTMLElement> =>
  screen.findByRole('searchbox', { name: 'Search products' });

const findTray = (mealName: string): Promise<HTMLElement> =>
  screen.findByRole('region', { name: mealName });

const findPickedFoods = (tray: HTMLElement): Promise<HTMLElement> =>
  within(tray).findByRole('list', { name: 'Picked foods' });

const findQuantityField = (): Promise<HTMLInputElement> =>
  screen.findByRole<HTMLInputElement>('textbox', { name: 'Quantity' });

const getFoodLogsOfMeal = (meal: HTMLElement): (string | null)[] =>
  within(meal)
    .getAllByRole('button', { name: / g/ })
    .map(foodLog => foodLog.textContent);

const findFoodLogsOfMeal = async (mealName: string): Promise<(string | null)[]> =>
  getFoodLogsOfMeal(
    await screen.findByRole('listitem', {
      name: new RegExp(`^${mealName}, \\d+ kilocalories$`),
    }),
  );

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
  await waitFor(async () => expect(await findSearchField()).toHaveValue(''));
};

const openFoundProduct = async (
  user: UserEvent,
  query: string,
  productName: string,
): Promise<void> => {
  const foundProducts = await searchProducts(user, query);
  await user.click(
    await within(foundProducts).findByRole('button', { name: new RegExp(`^${productName}`) }),
  );
};

const addChickenAndOatsToBreakfast = async (user: UserEvent): Promise<HTMLElement> => {
  await openBreakfastSearch(user);
  await addFoundProduct(user, 'oat', 'Oats');
  await addFoundProduct(user, 'chick', 'Chicken');
  return await findTray('Breakfast');
};

const logMealDraft = async (user: UserEvent, mealName: string): Promise<void> => {
  await user.click(within(await findTray(mealName)).getByRole('button', { name: 'Log food' }));
};

const replaceFieldValue = async (user: UserEvent, field: HTMLElement, value: string) => {
  await user.clear(field);
  await user.type(field, value);
};

const moveThroughBrowserHistory = async (move: () => void): Promise<void> => {
  const popped = new Promise(resolve => {
    window.addEventListener('popstate', resolve, { once: true });
  });
  move();
  await act(() => popped);
};

// TanStack Router keys its saved scroll positions by this history entry key
const getHistoryEntryKey = (): unknown =>
  (window.history.state as { __TSR_key?: string } | null)?.__TSR_key;

const BREAKFAST_FOOD_LOGS_BEFORE: unknown[] = [
  expect.stringMatching(/^Beef200 g/),
  expect.stringMatching(/^Spinach Leaves.*300 g/),
];

test('pick several products and log them, in the order picked, after the Meal’s existing Food Logs', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);

  const searchField = await findSearchField();
  expect(searchField).toHaveFocus();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await addFoundProduct(user, 'chick', 'Chicken');

  expect(searchField).toHaveFocus();
  expect(screen.queryByRole('heading', { name: 'Product' })).not.toBeInTheDocument();

  await addFoundProduct(user, 'oat', 'Oats');

  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('2')).toBeVisible();
  expect(tray).toHaveTextContent('737 kcal');

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toEqual([
      ...BREAKFAST_FOOD_LOGS_BEFORE,
      expect.stringMatching(/^Chicken150 g/),
      expect.stringMatching(/^Oats100 g/),
    ]),
  );
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});

test('create a product that was not found, then log it', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await user.type(await findSearchField(), 'Yogurt');

  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));

  expect(await screen.findByRole('heading', { name: 'New product' })).toBeVisible();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt');
  await replaceFieldValue(user, screen.getByRole('textbox', { name: 'Calories, kcal' }), '60');
  await replaceFieldValue(
    user,
    screen.getByRole('textbox', { name: 'Default quantity, g' }),
    '250',
  );

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await findSearchField()).toHaveValue('');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(tray).toHaveTextContent('150 kcal');

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Yogurt250 g150$/),
    ),
  );
});

test('recognize a product from a photo, then log it', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await user.type(await findSearchField(), 'yog');

  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  expect(await screen.findByRole('heading', { name: 'Recognize product' })).toBeVisible();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt.jpg');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await findSearchField()).toHaveValue('');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Yogurt\.jpg/),
    ),
  );
});

test('open a product, type a quantity, then log it', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);

  await openFoundProduct(user, 'chick', 'Chicken');

  expect(await screen.findByRole('heading', { name: 'Product' })).toBeVisible();
  expect(await screen.findByRole('heading', { name: 'Chicken' })).toBeVisible();
  expect(await findQuantityField()).toHaveFocus();

  await user.keyboard('200');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  expect(await findSearchField()).toHaveValue('');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(within(tray).getByText('478 kcal')).toBeVisible();

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Chicken200 g/),
    ),
  );
});

test('change a quantity from a tray row, then log it', async () => {
  const user = userEvent.setup();
  const tray = await addChickenAndOatsToBreakfast(user);
  await user.click(within(tray).getByRole('button', { name: 'Picked foods' }));

  await user.click(within(await findPickedFoods(tray)).getByRole('button', { name: /^Oats/ }));

  expect(await screen.findByRole('heading', { name: 'Oats' })).toBeVisible();
  expect(await findQuantityField()).toHaveValue('100');

  await user.keyboard('50');
  await user.click(screen.getByRole('button', { name: 'Save' }));

  const trayAfterSave = await findTray('Breakfast');
  expect(within(trayAfterSave).getByText('2')).toBeVisible();
  expect(within(trayAfterSave).getByText('547 kcal')).toBeVisible();

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toEqual([
      ...BREAKFAST_FOOD_LOGS_BEFORE,
      expect.stringMatching(/^Oats50 g/),
      expect.stringMatching(/^Chicken150 g/),
    ]),
  );
});

test('edit a product while it is in the Meal Draft, then log it', async () => {
  const user = userEvent.setup();
  const tray = await addChickenAndOatsToBreakfast(user);
  await user.click(within(tray).getByRole('button', { name: 'Picked foods' }));
  await user.click(within(await findPickedFoods(tray)).getByRole('button', { name: /^Chicken/ }));
  await user.click(await screen.findByRole('button', { name: /edit product/i }));
  await replaceFieldValue(user, await screen.findByRole('textbox', { name: 'Name' }), 'Turkey');
  await replaceFieldValue(user, screen.getByRole('textbox', { name: 'Calories, kcal' }), '160');
  await replaceFieldValue(
    user,
    screen.getByRole('textbox', { name: 'Default quantity, g' }),
    '200',
  );

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('heading', { name: 'Product' })).toBeVisible();
  expect(await screen.findByRole('heading', { name: 'Turkey' })).toBeVisible();
  expect(screen.getByText('160 kcal per 100 g')).toBeVisible();
  expect(await findQuantityField()).toHaveValue('200');

  await user.click(screen.getByRole('button', { name: 'Back' }));

  const trayAfterEdit = await findTray('Breakfast');
  expect(within(trayAfterEdit).getByText('699 kcal')).toBeVisible();
  await user.click(within(trayAfterEdit).getByRole('button', { name: 'Picked foods' }));
  const rows = within(await findPickedFoods(trayAfterEdit)).getAllByRole('listitem');
  expect(rows.map(row => row.textContent)).toEqual([
    expect.stringMatching(/^Oats100 g · 379 kcal/),
    expect.stringMatching(/^Turkey200 g · 320 kcal/),
  ]);

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Turkey200 g320$/),
    ),
  );
});

test('edit a product outside the Meal Draft, then log the changed product', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await openFoundProduct(user, 'chick', 'Chicken');

  await user.click(await screen.findByRole('button', { name: /edit product/i }));

  expect(await screen.findByRole('heading', { name: /edit product/i })).toBeVisible();
  await replaceFieldValue(
    user,
    await screen.findByRole('textbox', { name: 'Default quantity, g' }),
    '123',
  );
  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('heading', { name: 'Product' })).toBeVisible();
  expect(await screen.findByRole('heading', { name: 'Chicken' })).toBeVisible();
  expect(await findQuantityField()).toHaveValue('123');

  await user.click(screen.getByRole('button', { name: 'Add' }));

  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('293 kcal')).toBeVisible();

  await logMealDraft(user, 'Breakfast');

  await waitFor(async () =>
    expect(await findFoodLogsOfMeal('Breakfast')).toContainEqual(
      expect.stringMatching(/^Chicken123 g293$/),
    ),
  );
});

test('leave a non-empty Meal Draft and discard it', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);

  await user.click(screen.getByRole('button', { name: 'Back' }));

  const discardPrompt = await screen.findByRole('dialog', { name: 'Discard 2 food logs?' });

  await user.click(within(discardPrompt).getByRole('button', { name: 'Discard' }));

  expect(await findDayPage()).toBeVisible();
  expect(await findFoodLogsOfMeal('Breakfast')).toEqual(BREAKFAST_FOOD_LOGS_BEFORE);

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).not.toMatch(/^#\/log\/food/));
  expect(await findDayPage()).toBeVisible();
});

test('Log food returns to the history entry of the day page it started from, which already shows the logged Food Logs, so its scroll position is restored', async () => {
  const user = userEvent.setup();
  await openDayPage();
  await screen.findByRole('button', { name: 'Add Breakfast' });
  const dayPageHistoryKey = getHistoryEntryKey();
  await clickAddMeal(user, 'Breakfast');
  await addFoundProduct(user, 'chick', 'Chicken');

  await logMealDraft(user, 'Breakfast');

  const breakfast = await screen.findByRole('listitem', { name: /^Breakfast, / });
  expect(getHistoryEntryKey()).toBe(dayPageHistoryKey);
  expect(getFoodLogsOfMeal(breakfast)).toEqual([
    ...BREAKFAST_FOOD_LOGS_BEFORE,
    expect.stringMatching(/^Chicken150 g/),
  ]);
});

test("the browser's back button asks to discard the picked products", async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);

  await moveThroughBrowserHistory(() => window.history.back());

  expect(await screen.findByRole('dialog', { name: 'Discard 2 food logs?' })).toBeVisible();
});

test('the back arrow returns from the search screen to the day page, however much was typed', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await searchProducts(user, 'chick');

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await findDayPage()).toBeVisible();
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});

test('leaving the flow with an emptied Meal Draft does not ask', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await addFoundProduct(user, 'chick', 'Chicken');
  const foundProducts = await searchProducts(user, 'chick');
  await user.click(await within(foundProducts).findByRole('button', { name: 'Remove Chicken' }));

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await findDayPage()).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Cancel on the discard prompt stays on the search screen with the Meal Draft intact', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);
  await user.click(screen.getByRole('button', { name: 'Back' }));
  const discardPrompt = await screen.findByRole('dialog', { name: 'Discard 2 food logs?' });

  await user.click(within(discardPrompt).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(await findSearchField()).toBeVisible();
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('2')).toBeVisible();
  expect(tray).toHaveTextContent('737 kcal');
});

test('a new meal opens with an empty Meal Draft after a previous meal was logged', async () => {
  const user = userEvent.setup();
  await addChickenAndOatsToBreakfast(user);
  await logMealDraft(user, 'Breakfast');
  await waitFor(() =>
    expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument(),
  );

  await clickAddMeal(user, 'Lunch');

  const lunchTray = await findTray('Lunch');
  expect(within(lunchTray).getByText('0')).toBeVisible();
  expect(lunchTray).toHaveTextContent('Tap ⊕ to add a food');
});

test('the back arrow returns from a product to an empty search with the Meal Draft unchanged', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await addFoundProduct(user, 'oat', 'Oats');
  await openFoundProduct(user, 'chick', 'Chicken');
  await findQuantityField();
  await user.keyboard('200');

  await user.click(screen.getByRole('button', { name: 'Back' }));

  expect(await findSearchField()).toHaveValue('');
  const tray = await findTray('Breakfast');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(within(tray).getByText('379 kcal')).toBeVisible();
});

test('the back arrow leaves the keyboard alone', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await openFoundProduct(user, 'chick', 'Chicken');
  await findQuantityField();
  const backButton = screen.getByRole('button', { name: 'Back' });
  const focusedDuringTap = captureFocusDuring('click');

  await user.click(backButton);

  expect(focusedDuringTap()).toBe(backButton);
  await findSearchField();
});

test('the full-size picked photo stays available until the recognition screen is left', async () => {
  const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);

  await user.click(await screen.findByRole('button', { name: 'Create' }));

  expect(revokeObjectURL).not.toHaveBeenCalled();
  await findSearchField();
  await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledTimes(1));
});

test('searching again after picking a product stays in the flow without asking', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await addFoundProduct(user, 'chick', 'Chicken');

  const foundProducts = await searchProducts(user, 'oat');

  expect(await within(foundProducts).findByText('Oats')).toBeVisible();
  expect(window.location.hash).toBe('#/log/food?q=oat');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('going forward to the product form while the saved product loads opens it with the saved values', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await openFoundProduct(user, 'chick', 'Chicken');
  await user.click(await screen.findByRole('button', { name: /edit product/i }));
  await replaceFieldValue(
    user,
    await screen.findByRole('textbox', { name: 'Default quantity, g' }),
    '123',
  );
  const { promise: released, resolve: releaseProductFetch } = Promise.withResolvers<void>();
  // The held request falls through to the default product handler once released
  server.use(
    http.get(
      `${API_URL}/api/v1/products/:id`,
      async () => {
        await released;
      },
      { once: true },
    ),
  );
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('heading', { name: 'Product' });

  await moveThroughBrowserHistory(() => window.history.forward());

  expect(await screen.findByRole('heading', { name: /edit product/i })).toBeVisible();
  expect(screen.queryByRole('textbox', { name: 'Default quantity, g' })).not.toBeInTheDocument();
  releaseProductFetch();
  expect(await screen.findByRole('textbox', { name: 'Default quantity, g' })).toHaveValue('123');
});

test('going forward to the recognition screen after Create lands on the search instead', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await user.click(await screen.findByRole('button', { name: 'Create' }));
  await findSearchField();

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Recognize product' })).not.toBeInTheDocument();
});

test('going forward to the recognition screen after a failed recognition lands on the search with no second request', async () => {
  const user = userEvent.setup();
  let requestsSent = 0;
  server.use(
    http.post(`${API_URL}/api/v1/notes/recognitions`, () => {
      requestsSent += 1;
      return HttpResponse.json({}, { status: 500 });
    }),
  );
  await openBreakfastSearch(user);
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await screen.findByRole('alert');
  await user.click(screen.getByRole('button', { name: 'Back' }));
  await findSearchField();

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(requestsSent).toBe(1);
});

test('leaving while recognition runs aborts it, and going forward lands on the search with no second request', async () => {
  const user = userEvent.setup();
  const requestsSent: Request[] = [];
  server.use(
    http.post(`${API_URL}/api/v1/notes/recognitions`, async ({ request }) => {
      requestsSent.push(request);
      await delay('infinite');
    }),
  );
  await openBreakfastSearch(user);
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await screen.findByRole('progressbar', { name: 'Recognizing product' });

  await user.click(screen.getByRole('button', { name: 'Back' }));
  await findSearchField();

  await waitFor(() => expect(requestsSent[0]?.signal.aborted).toBe(true));

  await moveThroughBrowserHistory(() => window.history.forward());

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(requestsSent).toHaveLength(1);
});

test.each([
  {
    leaving: 'logging the Meal Draft',
    leave: async (user: UserEvent) => {
      await logMealDraft(user, 'Breakfast');
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
  await openBreakfastSearch(user);
  await addFoundProduct(user, 'chick', 'Chicken');
  await pickPhotosForRecognition(user, ['Yogurt.jpg']);
  await screen.findByRole('alert');
  await user.click(screen.getByRole('button', { name: 'Back' }));
  await findSearchField();
  await leave(user);
  await findDayPage();
  await clickAddMeal(user, 'Breakfast');
  await findSearchField();

  await moveThroughBrowserHistory(() => {
    window.location.hash = '#/log/food/recognition';
  });

  await waitFor(() => expect(window.location.hash).toBe('#/log/food'));
  expect(await findSearchField()).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Recognize product' })).not.toBeInTheDocument();
});

test('opening the search screen with no Meal Draft lands on the day page', async () => {
  await renderApp('/log/food?q=chicken', { signedIn: true });

  expect(await findDayPage()).toBeVisible();
  expect(screen.queryByRole('searchbox', { name: 'Search products' })).not.toBeInTheDocument();
});

test('typing in the search does not re-check the auth status', async () => {
  const user = userEvent.setup();
  await openBreakfastSearch(user);
  const searchField = await findSearchField();

  const authStatusRequests: string[] = [];
  const recordAuthStatusRequest = ({ request }: { request: Request }): void => {
    if (request.url === `${API_URL}/api/v1/auth/status`) {
      authStatusRequests.push(request.url);
    }
  };
  server.events.on('request:start', recordAuthStatusRequest);
  onTestFinished(() => {
    server.events.removeListener('request:start', recordAuthStatusRequest);
  });

  await user.type(searchField, 'oat');

  expect(await screen.findByRole('list', { name: 'Found products' })).toBeVisible();
  await waitFor(() => expect(window.location.hash).toBe('#/log/food?q=oat'));
  expect(authStatusRequests).toStrictEqual<string[]>([]);
});

test('Add breakfast focuses a text input during the tap, then hands the focus to the search field', async () => {
  const user = userEvent.setup();
  await openDayPage();
  const focusedDuringTap = captureFocusDuring('click');

  await clickAddMeal(user, 'Breakfast');

  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(await findSearchField()).toHaveFocus();
  expect(focusedDuringTap()).not.toBeInTheDocument();
});
