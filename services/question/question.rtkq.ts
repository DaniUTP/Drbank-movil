import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { QuestionRequestDTO, QuestionResponseDTO } from "@/types/question/question.dto";

export const questionSlice = api.injectEndpoints({
    endpoints: builder => ({
        question: builder.query<QuestionResponseDTO[], QuestionRequestDTO>({
            providesTags: [TagTypes.Question],
            query: (body) => ({
                url: '/quiz/questions',
                method: 'POST',
                body,
            }),
        })
    })
});
export const { useQuestionQuery, useLazyQuestionQuery, useLazyQuestionQuery: useLazyQuestionByThemeQuery } = questionSlice;