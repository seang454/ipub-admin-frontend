/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    PaginationResponse,
  RegisterRequest,
  UpdateUserType,
  User,
  UsersResponse,
} from "@/types/userType/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/students`,
  }),
  tagTypes: ["Student"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getStudents: builder.query<PaginationResponse<User>, { token: string }>({
      query: ({ token }) => ({
        url: ``,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Student"], // ✅ correct placement
    }),
    createNewStudent: builder.mutation<UsersResponse, RegisterRequest>({
      query: (newUser) => ({
        url: `/create-student`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Student"], // ✅ tells RTK Query to refetch any query tagged 'Student'
    }),
    updateStudent: builder.mutation<
      void,
      { uuid: string; updateUser: UpdateUserType; token: string }
    >({
      query: ({ uuid, updateUser, token }) => ({
        url: `/${uuid}`,
        method: "PATCH", // Correct method for partial update
        body: updateUser,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Student"], // This tells RTK to refetch queries tagged 'Student'
    }),
    deleteStudent: builder.mutation<void, { uuid: string; token: string }>({
      query: ({ uuid, token }) => ({
        url: `/${uuid}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Student"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useCreateNewStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
