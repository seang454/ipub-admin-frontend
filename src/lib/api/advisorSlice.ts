import { Adviser } from "@/components/advisers/zode";
import {
  PaginationResponse,
  RegisterRequest,
  UpdateUserType,
  User,
  UsersResponse,
} from "@/types/userType/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AdviserApi = createApi({
  reducerPath: "adviserApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  }),
  tagTypes: ["Advisor"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getAllAdvisors: builder.query<PaginationResponse<User>, { token: string }>({
      query: ({ token }) => ({
        url: `/admin/advisers`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Advisor"], // ✅ correct placement
    }),
    createNewAdvisor: builder.mutation<
      { message: string },
      { token: string; user: RegisterRequest }
    >({
      query: ({ token, user }) => ({
        url: `/admin/adviser/create-adviser`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: user,
        // backend returns plain text message (not JSON) so instruct RTK to parse as text
        responseHandler: "text",
      }),
      // transform the plain text into the expected shape { message: string }
      transformResponse: (response: string) => ({ message: response }),
      invalidatesTags: ["Advisor"], // ✅ tells RTK Query to refetch any query tagged 'Advisor'
    }),
    updateAdvisor: builder.mutation<
      void,
      { uuid: string; updateUser: Adviser; token: string }
    >({
      query: ({ uuid, updateUser, token }) => ({
        url: `/adviser_details/${uuid}`,
        method: "PATCH", // Correct method for partial update
        body: updateUser,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Advisor"], // ✅ tells RTK Query to refetch any query tagged 'Advisor'
    }),
    deleteAdvisor: builder.mutation<void, { uuid: string; token: string }>({
      query: ({ uuid, token }) => ({
        url: `/admin/adviser/${uuid}`,
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
  useDeleteAdvisorMutation,
} = AdviserApi;
