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
    TagTypes.QuestionByTheme,
    TagTypes.Ranking,
    TagTypes.History,
    TagTypes.ExamHistory,
    TagTypes.ChangePassword,
    TagTypes.Support,
    TagTypes.Student,
    TagTypes.Doctor,
    TagTypes.DoctorAvailability,
    TagTypes.SmartReviewThemes,
    TagTypes.SmartReviewBlocks,
    TagTypes.SmartReviewDue,
  ],
});
