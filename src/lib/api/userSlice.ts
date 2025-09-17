/* eslint-disable @typescript-eslint/no-explicit-any */
import { UsersResponse } from "@/types/userType/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth`,
  }),
  tagTypes: ["User", "Mentor", "Student"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getUser: builder.query<
      UsersResponse,
      { page: number; size: number; token: string }
    >({
      query: ({ page, size, token }) => ({
        url: `/users/page?page=${page}&size=${size}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        providesTags: ["User"],
      }),
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
        providesTags: ["Mentor"],
      }),
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
        providesTags: ["Student"],
      }),
    }),
  }),
});

export const { useGetUserQuery, useGetAllMentorQuery, useGetAllStudentQuery } = userApi;
