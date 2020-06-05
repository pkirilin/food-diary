# food-diary-client

![Check food-diary-client](https://github.com/pkirilin/food-diary-client/workflows/Check%20food-diary-client/badge.svg?branch=master)

**food-diary-client** is the client part of [food-diary](https://github.com/pkirilin/food-diary) application.
It is written on React & Redux.

The application is divided into 3 sections:

- **Pages**: manages diary pages with notes about eaten products and their quantities, displays calories count for day/meal/product
- **Products**: manages products info used in notes
- **Categories**: groups products by categories and manages those categories

## Running the application

For correct application work, both client and server parts should be started. Server part is containerized and can be launched with Docker.

Requirements:

- Node.js
- _Docker (optional)_

Run server-side containers (API and database):

```shell
.\StartBackend.ps1
```

or

```shell
sh StartBackend.sh
```

Stop and remove server-side containers:

```shell
.\StopBackend.ps1
```

or

```shell
sh StopBackend.sh
```

_It is supposed that started API container can be accessed at localhost. If not, **apiUrl** property should be changed in **src/config.ts**_.

Server part can also be [started locally](https://github.com/pkirilin/food-diary-server), without using docker.

Run client app:

```shell
npm install
npm run start
```

After that, client app should be available at <http://localhost:3000>.
