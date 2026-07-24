import { api } from '../store/api';
import { TagTypes } from '../store/constants/tagTypes.constants';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/user.dto';

export const userSlice = api.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<UserDTO[], void>({
      providesTags: [TagTypes.User], // Cache invalidation
      query: () => ({
        method: 'GET',
        url: '/users',
      }),
    }),
    getUserById: builder.query<UserDTO, string>({
      providesTags: (result, error, id) => [{ type: TagTypes.User, id }],
      query: id => ({
        method: 'GET',
        url: `/users/${id}`,
      }),
    }),
    createUser: builder.mutation<UserDTO, CreateUserDTO>({
      invalidatesTags: [TagTypes.User], // Invalida el cache de User
      query: body => ({
        method: 'POST',
        url: '/users',
        body,
      }),
    }),
    updateUser: builder.mutation<UserDTO, UpdateUserDTO>({
      invalidatesTags: (result, error, arg) => [{ type: TagTypes.User, id: arg.id }],
      query: body => ({
        method: 'PUT',
        url: `/users/${body.id}`,
        body,
      }),
    }),
    deleteUser: builder.mutation<void, string>({
      invalidatesTags: (result, error, id) => [{ type: TagTypes.User, id }],
      query: id => ({
        method: 'DELETE',
        url: `/users/${id}`,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userSlice;
