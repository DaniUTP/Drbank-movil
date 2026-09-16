import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { DoctorAvailabilityRequestDTO, DoctorAvailabilityResponseDTO, DoctorResponseDTO } from "@/types/doctor/doctor.dto";

export const doctorSlice = api.injectEndpoints({
    // Fast Refresh can retain an older, partially registered endpoint definition.
    // Replace it with the current definition whenever this module is reloaded.
    overrideExisting: true,
    endpoints: builder => ({
        doctor: builder.query<DoctorResponseDTO[], void>({
            providesTags: [TagTypes.Doctor],
            query: () => ({
                method: 'GET',
                url: '/doctors',
            }),
        }),
        doctorAvailability: builder.query<DoctorAvailabilityResponseDTO, DoctorAvailabilityRequestDTO>({
            providesTags: (_result, _error, { doctor_id, date }) => [
                { type: TagTypes.DoctorAvailability, id: `${doctor_id}-${date}` },
            ],
            query: ({ doctor_id, date }) => ({
                method: 'GET',
                url: `/doctor/${doctor_id}/availability`,
                params: {
                    date,
                },
            }),
        }),
    }),
});
export const { useDoctorQuery, useLazyDoctorQuery, useDoctorAvailabilityQuery, useLazyDoctorAvailabilityQuery } = doctorSlice;
