# food-diary-server

![Check food-diary-server](https://github.com/pkirilin/food-diary-server/workflows/Check%20food-diary-server/badge.svg?branch=master)

**food-diary-server** is the server part of [food-diary](https://github.com/pkirilin/food-diary) application. It is written on C#, ASP.NET Core (Web API) and using Entity Framework Core connected to PostgreSQL database.

## Structure

Currently, server part consists of the following projects:

| Project | Description
| --- | --- |
| FoodDiary.API | Executable web API project with API controllers, mappers and data transfer objects |
| FoodDiary.Application | Application layer project with requests and request handlers |
| FoodDiary.Domain | Domain layer project with entities, repository contracts and business logic objects |
| FoodDiary.Infrastructure | Infrastructure layer project with repositories and database context |
| FoodDiary.Import | Library for importing diary objects with import file parser and import engine |
| FoodDiary.PdfGenerator | Library for generating PDF document from diary objects. Based on PdfSharp & MigraDoc |

## Running the application

### Using .NET Core CLI

In order to run the application locally _.NET Core SDK 3.1+_ and _PostgreSQL 12_ should be installed.

Note: _ensure, that database parameters (username, password, host and port) are correct in **src/FoodDiary.API/appsettings.Development.json** inside **ConnectionStrings** section_.

Start application:

```shell
dotnet run -p src/FoodDiary.API
```

### Using docker-compose

Start application:

```shell
docker-compose build
docker-compose up -d
```

Stop application:

```shell
docker-compose down
```

Application should be available at <http://localhost:5000>.
