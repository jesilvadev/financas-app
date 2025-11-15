export interface Environment {
  production: boolean;
  appName: string;
  apiBaseUrl: string;
  authProvider: 'azure' | 'none';
}

export const environment: Environment = {
  production: false,
  appName: 'OperacaoOTCApp',
  apiBaseUrl: 'http://localhost:8080/',
  authProvider: 'none',
};