import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ThemeRequestDTO, ThemeResponseDTO } from "@/types/question/theme.dto";

export const themeSlice = api.injectEndpoints({
    endpoints: builder => ({
        theme: builder.query<ThemeResponseDTO[], ThemeRequestDTO>({
            providesTags: [TagTypes.Theme],
            query: (body) => {
                console.log("Theme API request:", body);
                return {
                    url: '/quiz/theme',
                    method: 'POST',
                    body
                };
            },
        })
    })
});
export const { useThemeQuery, useLazyThemeQuery } = themeSlice;