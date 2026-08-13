import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ExamTypeResponseDTO } from "@/types/question/exam-type.dto";

export const examTypeSlice = api.injectEndpoints({
    endpoints: builder => ({
        examType: builder.query<ExamTypeResponseDTO[], void>({
            providesTags: [TagTypes.ExamType],
            query: () => ({
                url: '/quiz/exam-type',
                method: 'GET',
            }),
        })
    })
});
export const { useExamTypeQuery, useLazyExamTypeQuery } = examTypeSlice;