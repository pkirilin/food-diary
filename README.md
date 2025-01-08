# Food Diary

[![food-diary](https://github.com/pkirilin/food-diary/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/pkirilin/food-diary/actions/workflows/build.yml)

Food Diary is a web application that helps you track your daily calorie intake and monitor weight changes with AI-powered features and cross-device accessibility.

[Live demo](https://pkirilin-food-diary-demo.netlify.app/)

## Table of contents

- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
  - [Setting up the entire app (Frontend and Backend)](#setting-up-the-entire-app-frontend-and-backend)
  - [Setting up Frontend with mocked auth and API](#setting-up-frontend-with-mocked-auth-and-api)
    - [Frontend environment variables](#frontend-environment-variables)
  - [Managing database migrations](#managing-database-migrations)
- [Copyright](#copyright)
  - [Favicon](#favicon)

## Motivation

This project was created by @pkirilin in 2018 after experiencing health issues related to obesity. Tracking calories and weight became important but time-consuming. The need for an automated solution, combined with a desire to gain practical development experience, led to the creation of Food Diary.

Food Diary serves as a free, open-source alternative to popular calorie and weight tracking apps. While not intended as a complete replacement for commercial solutions, it provides essential tracking features for health-conscious individuals seeking a simple, transparent tool to monitor their nutrition and weight progress.

## Features

- Calorie tracking
- Weight tracking
- Personal food database with products and their nutritional values
- PWA support and cross-device accessibility
- AI-powered food recognition from photos

<table style="border-collapse: collapse; border: none;">
  <tr>
    <td>
      <img src="docs/images/calorie-tracking.png" alt="calorie-tracking-screen">
    </td>
    <td>
      <img src="docs/images/weight-tracking.png" alt="weight-tracking-screen">
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/images/calorie-tracking-desktop.png" alt="calorie-tracking-desktop">
    </td>
  </tr>
</table>

## Installation

Clone the repository:

```shell
git clone https://github.com/pkirilin/food-diary.git
cd food-diary
```

Setup [Google OAuth 2.0 client](https://support.google.com/cloud/answer/6158849) you will use for sign in:

- Add Authorized JavaScript origins: <https://localhost:8080>
- Add Authorized redirect URIs: <https://localhost:8080/signin-google>

Create a copy of `.env.example` file and save it as `.env`:

```shell
cat .env.example >> .env
```

Fill your credentials, then run:

```shell
docker-compose up -d
```

Navigate to <https://localhost:8080>

## Development

### Setting up the entire app (Frontend and Backend)

Before starting, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/)
- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (8.0.100 or higher)
- [Node.js](https://nodejs.org/en) (18.16.0 or higher)
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

Fill necessary secrets:

```shell
dotnet user-secrets --project src/backend/src/FoodDiary.API set "Auth:AllowedEmails:0" "<your_email>@gmail.com"

dotnet user-secrets --project src/backend/src/FoodDiary.API set "ConnectionStrings:Default" "<your_db_connection_string>"

# Optional, used in recognize note by photo feature
dotnet user-secrets --project src/backend/src/FoodDiary.API set "Integrations:OpenAI:ApiKey" "<your_OpenAI_api_key>"
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

Navigate to <https://localhost:8080>

### Setting up Frontend with mocked auth and API

If you'd like to work on the frontend without running the backend, you can use mocked authentication and API responses.

Before starting, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en) (18.16.0 or higher)
- [yarn](https://yarnpkg.com/getting-started/install)

Navigate to the frontend directory:

```shell
cd src/frontend
```

Create local env config:

```shell
touch env.local
```

Fill `env.local` with these values:

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

#### Frontend environment variables

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
`VITE_APP_MOCK_API_RESPONSE_DELAY` | `number` | Sets delay (in milliseconds) before all mock API responses. Not used if `VITE_APP_MSW_ENABLED` is `false`

### Managing database migrations

To create a new migration, run the following command:

```shell
dotnet ef migrations add SampleMigrationName \
    -s src/backend/src/FoodDiary.API \
    -p src/backend/src/FoodDiary.Infrastructure \
    -o Migrations
```

## Copyright

### Favicon

This favicon was generated using the following graphics from Twitter Twemoji:

- Graphics Title: 1f96c.svg
- Graphics Author: Copyright 2020 Twitter, Inc and other contributors (<https://github.com/twitter/twemoji>)
- Graphics Source: <https://github.com/twitter/twemoji/blob/master/assets/svg/1f96c.svg>
- Graphics License: CC-BY 4.0 (<https://creativecommons.org/licenses/by/4.0/>)
