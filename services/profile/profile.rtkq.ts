import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ProfileResponseDTO } from "@/types/profile/profile.dto";

export const profileSlice = api.injectEndpoints({
  endpoints: builder => ({
    profile: builder.query<ProfileResponseDTO, void>({
      providesTags:[TagTypes.Profile],
      query: () => ({
        method: 'GET',
        url: '/auth/me',
      }),
    }),
  }),
});

export const { useProfileQuery, useLazyProfileQuery } = profileSlice;