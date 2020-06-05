# food-diary

![Check food-diary-client](https://github.com/pkirilin/food-diary-client/workflows/Check%20food-diary-client/badge.svg?branch=master) ![Check food-diary-server](https://github.com/pkirilin/food-diary-server/workflows/Check%20food-diary-server/badge.svg?branch=master)

## Introduction

**food-diary** is a web application for tracking calories count for meals eaten daily. It represents an interactive diary, which is able to record notes about products and their quantities and calculate calories for each note (or group of notes) recorded.

The application consists of [client](https://github.com/pkirilin/food-diary-client) and [server](https://github.com/pkirilin/food-diary-server) parts, which are located in separate repositories. This repository contains only general information about the project.

## Main idea and goal

The diary consists of **pages**. Each page is associated with some date and contains **notes** grouped by meal types (_breakfast, lunch etc._). Note contains information about **product** and its quantity. Products are grouped by **categories**. Each product has _name_ and _calories cost_ per 100 g of product's quantity recorded. Using this information the application is capable of calculating calories count of:

- single note
- notes group (e.g. for specific meal type)
- the entire page.

This information can be extremely useful for people who want to keep track of energy value of meals they eat every day.

## Running the application

In order to run the application, both client and server parts should be started. Both client and server parts are dockerized and can be launched using docker-compose:

```shell
docker-compose pull
docker-compose up -d
```

Stop application:

```shell
docker-compose down
```

Note: _It is supposed, that containers can be accessed from localhost, and ports 3000 and 5000 are free_.

After that, client part should be accessible at <http://localhost:3000> and server part - at <http://localhost:5000>.
