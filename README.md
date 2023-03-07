# food-diary

[![food-diary](https://github.com/pkirilin/food-diary/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/pkirilin/food-diary/actions/workflows/build.yml)

## Introduction

**food-diary** is a web application for tracking calories count for meals eaten daily. It represents an interactive diary, which is able to record notes about products and their quantities and calculate calories for each note (or group of notes) recorded.

## Main idea and goal

The diary consists of **pages**. Each page is associated with some date and contains **notes** grouped by meal types (_breakfast, lunch etc._). Note contains information about **product** and its quantity. Products are grouped by **categories**. Each product has _name_ and _calories cost_ per 100 g of product's quantity recorded. Using this information the application is capable of calculating calories count of:

- single note
- notes group (e.g. for specific meal type)
- the entire page.

This information can be extremely useful for people who want to keep track of energy value of meals they eat every day.

## Local start

1. Start PostgreSQL database:

    ```shell
    docker run -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=postgres -e -d postgres:12.2-alpine
    ```

    _Optional_: PgAdmin can be started like this:

    ```shell
    docker run -p 5050:80 --name pgadmin -e "PGADMIN_DEFAULT_EMAIL=name@example.com" -e "PGADMIN_DEFAULT_PASSWORD=postgres" -d dpage/pgadmin4
    ```

1. Install .NET SDK 6.0.302 or higher

1. Install Node.js 18.6.x or higher

1. Install [yarn](https://yarnpkg.com/getting-started/install) package manager

1. Fill necessary secrets:

    ```shell
    dotnet user-secrets --project src/FoodDiary.API set "Auth:AllowedEmails:0" "<your_email>"
    ```

    _Allowed email should be compatible with Google Identity Provider_

1. Run migrations:

    ```shell
    dotnet run --project src/FoodDiary.Migrator
    ```

1. Start backend application:

    ```shell
    dotnet run --project src/FoodDiary.API
    ```

1. Start frontend application:

    ```shell
    cd src/FoodDiary.API/frontend
    yarn start
    ```

1. Navigate to <https://localhost:5001>

## How to run frontend without backend

Go to frontend project directory:

```shell
cd src/FoodDiary.API/frontend
```

Create local env config:

```shell
touch env.local
```

Fill `env.local` with this values:

```text
REACT_APP_MSW_ENABLED=true
REACT_APP_AUTH_CHECK_INTERVAL=50000000
WDS_SOCKET_PORT=3000
```

- `REACT_APP_MSW_ENABLED`: enables mockServiceWorker to intercept and mock all API requests
- `REACT_APP_AUTH_CHECK_INTERVAL`: sets auth status check interval in milliseconds (set higher value to not get constantly logged out while developing app)
- `WDS_SOCKET_PORT`: sets local server port for hot reload

## How to generate database migrations

```shell
dotnet ef migrations add <migration_name> \                 
-s src/FoodDiary.API \
-p src/FoodDiary.Infrastructure
```
