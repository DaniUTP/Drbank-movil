import { api } from "@/store/api";
import { ExamRequestDTO, ExamResponseDTO, GetExamRequestDTO, GetExamResponseDTO, UpdateExamStatusRequestDTO, UpdateExamStatusResponseDTO } from "@/types/question/exam.dto";

export const examSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        exam: builder.mutation<ExamResponseDTO, ExamRequestDTO>({
            query: (body) => ({
                url: '/quiz/exam',
                method: 'POST',
                body
            }),
        }),
        getExam: builder.query<GetExamResponseDTO, GetExamRequestDTO>({
            query: (params) => ({
                url: '/quiz/exam',
                method: 'GET',
                params
            }),
        }),
        updateExamStatus: builder.mutation<UpdateExamStatusResponseDTO, UpdateExamStatusRequestDTO>({
            query: (body) => ({
                url: '/quiz/exam/status',
                method: 'PATCH',
                body
            }),
        }),
    })
})

export const {
    useExamMutation,
    useGetExamQuery,
    useLazyGetExamQuery,
    useUpdateExamStatusMutation,
} = examSlice;

