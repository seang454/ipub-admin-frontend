// store/paperApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PapersResponse } from "@/types/paperType/paperType";
import { text } from "stream/consumers";
import { EditFormData } from "@/components/papers/paper-table";
import {
  PaginatedStudentsResponse,
  Student,
} from "@/types/studentType/studentType";
import { query } from "../../../util/db";
export type PaperData = {
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl?: string; // optional if you want to allow missing thumbnails
  categoryNames: string[];
};

export const paperAdminApi = createApi({
  reducerPath: "paperAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  }),
  tagTypes: ["AdminPaper"],
  endpoints: (builder) => ({
    getPaper: builder.query<
      PapersResponse,
      { token: string; page: number; size: number }
    >({
      query: (params) => ({
        url: "/admin/papers", // Ensure this is the correct endpoint URL
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
        params: {
          page: params.page,
          size: params.size,
        },
      }),
      providesTags: ["AdminPaper"],
    }),
    createPaper: builder.mutation<
      { message: string },
      { token: string; paperData: PaperData }
    >({
      query: ({ token, paperData }) => ({
        url: "/papers",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: paperData,
        responseHandler: "text",
      }),
      invalidatesTags: ["AdminPaper"],
    }),
    updateAdminPaper: builder.mutation<
      { message: string },
      { token: string; paperUuid: string; paperData: EditFormData }
    >({
      query: ({ token, paperUuid, paperData }) => ({
        url: `/admin/paper/${paperUuid}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: paperData,
      }),
      invalidatesTags: ["AdminPaper"],
    }),
    deletePaper: builder.mutation<void, { token: string; uuid: string }>({
      query: ({ token, uuid }) => ({
        url: `/admin/paper/${uuid}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["AdminPaper"],
    }),
    getAllPendingStudent: builder.query<
      PaginatedStudentsResponse,
      { token: string; page: number; size: number }
    >({
      query: (params) => ({
        url: `/admin/student/pending`,
        method: "GET",
        params: {
          page: params.page,
          size: params.size,
        },
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      }),
    }),
    getAStudentByUuid: builder.query<Student, { token: string; uuid: string }>({
      query: ({ token, uuid }) => ({
        url: `/admin/student/${uuid}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    approveStudent: builder.mutation<
      { message: string },
      { uuid: string; token: string }
    >({
      query: ({ uuid, token }) => ({
        url: `/admin/student/approve-student-detail/${uuid}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseHandler:"text"
      }),
    }),
  }),
});

// ✅ Hooks are generated correctly
export const {
  useGetPaperQuery,
  useCreatePaperMutation,
  useUpdateAdminPaperMutation,
  useDeletePaperMutation,
  useGetAllPendingStudentQuery,
  useGetAStudentByUuidQuery,
  useApproveStudentMutation
} = paperAdminApi;
