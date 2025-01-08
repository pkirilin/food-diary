# Food Diary

[![food-diary](https://github.com/pkirilin/food-diary/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/pkirilin/food-diary/actions/workflows/build.yml)

Food Diary is a web application that helps you track your daily calorie intake and monitor weight changes with AI-powered features and cross-device accessibility.

## [Live demo](https://pkirilin-food-diary-demo.netlify.app/)

## Table of contents

<!-- links for easy navigation between sections... -->

## Motivation

This project was created by @pkirilin in 2018 after experiencing health issues related to obesity. Tracking calories and weight became important but time-consuming. The need for an automated solution, combined with a desire to gain practical development experience, led to the creation of Food Diary.

Food Diary serves as a free, open-source alternative to popular calorie and weight tracking apps. While not intended as a complete replacement for commercial solutions, it provides essential tracking features for health-conscious individuals seeking a simple, transparent tool to monitor their nutrition and weight progress.

## Features

<!-- - tracking calories
- tracking weight
- add notes from photo using AI features
- PWA support (can be used on any device, both desktop and mobile)
- {more features...} -->

## Screenshots

<!-- ... -->

## Installation

<!-- How to setup and deploy the application -->

### Docker

<!-- ... -->

### docker-compose

<!-- ... -->

## Development

<!-- Tech stack overview -->

<!-- Repository structure

- Backend app
- Frontend app
- e2e tests -->

<!-- {any useful technical documentation for developers...} -->

## Contribute

## Support

<!-- Developer contacts (email, telegram) for support in case of any issues, suggestions questions, or feedback -->

## License

<!-- =========OLD README========= -->

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
