import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ProfileResponseDTO, UpdateProfileRequestDTO, UpdateProfileResponseDTO } from "@/types/profile/profile.dto";

export const profileSlice = api.injectEndpoints({
  endpoints: builder => ({
    profile: builder.query<ProfileResponseDTO, void>({
      providesTags:[TagTypes.Profile],
      query: () => ({
        method: 'GET',
        url: '/auth/me',
      }),
    }),
    updateProfile: builder.mutation<UpdateProfileResponseDTO, UpdateProfileRequestDTO>({
      invalidatesTags:[TagTypes.Profile],
      query: (data) => ({
        method: 'POST',
        url: '/profile/update',
        body: data,
      }),
    }),
  }),
});

export const { useProfileQuery, useLazyProfileQuery, useUpdateProfileMutation } = profileSlice;