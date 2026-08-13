import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { YearResponseDTO } from "@/types/question/year.dto";

export const yearSlice = api.injectEndpoints({
    endpoints: builder => ({
        year: builder.query<YearResponseDTO[], void>({
            providesTags: [TagTypes.Year],
            query: () => ({
                url: '/quiz/year',
                method: 'GET',
            }),
        })
    })
});
export const { useYearQuery, useLazyYearQuery } = yearSlice;