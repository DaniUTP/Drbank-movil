import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { AreaResponseDTO } from "@/types/question/area.dto";

export const areaSlice = api.injectEndpoints({
    endpoints: builder => ({
        area: builder.query<AreaResponseDTO[], void>({
            providesTags: [TagTypes.Area],
            query: () => ({
                url: '/quiz/area',
                method: 'GET',
            }),
        })
    })
});
export const { useAreaQuery, useLazyAreaQuery } = areaSlice;