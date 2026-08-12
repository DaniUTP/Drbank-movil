import { api } from "@/store/api";
import { RegisterRequestDTO, RegisterResponseDTO } from "@/types/auth/register.dto";

export const registerSlice = api.injectEndpoints({
    endpoints: builder => ({
        register: builder.mutation<RegisterResponseDTO, RegisterRequestDTO>({
            query: (credentials) => ({
                method: 'POST',
                url: '/auth/register',
                body: credentials,
            }),
        }),
    }),
})

export const { useRegisterMutation } = registerSlice