import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { envs } from '../../config/envs';

const getBaseQueryRN = fetchBaseQuery({
  baseUrl: envs.API_BASE_URL,
  prepareHeaders: async headers => {
    // Usar AsyncStorage en lugar de localStorage
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export default getBaseQueryRN;
