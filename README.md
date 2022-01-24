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

    *Optional*: PgAdmin can be started like this:

    ```shell
    docker run -p 5050:80 --name pgadmin -e "PGADMIN_DEFAULT_EMAIL=name@example.com" -e "PGADMIN_DEFAULT_PASSWORD=postgres" -d dpage/pgadmin4
    ```

1. Install .NET SDK 6.0.100 or higher

1. Install Node.js and yarn package manager

1. Fill nessesary secrets:

    ```shell
    dotnet user-secrets --project src/FoodDiary.API set "Auth:AllowedEmails:0" "<your_email>"
    ```

    *Allowed email should be compatible with Google Identity Provider*

    ```shell
    dotnet user-secrets --project src/FoodDiary.API set "Auth:JwtSecret" "<some_strong_secret_key>"
    ```

    *Secret can be generated [here](https://passwordsgenerator.net). It should be a minimum of 128 bits (16 bytes).*

1. Start backend application:

    ```shell
    dotnet run --project src/FoodDiary.API
    ```

1. Start frontend application:

    ```shell
    cd src/FoodDiary.API/frontend
    yarn
    yarn start
    ```

1. Navigate to <https://localhost:5001>
