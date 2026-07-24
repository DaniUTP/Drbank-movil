import { createApi } from '@reduxjs/toolkit/query/react';
import { TagTypes } from './constants/tagTypes.constants';
import getBaseQueryRN from './helpers/getBaseQueryRN';

export const api = createApi({
  baseQuery: getBaseQueryRN,
  endpoints: () => ({}),
  reducerPath: 'api',
  tagTypes: [
    TagTypes.User,
    TagTypes.Products,
    TagTypes.Orders,
    TagTypes.Transactions,
    TagTypes.Accounts,
  ],
});
