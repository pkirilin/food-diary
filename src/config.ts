export interface AppConfig {
  apiUrl: string;
}

const getAppConfig = (): AppConfig => {
  return {
    apiUrl: 'http://localhost:5000',
  };
};

export const { apiUrl: API_URL } = getAppConfig();
