# Development

How to run Food Diary from source. To run a released version instead, see the [deployment guide](guide/deployment.md); its [configuration reference](guide/deployment.md#configuration-reference) lists every backend setting used below.

## Setting up the entire app (Frontend and Backend)

Before starting, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/)
- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (the version in [`src/backend/global.json`](../src/backend/global.json), or a newer 10.0 SDK)
- [Node.js](https://nodejs.org/en) (24 or higher)
- [yarn](https://yarnpkg.com/getting-started/install)

Start PostgreSQL database container:

```shell
docker run -p 5432:5432 --name postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=FoodDiary \
    -d postgres:15.1-alpine
```

*Start PgAdmin if you need it (optional):*

```shell
docker run -p 5050:80 --name pgadmin -e "PGADMIN_DEFAULT_EMAIL=name@example.com" -e "PGADMIN_DEFAULT_PASSWORD=postgres" -d dpage/pgadmin4
```

Create a Google OAuth client for local sign-in, following the [deployment guide](guide/deployment.md#set-up-google-sign-in) with authorized redirect URI: `https://localhost:8080/signin-google`

Fill necessary secrets:

```shell
dotnet user-secrets --project src/backend/src/FoodDiary.API set "Auth:AllowedEmails:0" "<your_email>@gmail.com"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "ConnectionStrings:Default" "<your_db_connection_string>"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "GoogleAuth:ClientId" "<your_google_client_id>"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "GoogleAuth:ClientSecret" "<your_google_client_secret>"

# Optional, used by AI food recognition from photos
dotnet user-secrets --project src/backend/src/FoodDiary.API set "Integrations:OpenAI:ApiKey" "<your_OpenAI_api_key>"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "Integrations:OpenAI:Model" "gpt-5.4-mini"

# Optional, runs the MCP server locally. Claude itself cannot reach localhost, see docs/guide/mcp-server.md
dotnet user-secrets --project src/backend/src/FoodDiary.API set "Mcp:Enabled" "true"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "Mcp:BaseUrl" "https://localhost:8080"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "Mcp:Clients:0:ClientId" "<your_client_id>"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "Mcp:Clients:0:ClientSecret" "<your_client_secret>"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "Mcp:Clients:0:RedirectUri" "https://claude.ai/api/mcp/auth_callback"
```

Run database migrations:

```shell
dotnet run --project src/backend/src/FoodDiary.Migrator
```

Start Web API:

```shell
dotnet run --project src/backend/src/FoodDiary.API
```

Start frontend application (in separate terminal window):

```shell
cd src/frontend
yarn start
```

Navigate to <https://localhost:8080>. In Development, the API forwards page requests to the Vite dev server on port 5173, so the whole app is served from this one address.

## Setting up Frontend with mocked auth and API

If you'd like to work on the frontend without running the backend, you can use mocked authentication and API responses.

Before starting, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en) (24 or higher)
- [yarn](https://yarnpkg.com/getting-started/install)

Navigate to the frontend directory:

```shell
cd src/frontend
```

Create local env config:

```shell
touch .env.local
```

Fill `.env.local` with these values:

```text
VITE_APP_MSW_ENABLED=true
VITE_APP_FAKE_AUTH_ENABLED=true
VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true
```

For the full list of environment variables, see the [Frontend environment variables](#frontend-environment-variables) section.

Launch the frontend application:

```shell
yarn start
```

Navigate to <http://localhost:5173>. The app will now use mocked responses for authentication and API calls.

### Frontend environment variables

The following environment variables are available for configuring the frontend:

Name                                       | Type      | Description
-------------------------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`VITE_APP_API_URL`                         | `string`  | Specifies a backend API base URL without a trim slash, e.g. `https://localhost:8080`
`VITE_APP_AUTH_CHECK_INTERVAL`             | `number`  | Specifies the auth status check interval in milliseconds to ensure that users with expired cookies will not be able to use the application without refreshing the page in the browser. Not used if `VITE_APP_FAKE_AUTH_ENABLED` is `true`
`VITE_APP_DEMO_MODE_ENABLED`               | `boolean` | Enables demo mode. In demo mode, some features related to file system or external integrations are disabled
`VITE_APP_FAKE_AUTH_ENABLED`               | `boolean` | Setups fake authentication flow without using a backend server and OAuth Identity provider. Used for local development
`VITE_APP_FAKE_AUTH_LOGIN_ON_INIT`         | `boolean` | Defines whether the user is authenticated by default when using a fake authentication flow. Used for local development
`VITE_APP_MSW_ENABLED`                     | `boolean` | Enables mockServiceWorker to intercept and mock all API requests. Used for testing or local development purposes
`VITE_APP_GOOGLE_ANALYTICS_ENABLED`        | `boolean` | Enables Google Analytics
`VITE_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID` | `string`  | Measurement (data stream) ID for Google Analytics
`VITE_APP_MOCK_API_RESPONSE_DELAY`         | `number`  | Sets delay (in milliseconds) before all mock API responses. Not used if `VITE_APP_MSW_ENABLED` is `false`

## Managing database migrations

To create a new migration, run the following command:

```shell
dotnet ef migrations add SampleMigrationName \
    -s src/backend/src/FoodDiary.API \
    -p src/backend/src/FoodDiary.Infrastructure \
    -o Migrations
```
