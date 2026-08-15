import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { MarkStudiedRequestDTO, MarkStudiedResponseDTO, StudentProgressResponseDTO } from "@/types/studentProgress/student-progress.dto";

export const studentProgressSlice=api.injectEndpoints({
  endpoints: builder => ({
    studentProgress: builder.query<StudentProgressResponseDTO, void>({
      providesTags:[TagTypes.StudentProgress],
      query: () => ({
        method: 'GET',
        url: '/student/progress',
      }),
    }),
    markStudied: builder.mutation<MarkStudiedResponseDTO, MarkStudiedRequestDTO>({
      invalidatesTags: [TagTypes.StudentProgress],
      query: (body) => ({
        method: 'POST',
        url: '/student/mark-topic-studied',
        body
      }),
    }),
  }),
});
export const { useStudentProgressQuery, useLazyStudentProgressQuery, useMarkStudiedMutation } = studentProgressSlice;