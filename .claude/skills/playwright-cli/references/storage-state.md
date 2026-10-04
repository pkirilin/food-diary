# Storage Management

Manage cookies, localStorage, sessionStorage, and browser storage state.

## Storage State

Save and restore complete browser state including cookies and storage.

### Save Storage State

```bash
# Save to auto-generated filename (storage-state-{timestamp}.json)
yarn playwright-cli state-save

# Save to specific filename
yarn playwright-cli state-save my-auth-state.json
```

### Restore Storage State

```bash
# Load storage state from file
yarn playwright-cli state-load my-auth-state.json

# Reload page to apply cookies
yarn playwright-cli open https://example.com
```

### Storage State File Format

The saved file contains:

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "expires": 1893456000,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://example.com",
      "localStorage": [
        { "name": "theme", "value": "dark" },
        { "name": "user_id", "value": "12345" }
      ]
    }
  ]
}
```

## Cookies

### List All Cookies

```bash
yarn playwright-cli cookie-list
```

### Filter Cookies by Domain

```bash
yarn playwright-cli cookie-list --domain=example.com
```

### Filter Cookies by Path

```bash
yarn playwright-cli cookie-list --path=/api
```

### Get Specific Cookie

```bash
yarn playwright-cli cookie-get session_id
```

### Set a Cookie

```bash
# Basic cookie
yarn playwright-cli cookie-set session abc123

# Cookie with options
yarn playwright-cli cookie-set session abc123 --domain=example.com --path=/ --httpOnly --secure --sameSite=Lax

# Cookie with expiration (Unix timestamp)
yarn playwright-cli cookie-set remember_me token123 --expires=1893456000
```

### Delete a Cookie

```bash
yarn playwright-cli cookie-delete session_id
```

### Clear All Cookies

```bash
yarn playwright-cli cookie-clear
```

### Advanced: Multiple Cookies or Custom Options

For complex scenarios like adding multiple cookies at once, use `run-code`:

```bash
yarn playwright-cli run-code "async page => {
  await page.context().addCookies([
    { name: 'session_id', value: 'sess_abc123', domain: 'example.com', path: '/', httpOnly: true },
    { name: 'preferences', value: JSON.stringify({ theme: 'dark' }), domain: 'example.com', path: '/' }
  ]);
}"
```

## Local Storage

### List All localStorage Items

```bash
yarn playwright-cli localstorage-list
```

### Get Single Value

```bash
yarn playwright-cli localstorage-get token
```

### Set Value

```bash
yarn playwright-cli localstorage-set theme dark
```

### Set JSON Value

```bash
yarn playwright-cli localstorage-set user_settings '{"theme":"dark","language":"en"}'
```

### Delete Single Item

```bash
yarn playwright-cli localstorage-delete token
```

### Clear All localStorage

```bash
yarn playwright-cli localstorage-clear
```

### Advanced: Multiple Operations

For complex scenarios like setting multiple values at once, use `run-code`:

```bash
yarn playwright-cli run-code "async page => {
  await page.evaluate(() => {
    localStorage.setItem('token', 'jwt_abc123');
    localStorage.setItem('user_id', '12345');
    localStorage.setItem('expires_at', Date.now() + 3600000);
  });
}"
```

## Session Storage

### List All sessionStorage Items

```bash
yarn playwright-cli sessionstorage-list
```

### Get Single Value

```bash
yarn playwright-cli sessionstorage-get form_data
```

### Set Value

```bash
yarn playwright-cli sessionstorage-set step 3
```

### Delete Single Item

```bash
yarn playwright-cli sessionstorage-delete step
```

### Clear sessionStorage

```bash
yarn playwright-cli sessionstorage-clear
```

## IndexedDB

### List Databases

```bash
yarn playwright-cli run-code "async page => {
  return await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases;
  });
}"
```

### Delete Database

```bash
yarn playwright-cli run-code "async page => {
  await page.evaluate(() => {
    indexedDB.deleteDatabase('myDatabase');
  });
}"
```

## Common Patterns

### Authentication State Reuse

```bash
# Step 1: Login and save state
yarn playwright-cli open https://app.example.com/login
yarn playwright-cli snapshot
yarn playwright-cli fill e1 "user@example.com"
yarn playwright-cli fill e2 "password123"
yarn playwright-cli click e3

# Save the authenticated state
yarn playwright-cli state-save auth.json

# Step 2: Later, restore state and skip login
yarn playwright-cli state-load auth.json
yarn playwright-cli open https://app.example.com/dashboard
# Already logged in!
```

### Save and Restore Roundtrip

```bash
# Set up authentication state
yarn playwright-cli open https://example.com
yarn playwright-cli eval "() => { document.cookie = 'session=abc123'; localStorage.setItem('user', 'john'); }"

# Save state to file
yarn playwright-cli state-save my-session.json

# ... later, in a new session ...

# Restore state
yarn playwright-cli state-load my-session.json
yarn playwright-cli open https://example.com
# Cookies and localStorage are restored!
```

## Security Notes

- Never commit storage state files containing auth tokens
- Add `*.auth-state.json` to `.gitignore`
- Delete state files after automation completes
- Use environment variables for sensitive data
- By default, sessions run in-memory mode which is safer for sensitive operations
