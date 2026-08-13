import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { envs } from '../../config/envs';

const getBaseQueryRN = fetchBaseQuery({
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

export default getBaseQueryRN;
