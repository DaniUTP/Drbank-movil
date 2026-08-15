import { createApi } from '@reduxjs/toolkit/query/react';
import { TagTypes } from './constants/tagTypes.constants';
import getBaseQueryRN from './helpers/getBaseQueryRN';

export const api = createApi({
  baseQuery: getBaseQueryRN,
  endpoints: () => ({}),
  reducerPath: 'api',
  tagTypes: [
    TagTypes.Profile,
    TagTypes.Area,
    TagTypes.ExamType,
    TagTypes.Year,
    TagTypes.Specialty,
    TagTypes.Theme,
    TagTypes.Question,
    TagTypes.QuestionByYear,
    TagTypes.QuestionByTheme,
    TagTypes.Ranking,
    TagTypes.ChangePassword,
    TagTypes.Support,
    TagTypes.StudentProgress
  ],
});
