const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://food-diary.azurewebsites.net'
    : 'https://localhost:5001';

const googleClientId = '772368064111-19hqh3c6ksu56ke45nm24etn7qoma88v.apps.googleusercontent.com';

export default {
  apiUrl,
  googleClientId,
};
