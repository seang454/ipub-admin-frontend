/* eslint-disable @typescript-eslint/no-explicit-any */
import { UsersResponse } from "@/types/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paperApi = createApi({
  reducerPath: "paperApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth`,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getUser: builder.query<UsersResponse, { page: number; size: number; token: string }>({
      query: ({ page, size, token }) => ({
        url: `/users?page=${page}&size=${size}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const { useGetUserQuery } = paperApi;
