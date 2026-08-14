import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { ChangePasswordRequestDTO, ChangePasswordResponseDTO } from "@/types/profile/change-password.dto";

export const changePasswordSlice = api.injectEndpoints({
    endpoints: builder => ({
        changePassword: builder.query<ChangePasswordResponseDTO, ChangePasswordRequestDTO>({
            providesTags: [TagTypes.ChangePassword],
            query: (body) => ({
                method: 'POST',
                url: '/profile/change-password',
                body
            }),
        }),
    }),
});

export const { useChangePasswordQuery, useLazyChangePasswordQuery } = changePasswordSlice;