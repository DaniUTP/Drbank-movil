import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { SupportRequestDTO, SupportResponseDTO } from "@/types/external/support.dto";

export const supportSlice = api.injectEndpoints({
    endpoints: builder => ({
        support: builder.query<SupportResponseDTO, SupportRequestDTO>({
            providesTags: [TagTypes.Support],
            query: (body) => ({
                method: 'POST',
                url: '/external/support',
                body
            }),
        }),
    }),
});
export const { useSupportQuery, useLazySupportQuery } = supportSlice;