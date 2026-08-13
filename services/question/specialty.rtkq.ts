import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { SpecialtyRequestDTO, SpecialtyResponseDTO } from "@/types/question/specialty.dto";

export const specialtySlice = api.injectEndpoints({
    endpoints: builder => ({
        specialty: builder.query<SpecialtyResponseDTO[], SpecialtyRequestDTO>({
            providesTags: [TagTypes.Specialty],
            query: (params) => ({
                url: '/quiz/specialty',
                method: 'GET',
                params
            }),
        })
    })
});
export const { useSpecialtyQuery, useLazySpecialtyQuery } = specialtySlice;