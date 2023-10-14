const apiUrl = import.meta.env.PROD
  ? 'https://food-diary.azurewebsites.net'
  : 'https://localhost:5001';

export default {
  apiUrl,
};
