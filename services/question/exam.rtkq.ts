import { api } from "@/store/api";
import { DownloadExamsRequestDTO, DownloadExamsResponseDTO, ExamRequestDTO, ExamResponseDTO, GetExamRequestDTO, GetExamResponseDTO, UpdateExamStatusRequestDTO, UpdateExamStatusResponseDTO } from "@/types/question/exam.dto";

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
        downloadExams:builder.mutation<DownloadExamsResponseDTO, DownloadExamsRequestDTO>({
            query: (body) => ({
                url: '/quiz/exam/download-summary',
                method: 'POST',
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
    useDownloadExamsMutation,
} = examSlice;

