import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { envs } from '../../config/envs';

const baseQuery = fetchBaseQuery({
  baseUrl: envs.API_BASE_URL,
  timeout: Number(envs.API_TIMEOUT),
  prepareHeaders: async (headers) => {
    // Ensure headers is not undefined
    if (!headers) {
      headers = new Headers();
    }

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const HARD_REQUEST_TIMEOUT_MS = 20000;
const REFRESH_TIMEOUT_MS = 8000;
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const currentToken = await AsyncStorage.getItem('access_token');
  if (!currentToken) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  try {
    const response = await fetch(`${envs.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json() as { access_token?: string };
    if (!data.access_token) return null;
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.removeItem('token_expiration');
    return data.access_token;
  } finally {
    clearTimeout(timeout);
  }
};

const executeBaseQuery: typeof baseQuery = async (args, api, extraOptions) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(baseQuery(args, api, extraOptions)),
      new Promise<Awaited<ReturnType<typeof baseQuery>>>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve({
            error: {
              status: 'TIMEOUT_ERROR',
              error: 'La solicitud excedió el tiempo máximo de espera.',
            },
          });
        }, HARD_REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const getBaseQueryRN: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const requestUrl = typeof args === 'string' ? args : args.url;
  const isAuthRequest = requestUrl.startsWith('/auth/');
  const tokenBeforeRequest = await AsyncStorage.getItem('access_token');
  let result = await executeBaseQuery(args, api, extraOptions);

  // Only a server 401 triggers refresh; retry the original request with the new token.
  if (result.error?.status === 401 && !isAuthRequest) {
    try {
      const currentToken = await AsyncStorage.getItem('access_token');
      if (currentToken && currentToken !== tokenBeforeRequest) {
        return await executeBaseQuery(args, api, extraOptions);
      }
      if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken().finally(() => { refreshInFlight = null; });
      }
      const newToken = await refreshInFlight;
      if (newToken) {
        result = await executeBaseQuery(args, api, extraOptions);
        if (result.error?.status === 401) {
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('token_expiration');
        }
      } else {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('token_expiration');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('token_expiration');
    }
  }

  return result;
};

export default getBaseQueryRN;
