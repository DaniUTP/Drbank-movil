import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { AreaRequestDTO, AreaResponseDTO } from "@/types/question/area.dto";

export const areaSlice = api.injectEndpoints({
    endpoints: builder => ({
        area: builder.query<AreaResponseDTO[], AreaRequestDTO>({
            providesTags: [TagTypes.Area],
            query: (params) => ({
                url: '/quiz/area',
                method: 'GET',
                params,
            }),
        })
    })
});
export const { useAreaQuery, useLazyAreaQuery } = areaSlice;
