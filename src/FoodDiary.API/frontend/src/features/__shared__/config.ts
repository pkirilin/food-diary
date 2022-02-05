const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://food-diary-webapp.herokuapp.com'
    : 'https://localhost:5001';

export default {
  apiUrl,
};
