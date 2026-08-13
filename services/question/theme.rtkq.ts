import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ThemeRequestDTO, ThemeResponseDTO } from "@/types/question/theme.dto";

export const themeSlice = api.injectEndpoints({
    endpoints: builder => ({
        theme: builder.query<ThemeResponseDTO[], ThemeRequestDTO>({
            providesTags: [TagTypes.Theme],
            query: (params) => ({
                url: '/quiz/theme',
                method: 'GET',
                params
            }),
        })
    })
});
export const { useThemeQuery, useLazyThemeQuery } = themeSlice;