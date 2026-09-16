import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { AcademicAdvisoresHoldRequestDTO, AcademicAdvisoresHoldResponseDTO, AcademicAdvisoriesResponseDTO, RegisterMeetingRequestDTO, RegisterMeetingResponseDTO, ReleaseMeetingSlotResponseDTO } from "@/types/student/student.dto";

export const studentSlice = api.injectEndpoints({
    endpoints: builder => ({
        academicAdvisories: builder.query<AcademicAdvisoriesResponseDTO[], void>({
            providesTags: [TagTypes.Student],
            query: () => ({
                method: 'GET',
                url: '/student/academic-advisores',
            }),
        }),
        academicAdvisoresHold: builder.mutation<AcademicAdvisoresHoldResponseDTO, AcademicAdvisoresHoldRequestDTO>({
            invalidatesTags: (result) => result ? [TagTypes.DoctorAvailability] : [],
            query: (body) => ({
                method: 'POST',
                url: '/student/academic-advisores/hold',
                body
            }),
        }),
        releaseMeetingSlot: builder.mutation<ReleaseMeetingSlotResponseDTO, string>({
            invalidatesTags: (result) => result ? [TagTypes.DoctorAvailability] : [],
            query: (holdToken) => ({
                method: 'DELETE',
                url: `/student/academic-advisores/hold/${encodeURIComponent(holdToken)}`,
            }),
        }),
        registerMeeting: builder.mutation<RegisterMeetingResponseDTO, RegisterMeetingRequestDTO>({
            invalidatesTags: (result) => result
                ? [TagTypes.Student, TagTypes.DoctorAvailability]
                : [],
            query: (body) => ({
                method: 'POST',
                url: '/student/academic-advisores',
                body,
                // Make/ngrok usually needs about 30 seconds locally. Keep a
                // finite margin without leaving the UI waiting for minutes.
                timeout: 45000,
            }),
        }),
    })
});
export const {
    useAcademicAdvisoriesQuery,
    useLazyAcademicAdvisoriesQuery,
    useAcademicAdvisoresHoldMutation,
    useReleaseMeetingSlotMutation,
    useRegisterMeetingMutation,
} = studentSlice
