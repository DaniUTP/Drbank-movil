import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { QuestionByThemeRequestDTO, QuestionByThemeResponseDTO, QuestionByYearRequestDTO, QuestionByYearResponseDTO, QuestionRequestDTO, QuestionResponseDTO } from "@/types/question/question.dto";

export const questionSlice = api.injectEndpoints({
    endpoints: builder => ({
        question: builder.query<QuestionResponseDTO[], QuestionRequestDTO>({
            providesTags: [TagTypes.Question],
            query: (body) => ({
                url: '/quiz/questions',
                method: 'POST',
                body,
            }),
        }),
        questionByYear:builder.query<QuestionByYearResponseDTO[], QuestionByYearRequestDTO>({
            providesTags: [TagTypes.QuestionByYear],
            query: (body) => ({
                url: '/quiz/by-year',
                method: 'POST',
                body,
            }),
        }),
        questionByTheme:builder.query<QuestionByThemeResponseDTO[], QuestionByThemeRequestDTO>({
            providesTags: [TagTypes.QuestionByTheme],
            query: (body) => ({
                url: '/quiz/question/theme',
                method: 'POST',
                body,
            }),
        }),
    })
});
export const { useQuestionQuery, useLazyQuestionQuery,useQuestionByYearQuery,useLazyQuestionByThemeQuery,useQuestionByThemeQuery,useLazyQuestionByYearQuery } = questionSlice;