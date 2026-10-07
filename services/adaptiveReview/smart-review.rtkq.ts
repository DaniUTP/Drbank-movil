import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import type { CompleteSmartReviewPosttestRequestDTO, CompleteSmartReviewPosttestResponseDTO, CompleteSmartReviewPretestRequestDTO, CompleteSmartReviewPretestResponseDTO, CompleteSmartReviewRequestDTO, CompleteSmartReviewResponseDTO, SmartReviewBlocksRequestDTO, SmartReviewBlocksStatusResponseDTO, SmartReviewDueQuestionsRequestDTO, SmartReviewDueQuestionsResponseDTO, SmartReviewDueResponseDTO, SmartReviewExamHistoryRequestDTO, SmartReviewExamHistoryResponseDTO, SmartReviewPretestHistoryResponseDTO, SmartReviewPretestResponseDTO, SmartReviewThemeResponseDTO, SmartReviewThemesRequestDTO } from "@/types/adaptiveReview/smart-review-theme.dto";

const normalizeGeneratedQuestions = (response: SmartReviewPretestResponseDTO): SmartReviewPretestResponseDTO => ({
  ...response,
  questions: (response.questions ?? []).map(question => ({
    ...question,
    id: question.id_question ?? question.question_id ?? question.id,
  })),
});

const waitForRetry = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export const smartReviewSlice = api.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    smartReviewBlocks: builder.query<SmartReviewBlocksStatusResponseDTO, void>({
      providesTags: [TagTypes.SmartReviewBlocks],
      query: () => ({
        url: "/smart-review/blocks",
        method: "GET",
      }),
      transformResponse: (response: SmartReviewBlocksStatusResponseDTO) => ({
        ...response,
        data: {
          ...response.data,
          can_select_new_themes: Boolean(response.data.can_select_new_themes),
          minimum_themes_per_selection: response.data.minimum_themes_per_selection || 4,
          maximum_themes_per_selection: response.data.maximum_themes_per_selection || 20,
          theme_selection_message: response.data.theme_selection_message ?? "",
          blocks: (response.data.blocks ?? []).map(block => ({
            ...block,
            themes: block.themes ?? [],
            exam_types: block.exam_types ?? (block.exam_type ? [block.exam_type] : []),
            exam_counts: block.exam_counts ?? { pretests: 0, reviews: 0, posttests: 0 },
          })),
        },
      }),
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
        const data = responses.reduce<SmartReviewDueResponseDTO["data"]>((aggregate, response) => ({
          total: aggregate.total + response.data.total,
          active_reviews: aggregate.active_reviews + response.data.active_reviews,
          overdue_reviews: aggregate.overdue_reviews + response.data.overdue_reviews,
          upcoming_reviews: aggregate.upcoming_reviews + response.data.upcoming_reviews,
          has_active_reviews: aggregate.has_active_reviews || response.data.has_active_reviews,
          has_overdue_reviews: aggregate.has_overdue_reviews || response.data.has_overdue_reviews,
          has_upcoming_reviews: aggregate.has_upcoming_reviews || response.data.has_upcoming_reviews,
          modal_type: null,
          reviews: [...aggregate.reviews, ...response.data.reviews],
        }), {
          total: 0,
          active_reviews: 0,
          overdue_reviews: 0,
          upcoming_reviews: 0,
          has_active_reviews: false,
          has_overdue_reviews: false,
          has_upcoming_reviews: false,
          modal_type: null,
          reviews: [],
        });
        data.modal_type = data.has_overdue_reviews ? "overdue" : data.has_active_reviews ? "active" : data.has_upcoming_reviews ? "upcoming" : null;
        return { data: { status: responses.every(response => response.status), data } };
      },
    }),
    smartReviewDueQuestions: builder.query<SmartReviewDueQuestionsResponseDTO, SmartReviewDueQuestionsRequestDTO>({
      query: params => ({
        url: "/smart-review/due/questions",
        method: "GET",
        params,
      }),
      transformResponse: (response: SmartReviewDueQuestionsResponseDTO) => ({
        ...response,
        data: {
          ...response.data,
          questions: normalizeGeneratedQuestions({
            id_study_block: response.data.id_study_block,
            questions: response.data.questions,
          }).questions,
        },
      }),
    }),
    smartReviewThemes: builder.query<SmartReviewThemeResponseDTO[], SmartReviewThemesRequestDTO>({
      providesTags: [TagTypes.SmartReviewThemes],
      query: body => {
        console.log("[SmartReview] Enviando solicitud de temas", {
          url: "/api/v1/smart-review/themes",
          method: "GET",
          params: body,
        });

        return {
          url: "/smart-review/themes",
          method: "GET",
          params: body,
        };
      },
      transformResponse: (response: SmartReviewThemeResponseDTO[]) => {
        console.log("[SmartReview] Respuesta de temas", response);
        return response;
      },
    }),
    createSmartReviewBlocks: builder.mutation<number, SmartReviewBlocksRequestDTO>({
      invalidatesTags: [TagTypes.SmartReviewBlocks],
      query: body => {
        console.log("[SmartReview] Creando bloques de repaso", {
          url: "/api/v1/smart-review/blocks",
          method: "POST",
          body,
        });

        return {
          url: "/smart-review/blocks",
          method: "POST",
          body,
        };
      },
      transformResponse: (response: number) => {
        console.log("[SmartReview] Bloques de repaso creados", response);
        return response;
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
      async queryFn(idStudyBlock, _queryApi, _extraOptions, baseQuery) {
        console.log("[SmartReview] Generando evaluación inicial", {
          url: `/api/v1/smart-review/blocks/${idStudyBlock}/pretest`,
          method: "POST",
          idStudyBlock,
        });

        let lastResult: Awaited<ReturnType<typeof baseQuery>> | undefined;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          if (attempt > 0) await waitForRetry(250 * attempt);
          const result = await baseQuery({
            url: `/smart-review/blocks/${idStudyBlock}/pretest`,
            method: "POST",
          });
          lastResult = result;

          if (!result.error) {
            const response = normalizeGeneratedQuestions(result.data as SmartReviewPretestResponseDTO);
            console.log("[SmartReview] Evaluación inicial generada", {
              idStudyBlock: response.id_study_block,
              totalQuestions: response.questions.length,
            });
            return { data: response };
          }

          if (result.error.status !== "PARSING_ERROR" || result.error.originalStatus !== 200) {
            return { error: result.error };
          }
        }

        return { error: lastResult!.error! };
      },
    }),
    smartReviewPosttest: builder.query<SmartReviewPretestResponseDTO, number>({
      async queryFn(idStudyBlock, _queryApi, _extraOptions, baseQuery) {
        let lastResult: Awaited<ReturnType<typeof baseQuery>> | undefined;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          if (attempt > 0) await waitForRetry(300 * attempt);
          const result = await baseQuery({
            url: `/smart-review/blocks/${idStudyBlock}/posttest`,
            method: "GET",
          });
          lastResult = result;

          if (!result.error) {
            const response = result.data as { status: boolean; data: SmartReviewPretestResponseDTO };
            return { data: normalizeGeneratedQuestions(response.data) };
          }

          // Occasionally the server closes a successful response before finishing
          // its JSON payload. Retry only that transient case; preserve all real
          // HTTP errors so the UI can report them immediately.
          if (result.error.status !== "PARSING_ERROR" || result.error.originalStatus !== 200) {
            return { error: result.error };
          }
        }

        return { error: lastResult!.error! };
      },
    }),
    completeSmartReviewPretest: builder.mutation<CompleteSmartReviewPretestResponseDTO, { idStudyBlock: number; body: CompleteSmartReviewPretestRequestDTO }>({
      invalidatesTags: [TagTypes.SmartReviewBlocks],
      query: ({ idStudyBlock, body }) => {
        console.log("[SmartReview] Enviando evaluación inicial", {
          url: `/api/v1/smart-review/blocks/${idStudyBlock}/pretest/complete`,
          method: "POST",
          body,
        });

        return {
          url: `/smart-review/blocks/${idStudyBlock}/pretest/complete`,
          method: "POST",
          body,
        };
      },
      transformResponse: (response: CompleteSmartReviewPretestResponseDTO) => {
        console.log("[SmartReview] Evaluación inicial completada", response);
        return response;
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
        console.log("[SmartReview] Enviando posttest completado", { idStudyBlock, body });
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
