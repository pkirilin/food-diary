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
