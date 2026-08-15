import { api } from "@/store/api";
import { LogoutRequestDTO, LogoutResponseDTO } from "@/types/auth/logout.dto";

export const logoutSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        logout: builder.mutation<LogoutResponseDTO,LogoutRequestDTO>({
            query: (body) => ({
                url: "/auth/logout",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useLogoutMutation } = logoutSlice;