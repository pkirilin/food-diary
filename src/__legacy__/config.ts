/**
 * Represents application settings
 */
export interface AppConfig {
  apiUrl: string;
}

/**
 * Gets app config based on the environment
 */
const getAppConfig = (): AppConfig => {
  let apiUrl: string;

  switch (process.env.NODE_ENV) {
    case 'production':
      apiUrl = 'http://localhost:5000';
      break;
    default:
      apiUrl = 'http://localhost:5000';
      break;
  }

  return {
    apiUrl,
  };
};

export const { apiUrl: API_URL } = getAppConfig();
