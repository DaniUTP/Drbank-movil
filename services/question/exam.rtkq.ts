import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { DownloadExamsRequestDTO, DownloadExamsResponseDTO, ExamRequestDTO, ExamResponseDTO, GetExamDetailResponseDTO, GetExamRequestDTO, GetExamResponseDTO, UpdateExamStatusRequestDTO, UpdateExamStatusResponseDTO } from "@/types/question/exam.dto";

export const examSlice = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        exam: builder.mutation<ExamResponseDTO, ExamRequestDTO>({
            query: (body) => ({
                url: '/quiz/exam',
                method: 'POST',
                body
            }),
        }),
        getExam: builder.query<GetExamResponseDTO, GetExamRequestDTO>({
            providesTags: [TagTypes.ExamHistory],
            query: ({ difficulty: _difficulty, ...params }) => ({
                url: '/quiz/exam',
                method: 'GET',
                params: params.id_study_block
                    ? { ...params, difficulty: true }
                    : params
            }),
        }),
        getExamDetail: builder.query<GetExamDetailResponseDTO, string>({
            query: (uuid) => ({
                url: `/quiz/exam/${uuid}`,
                method: 'GET',
            }),
        }),
        updateExamStatus: builder.mutation<UpdateExamStatusResponseDTO, UpdateExamStatusRequestDTO>({
            invalidatesTags: [TagTypes.ExamHistory],
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
    useGetExamDetailQuery,
    useLazyGetExamDetailQuery,
    useUpdateExamStatusMutation,
    useDownloadExamsMutation,
} = examSlice;

