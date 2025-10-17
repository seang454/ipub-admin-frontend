import {
  PaginationResponse,
  RegisterRequest,
  UpdateUserType,
  User,
} from "@/types/userType/userType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { StudentUpdateType } from "@/types/studentType/studentType";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin`,
  }),
  tagTypes: ["Student"],
  endpoints: (builder) => ({
    // ⬇️ Accept token as an argument from the component
    getStudents: builder.query<
      PaginationResponse<User>,
      { token: string; page?: number; size?: number }
    >({
      query: ({ token, page = 0, size = 10 }) => ({
        url: `/students`,
        params: { page, size },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Student"], // ✅ correct placement
    }),
    getAllStudents: builder.query<User[], { token: string; size?: number }>({
      async queryFn({ token, size = 100 }, _api, _extraOptions, baseQuery) {
        const headers = { Authorization: `Bearer ${token}` } as Record<
          string,
          string
        >;
        const firstPageResult = (await baseQuery({
          url: `/students`,
          params: { page: 0, size },
          headers,
        })) as {
          data?: unknown;
          error?: FetchBaseQueryError;
          meta?: FetchBaseQueryMeta;
        };

        if (firstPageResult.error) {
          return { error: firstPageResult.error };
        }

        const firstPageData = firstPageResult.data as PaginationResponse<User>;
        let allStudents: User[] = [...firstPageData.content];

        for (let page = 1; page < firstPageData.totalPages; page += 1) {
          const pageResult = (await baseQuery({
            url: `/students`,
            params: { page, size },
            headers,
          })) as {
            data?: unknown;
            error?: FetchBaseQueryError;
            meta?: FetchBaseQueryMeta;
          };
          if (pageResult.error) {
            return { error: pageResult.error };
          }
          const pageData = pageResult.data as PaginationResponse<User>;
          allStudents = allStudents.concat(pageData.content);
        }

        return { data: allStudents };
      },
      providesTags: ["Student"],
    }),
    createNewStudent: builder.mutation<
      { message: string },
      { token: string; user: RegisterRequest }
    >({
      query: ({ token, user }) => ({
        url: `/student/create-student`,
        method: "POST",
        body: user,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // The backend returns plain text with a JSON content-type; force text parsing
        responseHandler: "text",
      }),
      transformResponse: (response: string) => ({ message: response }),
      invalidatesTags: ["Student"], // ✅ tells RTK Query to refetch any query tagged 'Student'
    }),
    updateStudent: builder.mutation<
      void,
      { uuid: string; updateUser: StudentUpdateType; token: string }
    >({
      query: ({ uuid, updateUser, token }) => ({
        url: `/student/${uuid}`,
        method: "PUT", // Correct method for partial update
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
  useGetAllStudentsQuery,
  useCreateNewStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
