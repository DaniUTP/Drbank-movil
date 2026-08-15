import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { envs } from '../../config/envs';

const baseQuery = fetchBaseQuery({
  baseUrl: envs.API_BASE_URL,
  prepareHeaders: async (headers) => {
    // Ensure headers is not undefined
    if (!headers) {
      headers = new Headers();
    }

    // Check token expiration
    const expiration = await AsyncStorage.getItem('token_expiration');
    if (expiration) {
      const expirationDate = new Date(expiration);
      const now = new Date();
      
      // If token is expired, remove it
      if (now > expirationDate) {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('token_expiration');
        headers.set('Content-Type', 'application/json');
        return headers;
      }
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

const getBaseQueryRN: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 error - try to refresh token
  if (result.error && result.error.status === 401) {
    try {
      // Attempt to refresh the token using direct fetch
      const refreshResponse = await fetch(`${envs.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        
        // Store the new token
        await AsyncStorage.setItem('access_token', refreshData.access_token);
        
        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('token_expiration');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear tokens on error
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('token_expiration');
    }
  }

  return result;
};

export default getBaseQueryRN;
