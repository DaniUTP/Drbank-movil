import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { YearRequestDTO, YearResponseDTO } from "@/types/question/year.dto";

export const yearSlice = api.injectEndpoints({
    endpoints: builder => ({
        year: builder.query<YearResponseDTO[], YearRequestDTO>({
            providesTags: [TagTypes.Year],
            query: (request) => ({
                url: '/quiz/year',
                method: 'GET',
                params: request
            }),
        })
    })
});
export const { useYearQuery, useLazyYearQuery } = yearSlice;