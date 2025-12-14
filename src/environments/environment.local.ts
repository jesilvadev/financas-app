export interface Environment {
  production: boolean;
  appName: string;
  apiBaseUrl: string;
  authProvider: 'azure' | 'none';
}

export const environment: Environment = {
  production: false,
  appName: 'OperacaoOTCApp',
  apiBaseUrl: 'https://apifinanca-production.up.railway.app/',
  authProvider: 'none',
};
