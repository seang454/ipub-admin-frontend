/* eslint-disable @typescript-eslint/no-explicit-any */
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
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin`,
  }),
  tagTypes: ["Advisor"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getAllAdvisors: builder.query<User[], { token: string }>({
      query: ({ token }) => ({
        url: "/advisers",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Advisor"], // ✅ correct placement
    }),
    createNewAdvisor: builder.mutation<UsersResponse, RegisterRequest>({
      query: (newUser) => ({
        url: `/adviser/create-adviser`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Advisor"], // ✅ tells RTK Query to refetch any query tagged 'Advisor'
    }),
    updateAdvisor: builder.mutation<
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
      invalidatesTags: ["Advisor"], // ✅ tells RTK Query to refetch any query tagged 'Advisor'
    }),
    deleteUser: builder.mutation<void, { uuid: string; token: string }>({
      query: ({ uuid, token }) => ({
        url: `/user/${uuid}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Advisor"], // ✅ tells RTK Query to refetch any query tagged 'Advisor'
    }),
  }),
});

export const {
  useGetAllAdvisorsQuery,
  useCreateNewAdvisorMutation,
  useUpdateAdvisorMutation,
  useDeleteUserMutation,
} = userApi;
