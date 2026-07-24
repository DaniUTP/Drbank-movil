// Configuración de variables de entorno
// Para React Native con Expo, usa Constants.expoConfig.extra o process.env
// Firebase se configura automáticamente desde google-services.json

import Constants from 'expo-constants';

// Variables de entorno desde .env o Constants
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Prioridad: Constants.expoConfig.extra > process.env > defaultValue
  const fromConstants = Constants.expoConfig?.extra?.[key];
  if (fromConstants) return fromConstants as string;

  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;

  if (defaultValue) return defaultValue;

  throw new Error(`Environment variable ${key} is not defined`);
};

export const envs = {
  // API Configuration
  API_BASE_URL: getEnvVar('API_BASE_URL'),
  API_TIMEOUT: getEnvVar('API_TIMEOUT', '30000'),

  // App Configuration
  APP_NAME: getEnvVar('APP_NAME', 'DrBank Mobile'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),

  // Feature Flags
  ENABLE_ANALYTICS: getEnvVar('ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_CRASH_REPORTING: getEnvVar('ENABLE_CRASH_REPORTING', 'false') === 'true',
};

export default envs;
