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
  return {
    apiUrl: 'http://localhost:5000',
  };
};

export const { apiUrl: API_URL } = getAppConfig();
