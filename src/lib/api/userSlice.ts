import {
  RegisterRequest,
  UpdateUserType,
  User,
  UsersResponse,
} from "@/types/userType/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth`,
  }),
  tagTypes: ["User", "Mentor", "Student", "Register"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getAllUsers: builder.query<User[], { token: string }>({
      query: ({ token }) => ({
        url: "/users",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["User"], // ✅ correct placement
    }),
    getAUserByUuid: builder.query<User, { token: string; uuid: string }>({
      query: ({ token, uuid }) => ({
        url: `/user/${uuid}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getUser: builder.query<
      UsersResponse,
      { page: number; size: number; token: string }
    >({
      query: ({ page, size, token }) => ({
        url: `/users/page?page=${page}&size=${size}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["User"],
    }),
    getAllMentor: builder.query<
      UsersResponse,
      { page: number; size: number; token: string }
    >({
      query: ({ page, size, token }) => ({
        url: `/user/mentor?page=${page}&size=${size}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Mentor"],
    }),
    getAllStudent: builder.query<
      UsersResponse,
      { page: number; size: number; token: string }
    >({
      query: ({ page, size, token }) => ({
        url: `/user/student?page=${page}&size=${size}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Student"],
    }),
    createNewUser: builder.mutation<UsersResponse, RegisterRequest>({
      query: (newUser) => ({
        url: `/register`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User", "Mentor", "Student"], // ✅ tells RTK Query to refetch any query tagged 'User'
    }),
    updateUser: builder.mutation<
      void,
      { uuid: string; updateUser: UpdateUserType; token: string }
    >({
      query: ({ uuid, updateUser, token }) => ({
        url: `/user/${uuid}`,
        method: "PATCH", // Correct method for partial update
        body: updateUser,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["User", "Mentor", "Student"], // This tells RTK to refetch queries tagged 'User'
    }),
    deleteUser: builder.mutation<void, { uuid: string; token: string }>({
      query: ({ uuid, token }) => ({
        url: `/user/${uuid}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["User", "Mentor", "Student"],
    }),
  }),
});

export const {
  useGetAUserByUuidQuery,
  useGetUserQuery,
  useGetAllMentorQuery,
  useGetAllStudentQuery,
  useGetAllUsersQuery,
  useCreateNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
