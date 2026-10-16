import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type DbMcpConsentRequest } from '@tests/mockApi/db';
import { mcpConsentService } from '@tests/mockApi/mcpConsent';
import { render } from '@tests/render';
import { McpConsentPage } from './McpConsentPage';

type Redirect = (url: string) => void;

const EXPIRED_MESSAGE = 'This request has expired; start again from your MCP Client.';

const givenConsentRequest = (overrides: Partial<Omit<DbMcpConsentRequest, 'id'>> = {}): string =>
  mcpConsentService.create({
    clientName: 'ChatBox',
    logoUri: null,
    clientId: 'https://chatboxai.app/.well-known/oauth-client',
    redirectUri: 'http://127.0.0.1:1456/callback',
    isLocalhostOnly: true,
    ...overrides,
  });

test('the owner sees which MCP Client asks for access and what it can do', async () => {
  const consentRequest = givenConsentRequest();

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);

  expect(await screen.findByRole('heading', { name: 'ChatBox' })).toBeVisible();
  expect(screen.getByText(/^identified by/i)).toHaveTextContent('Identified by chatboxai.app');
  expect(screen.getByText(/^receives access on/i)).toHaveTextContent(
    'Receives access on 127.0.0.1',
  );
  expect(screen.getByText(/will be able to view/i)).toHaveTextContent(
    'ChatBox will be able to view your food logs and products, but not change them.',
  );
});

test('the owner sees the MCP Client logo without sending it the page address', async () => {
  const consentRequest = givenConsentRequest({ logoUri: 'https://chatboxai.app/logo.png' });

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);

  const logo = await screen.findByRole('img', { name: 'ChatBox logo' });
  expect(logo).toHaveAttribute('src', 'https://chatboxai.app/logo.png');
  expect(logo).toHaveAttribute('referrerpolicy', 'no-referrer');
});

test('the owner sees the first letter of the MCP Client name when it has no logo', async () => {
  const consentRequest = givenConsentRequest({ logoUri: null });

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);

  expect(await screen.findByRole('img', { name: 'ChatBox logo' })).toHaveTextContent(/^C$/);
});

test('the owner sees the first letter of the MCP Client name when its logo fails to load', async () => {
  const consentRequest = givenConsentRequest({ logoUri: 'https://chatboxai.app/logo.png' });

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);
  fireEvent.error(await screen.findByRole('img', { name: 'ChatBox logo' }));

  expect(screen.getByRole('img', { name: 'ChatBox logo' })).toHaveTextContent(/^C$/);
});

test('the owner is warned when the MCP Client receives access only on their computer', async () => {
  const consentRequest = givenConsentRequest({ isLocalhostOnly: true });

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'This app receives access on this computer. Approve only if you started this sign-in.',
  );
});

test('the owner is not warned when the MCP Client receives access on another host', async () => {
  const consentRequest = givenConsentRequest({
    redirectUri: 'https://chatboxai.app/callback',
    isLocalhostOnly: false,
  });

  await render(<McpConsentPage consentRequest={consentRequest} redirect={vi.fn<Redirect>()} />);

  expect(await screen.findByRole('heading', { name: 'ChatBox' })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('approving sends the owner back to the MCP Client with an authorization code', async () => {
  const user = userEvent.setup();
  const redirect = vi.fn<Redirect>();
  const consentRequest = givenConsentRequest();

  await render(<McpConsentPage consentRequest={consentRequest} redirect={redirect} />);
  await user.click(await screen.findByRole('button', { name: 'Approve' }));

  await waitFor(() => {
    expect(redirect).toHaveBeenCalledExactlyOnceWith(
      'http://127.0.0.1:1456/callback?code=fake-authorization-code',
    );
  });
});

test('denying sends the owner back to the MCP Client with access denied', async () => {
  const user = userEvent.setup();
  const redirect = vi.fn<Redirect>();
  const consentRequest = givenConsentRequest();

  await render(<McpConsentPage consentRequest={consentRequest} redirect={redirect} />);
  await user.click(await screen.findByRole('button', { name: 'Deny' }));

  await waitFor(() => {
    expect(redirect).toHaveBeenCalledExactlyOnceWith(
      'http://127.0.0.1:1456/callback?error=access_denied',
    );
  });
});

test('the owner cannot decide again once a decision is sent', async () => {
  const user = userEvent.setup();
  const redirect = vi.fn<Redirect>();
  const consentRequest = givenConsentRequest();

  await render(<McpConsentPage consentRequest={consentRequest} redirect={redirect} />);
  await user.click(await screen.findByRole('button', { name: 'Approve' }));
  await waitFor(() => {
    expect(redirect).toHaveBeenCalledOnce();
  });

  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Deny' })).toBeDisabled();
});

test('the owner is told to start again when the consent request has expired', async () => {
  await render(
    <McpConsentPage consentRequest="expired-consent-request" redirect={vi.fn<Redirect>()} />,
  );

  expect(await screen.findByText(EXPIRED_MESSAGE)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
});

test('the owner is told to start again when the consent request was already decided', async () => {
  const user = userEvent.setup();
  const redirect = vi.fn<Redirect>();
  const consentRequest = givenConsentRequest();

  await render(<McpConsentPage consentRequest={consentRequest} redirect={redirect} />);
  const approve = await screen.findByRole('button', { name: 'Approve' });
  mcpConsentService.redeem(consentRequest);
  await user.click(approve);

  expect(await screen.findByText(EXPIRED_MESSAGE)).toBeVisible();
  expect(redirect).not.toHaveBeenCalled();
});
