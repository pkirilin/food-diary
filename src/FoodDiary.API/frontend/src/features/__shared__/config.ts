const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://food-diary.azurewebsites.net'
    : 'https://localhost:5001';

export default {
  apiUrl,
};
