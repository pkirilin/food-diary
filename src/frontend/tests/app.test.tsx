import { act, configure, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { noteModel } from '@/entities/note';
import { type GetAuthStatusResponse } from '@/features/auth';
import { API_URL, AUTH_CHECK_INTERVAL } from '@/shared/config';
import { renderApp } from '@tests/render';
import { notesService } from './mockApi/notes';
import { server } from './mockApi/server';

// Whole-app navigations outlast the 1 s default while the rest of the suite runs in parallel
configure({ asyncUtilTimeout: 3000 });

const seedSeptemberFoodLog = (): void => {
  notesService.create({
    date: '2023-09-15',
    mealType: noteModel.MealType.Breakfast,
    productId: 1,
    productQuantity: 100,
    displayOrder: 0,
  });
};

test('signing in from the sign-in screen lands on the diary', async () => {
  const user = userEvent.setup();
  await renderApp('/login');

  await user.click(await screen.findByRole('button', { name: /sign in/i }));

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
});

test('signing in from a signed-out deep link lands on the opened screen', async () => {
  seedSeptemberFoodLog();
  const user = userEvent.setup();
  await renderApp('/history?month=9&year=2023');

  await user.click(await screen.findByRole('button', { name: /sign in/i }));

  expect(await screen.findByRole('link', { name: /15 sep 2023/i })).toBeVisible();
  expect(screen.queryByRole('link', { name: /19 oct 2023/i })).not.toBeInTheDocument();
});

test.each(['https://example.com/', '//example.com/'])(
  'signing in ignores the return address %s and lands on the diary',
  async returnUrl => {
    const user = userEvent.setup();
    await renderApp(`/login?${new URLSearchParams({ returnUrl })}`);

    await user.click(await screen.findByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  },
);

test('the post-login screen lands on the return address', async () => {
  seedSeptemberFoodLog();
  const returnUrl = '/history?month=9&year=2023';

  await renderApp(`/post-login?${new URLSearchParams({ returnUrl })}`, { signedIn: true });

  expect(await screen.findByRole('link', { name: /15 sep 2023/i })).toBeVisible();
});

test('logging out from the drawer shows the sign-in screen', async () => {
  const user = userEvent.setup();
  await renderApp('/');

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();

  const openMenuButton = await screen.findByRole('button', { name: /open menu/i });
  await user.click(openMenuButton);

  const logoutButton = await screen.findByRole('button', { name: /logout/i });
  await user.click(logoutButton);
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});

test('an expired session shows the sign-in screen', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  onTestFinished(() => {
    vi.useRealTimers();
  });

  const user = userEvent.setup();
  await renderApp('/');

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();

  server.use(
    http.get(`${API_URL}/api/v1/auth/status`, () => {
      return HttpResponse.json<GetAuthStatusResponse>({
        isAuthenticated: false,
      });
    }),
  );

  await act(() => vi.advanceTimersByTimeAsync(AUTH_CHECK_INTERVAL));

  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});

test('opening a diary date by URL shows the Food Logs of that date', async () => {
  await renderApp('/?date=2023-10-20', { signedIn: true });

  expect(await screen.findByRole('button', { name: /20 oct 2023/i })).toBeVisible();
  const breakfast = await screen.findByRole('listitem', { name: /^breakfast/i });
  expect(await within(breakfast).findByText('Apple')).toBeVisible();
  expect(within(breakfast).getByText('Milk')).toBeVisible();
});

test('opening a History month by URL shows that month', async () => {
  seedSeptemberFoodLog();

  await renderApp('/history?month=9&year=2023', { signedIn: true });

  expect(await screen.findByRole('link', { name: /15 sep 2023/i })).toBeVisible();
  expect(screen.queryByRole('link', { name: /19 oct 2023/i })).not.toBeInTheDocument();
});

test('switching the date on the diary shows the Food Logs of the new date', async () => {
  const user = userEvent.setup();
  await renderApp('/', { signedIn: true });

  await user.click(await screen.findByRole('button', { name: /19 oct 2023/i }));
  await user.click(screen.getByRole('gridcell', { name: '20' }));
  await user.click(screen.getByRole('button', { name: /ok/i }));

  expect(await screen.findByRole('button', { name: /20 oct 2023/i })).toBeVisible();
  const breakfast = screen.getByRole('listitem', { name: /^breakfast/i });
  expect(await within(breakfast).findByText('Apple')).toBeVisible();
  expect(within(breakfast).queryByText('Beef')).not.toBeInTheDocument();
});

interface DrawerLinkCase {
  link: string;
  from: string;
  findSectionContent: () => Promise<HTMLElement>;
}

test.each<DrawerLinkCase>([
  {
    link: 'Today',
    from: '/history',
    findSectionContent: () => screen.findByRole('button', { name: /19 oct 2023/i }),
  },
  {
    link: 'History',
    from: '/',
    findSectionContent: () => screen.findByRole('link', { name: /19 oct 2023/i }),
  },
  {
    link: 'Weight',
    from: '/',
    findSectionContent: () => screen.findByRole('button', { name: 'Log weight' }),
  },
  {
    link: 'Products',
    from: '/',
    findSectionContent: () => screen.findByRole('cell', { name: 'Chocolate cake' }),
  },
  {
    link: 'Categories',
    from: '/',
    findSectionContent: () => screen.findByText('Frozen foods'),
  },
])('the $link drawer link opens its section', async ({ link, from, findSectionContent }) => {
  const user = userEvent.setup();
  await renderApp(from, { signedIn: true });

  await user.click(await screen.findByRole('button', { name: /open menu/i }));
  await user.click(screen.getByRole('link', { name: link }));

  expect(await findSectionContent()).toBeVisible();
});

test('opening sign-in while signed in lands on the diary', async () => {
  await renderApp('/login', { signedIn: true });

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
  expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
});

test('an unknown address shows "Page not found" with a link to the diary', async () => {
  const user = userEvent.setup();
  await renderApp('/no-such-screen', { signedIn: true });

  expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeVisible();

  await user.click(screen.getByRole('link', { name: /diary/i }));

  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();
});

test('a malformed History month falls back to the default month', async () => {
  await renderApp('/history?month=abc&year=2023', { signedIn: true });

  expect(await screen.findByRole('link', { name: /19 oct 2023/i })).toBeVisible();
});

interface SectionHeadingCase {
  title: string;
  url: string;
  findSectionContent: () => Promise<HTMLElement>;
}

test.each<SectionHeadingCase>([
  {
    title: 'History',
    url: '/history',
    findSectionContent: () => screen.findByRole('link', { name: /19 oct 2023/i }),
  },
  {
    title: 'Weight',
    url: '/weight',
    findSectionContent: () => screen.findByRole('button', { name: 'Log weight' }),
  },
  {
    title: 'Products',
    url: '/products',
    findSectionContent: () => screen.findByRole('cell', { name: 'Chocolate cake' }),
  },
  {
    title: 'Categories',
    url: '/categories',
    findSectionContent: () => screen.findByText('Frozen foods'),
  },
])(
  '$title shows its title once, as the only top-level heading',
  async ({ title, url, findSectionContent }) => {
    await renderApp(url, { signedIn: true });

    expect(await findSectionContent()).toBeVisible();
    const topLevelHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(topLevelHeadings).toHaveLength(1);
    expect(topLevelHeadings[0]).toHaveAccessibleName(title);
    expect(screen.getAllByRole('heading', { name: title })).toHaveLength(1);
  },
);

test("the diary's top-level heading names the selected date", async () => {
  await renderApp('/?date=2023-10-20', { signedIn: true });

  expect(await screen.findByRole('heading', { level: 1, name: /20 oct 2023/i })).toBeVisible();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
});
