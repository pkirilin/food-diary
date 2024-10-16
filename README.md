# food-diary

[![food-diary](https://github.com/pkirilin/food-diary/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/pkirilin/food-diary/actions/workflows/build.yml)

## Introduction

**food-diary** is a web application for tracking calories count for meals eaten daily. It represents an interactive diary, which is able to record notes about products and their quantities and calculate calories for each note (or group of notes) recorded.

## Main idea and goal

The diary is organized by dates. Each date contains **notes** that are grouped by meal types (*breakfast*, *lunch*, etc.). A note includes information about a **product** and its quantity. Products are categorized into **categories**. Each product has a name and a calorie cost per 100 g of the product's quantity recorded. Using this information, the application can calculate the calorie count of a single note or a group of notes (for a specific meal type or date).

This information can be extremely useful for people who want to keep track of the energy value of the meals they consume daily.

## Quick start (docker-compose)

1. Setup [Google OAuth 2.0 client](https://support.google.com/cloud/answer/6158849) you will use for sign in
    - Add Authorized JavaScript origins: <https://localhost:8080>
    - Add Authorized redirect URIs: <https://localhost:8080/signin-google>

2. Create a copy of `.env.example` file and save it as `.env`:

    ```shell
    cat .env.example >> .env
    ```

3. Fill your credentials, then run:

    ```shell
    docker-compose up -d
    ```

4. Navigate to <https://localhost:8080>

## Development

1. Start PostgreSQL database:

    ```shell
    docker run -p 5432:5432 --name postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=FoodDiary \
        -d postgres:15.1-alpine
    ```

    *Optional*: PgAdmin can be started like this:

    ```shell
    docker run -p 5050:80 --name pgadmin -e "PGADMIN_DEFAULT_EMAIL=name@example.com" -e "PGADMIN_DEFAULT_PASSWORD=postgres" -d dpage/pgadmin4
    ```

1. Install .NET SDK 8.0.100 or higher

1. Install Node.js 18.16.0 or higher

1. Install [yarn](https://yarnpkg.com/getting-started/install) package manager

1. Fill necessary secrets:

    ```shell
    dotnet user-secrets --project src/backend/src/FoodDiary.API set "Auth:AllowedEmails:0" "<your_email>"

    dotnet user-secrets --project src/backend/src/FoodDiary.API set "ConnectionStrings:Default" "<your_db_connection_string>"

    # Optional, used in recognize note by photo feature
    dotnet user-secrets --project src/backend/src/FoodDiary.API set "Integrations:OpenAI:ApiKey" "<your_OpenAI_api_key>"
    ```

    *Allowed email should be compatible with Google Identity Provider*

1. Run migrations:

    ```shell
    dotnet run --project src/backend/src/FoodDiary.Migrator
    ```

1. Start backend application:

    ```shell
    dotnet run --project src/backend/src/FoodDiary.API
    ```

1. Start frontend application:

    ```shell
    cd src/frontend
    yarn start
    ```

1. Navigate to <https://localhost:8080>

## How to run frontend without backend

Go to frontend project directory:

```shell
cd src/frontend
```

Create local env config:

```shell
touch env.local
```

Fill `env.local` with this values:

```text
VITE_APP_MSW_ENABLED=true
VITE_APP_FAKE_AUTH_ENABLED=true
VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true
```

## Frontend environment variables

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

## How to generate database migrations

```shell
dotnet ef migrations add <migration_name> \
    -s src/backend/src/FoodDiary.API \
    -p src/backend/src/FoodDiary.Infrastructure \
    -o Migrations
```

## Copyright notes

### Favicon

This favicon was generated using the following graphics from Twitter Twemoji:

- Graphics Title: 1f96c.svg
- Graphics Author: Copyright 2020 Twitter, Inc and other contributors (<https://github.com/twitter/twemoji>)
- Graphics Source: <https://github.com/twitter/twemoji/blob/master/assets/svg/1f96c.svg>
- Graphics License: CC-BY 4.0 (<https://creativecommons.org/licenses/by/4.0/>)
