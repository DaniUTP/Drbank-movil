import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import type { CompleteSmartReviewPosttestRequestDTO, CompleteSmartReviewPosttestResponseDTO, CompleteSmartReviewPretestRequestDTO, CompleteSmartReviewPretestResponseDTO, CompleteSmartReviewRequestDTO, CompleteSmartReviewResponseDTO, SmartReviewBlocksRequestDTO, SmartReviewBlocksStatusResponseDTO, SmartReviewDueQuestionsRequestDTO, SmartReviewDueQuestionsResponseDTO, SmartReviewDueResponseDTO, SmartReviewExamHistoryRequestDTO, SmartReviewExamHistoryResponseDTO, SmartReviewPretestHistoryResponseDTO, SmartReviewPretestResponseDTO, SmartReviewThemeResponseDTO, SmartReviewThemesRequestDTO } from "@/types/adaptiveReview/smart-review-theme.dto";
import {
  mergeSmartReviewDueResponses,
  normalizeSmartReviewBlocks,
  normalizeSmartReviewDueQuestions,
} from "./smart-review.transforms";
import {
  generateSmartReviewPretestQuery,
  getSmartReviewPosttestQuery,
} from "./smart-review.query-functions";

export const smartReviewSlice = api.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    smartReviewBlocks: builder.query<SmartReviewBlocksStatusResponseDTO, void>({
      providesTags: [TagTypes.SmartReviewBlocks],
      query: () => ({
        url: "/smart-review/blocks",
        method: "GET",
      }),
      transformResponse: normalizeSmartReviewBlocks,
    }),
    smartReviewPretests: builder.query<SmartReviewPretestHistoryResponseDTO, number>({
      providesTags: [TagTypes.SmartReviewBlocks],
      query: idStudyBlock => ({
        url: `/smart-review/blocks/${idStudyBlock}/pretests`,
        method: "GET",
      }),
    }),
    smartReviewReviews: builder.query<SmartReviewExamHistoryResponseDTO, SmartReviewExamHistoryRequestDTO>({
      providesTags: [TagTypes.SmartReviewBlocks],
      query: ({ idStudyBlock, page = 1, limit = 100 }) => ({
        url: `/smart-review/blocks/${idStudyBlock}/reviews`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    smartReviewPosttestsHistory: builder.query<SmartReviewExamHistoryResponseDTO, SmartReviewExamHistoryRequestDTO>({
      providesTags: [TagTypes.SmartReviewBlocks],
      query: ({ idStudyBlock, page = 1, limit = 100 }) => ({
        url: `/smart-review/blocks/${idStudyBlock}/posttests`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    smartReviewDue: builder.query<SmartReviewDueResponseDTO, number>({
      providesTags: [TagTypes.SmartReviewDue],
      query: idStudyBlock => ({
        url: "/smart-review/due",
        method: "GET",
        params: { id_study_block: idStudyBlock },
      }),
    }),
    smartReviewDueAll: builder.query<SmartReviewDueResponseDTO, number[]>({
      providesTags: [TagTypes.SmartReviewDue],
      async queryFn(idStudyBlocks, _queryApi, _extraOptions, baseQuery) {
        const results = await Promise.all(idStudyBlocks.map(idStudyBlock => baseQuery({
          url: "/smart-review/due",
          method: "GET",
          params: { id_study_block: idStudyBlock },
        })));
        const failedResult = results.find(result => result.error);
        if (failedResult?.error) return { error: failedResult.error };

        const responses = results.map(result => result.data as SmartReviewDueResponseDTO);
        return { data: mergeSmartReviewDueResponses(responses) };
      },
    }),
    smartReviewDueQuestions: builder.query<SmartReviewDueQuestionsResponseDTO, SmartReviewDueQuestionsRequestDTO>({
      query: params => ({
        url: "/smart-review/due/questions",
        method: "GET",
        params,
      }),
      transformResponse: normalizeSmartReviewDueQuestions,
    }),
    smartReviewThemes: builder.query<SmartReviewThemeResponseDTO[], SmartReviewThemesRequestDTO>({
      providesTags: [TagTypes.SmartReviewThemes],
      query: params => ({
        url: "/smart-review/themes",
        method: "GET",
        params,
      }),
    }),
    createSmartReviewBlocks: builder.mutation<number, SmartReviewBlocksRequestDTO>({
      invalidatesTags: [TagTypes.SmartReviewBlocks],
      query: body => {
        return {
          url: "/smart-review/blocks",
          method: "POST",
          body,
        };
      },
    }),
    deleteSmartReviewBlock: builder.mutation<void, number>({
      invalidatesTags: [TagTypes.SmartReviewBlocks, TagTypes.SmartReviewDue],
      query: idStudyBlock => ({
        url: `/smart-review/blocks/${idStudyBlock}`,
        method: "DELETE",
      }),
    }),
    generateSmartReviewPretest: builder.mutation<SmartReviewPretestResponseDTO, number>({
      queryFn: (idStudyBlock, _queryApi, _extraOptions, baseQuery) =>
        generateSmartReviewPretestQuery(idStudyBlock, baseQuery),
    }),
    smartReviewPosttest: builder.query<SmartReviewPretestResponseDTO, number>({
      queryFn: (idStudyBlock, _queryApi, _extraOptions, baseQuery) =>
        getSmartReviewPosttestQuery(idStudyBlock, baseQuery),
    }),
    completeSmartReviewPretest: builder.mutation<CompleteSmartReviewPretestResponseDTO, { idStudyBlock: number; body: CompleteSmartReviewPretestRequestDTO }>({
      invalidatesTags: [TagTypes.SmartReviewBlocks],
      query: ({ idStudyBlock, body }) => {
        return {
          url: `/smart-review/blocks/${idStudyBlock}/pretest/complete`,
          method: "POST",
          body,
        };
      },
    }),
    completeSmartReview: builder.mutation<CompleteSmartReviewResponseDTO, CompleteSmartReviewRequestDTO>({
      invalidatesTags: [TagTypes.SmartReviewDue, TagTypes.SmartReviewBlocks],
      query: body => ({
        url: "/smart-review/review",
        method: "POST",
        body,
      }),
    }),
    completeSmartReviewPosttest: builder.mutation<CompleteSmartReviewPosttestResponseDTO, { idStudyBlock: number; body: CompleteSmartReviewPosttestRequestDTO }>({
      invalidatesTags: [TagTypes.SmartReviewDue, TagTypes.SmartReviewBlocks],
      query: ({ idStudyBlock, body }) => {
        return {
          url: `/smart-review/blocks/${idStudyBlock}/posttest/complete`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useSmartReviewThemesQuery,
  useSmartReviewBlocksQuery,
  useLazySmartReviewBlocksQuery,
  useSmartReviewPretestsQuery,
  useSmartReviewReviewsQuery,
  useSmartReviewPosttestsHistoryQuery,
  useSmartReviewDueQuery,
  useLazySmartReviewDueQuery,
  useLazySmartReviewDueAllQuery,
  useLazySmartReviewDueQuestionsQuery,
  useCreateSmartReviewBlocksMutation,
  useDeleteSmartReviewBlockMutation,
  useGenerateSmartReviewPretestMutation,
  useLazySmartReviewPosttestQuery,
  useCompleteSmartReviewPretestMutation,
  useCompleteSmartReviewMutation,
  useCompleteSmartReviewPosttestMutation,
} = smartReviewSlice;
