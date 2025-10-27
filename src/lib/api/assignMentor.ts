// store/assignMentor.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PapersResponse } from "@/types/paperType/paperType";

export type Assignment = {
  paperUuid: string;
  adviserUuid: string;
  deadline: string; // LocalDate from backend, send as "YYYY-MM-DD"
  adminUuid?: string;
};

export type AssignmentDetails = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // LocalDate from backend, format: "YYYY-MM-DD"
  status: string; // "ASSIGNED" | "PENDING" | "COMPLETED" | "REVIEWED" | "REJECTED"
  assignedDate: string; // LocalDate from backend, format: "YYYY-MM-DD"
  updateDate: string; // LocalDate from backend, format: "YYYY-MM-DD"
};

export type AssignmentUpdate = {
  paperUuid: string;
  newAdviserUuid: string;
  adminUuid: string;
  deadline: string; // LocalDate from backend, send as "YYYY-MM-DD"
  reason?: string; // Optional, max 500 characters
};

export type RejectPaperRequest = {
  paperUuid: string;
  reason: string; // Required, max 500 characters
};

export type AdviserReviewRequest = {
  assignmentUuid: string;
  adviserUuid: string;
  comment: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
};

export type AdvisorAssignmentResponse = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // LocalDate from backend, format: "YYYY-MM-DD"
  status: string;
  assignedDate: string; // LocalDate from backend, format: "YYYY-MM-DD"
  updateDate: string; // LocalDate from backend, format: "YYYY-MM-DD"
};

export type PaginatedAssignmentsResponse = {
  content: AdvisorAssignmentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const AssignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/paper`,
  }),
  tagTypes: ["AssignAdviser"],
  endpoints: (builder) => ({
    // Assign adviser to paper
    assignAdviser: builder.mutation<
      AssignmentDetails,
      { token: string; assignMent: Assignment }
    >({
      query: ({ token, assignMent }) => ({
        url: "/assign-adviser",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: assignMent,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),

    // Reassign adviser
    reAssignAdviser: builder.mutation<
      AssignmentDetails,
      { token: string; assignMent: AssignmentUpdate }
    >({
      query: ({ token, assignMent }) => ({
        url: "/reassign-adviser",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: assignMent,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),

    // Reject paper by admin
    rejectPaper: builder.mutation<
      PapersResponse,
      { token: string; rejectRequest: RejectPaperRequest }
    >({
      query: ({ token, rejectRequest }) => ({
        url: "/reject",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: rejectRequest,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),

    // Review paper by adviser
    reviewPaperByAdviser: builder.mutation<
      AssignmentDetails,
      { token: string; reviewRequest: AdviserReviewRequest }
    >({
      query: ({ token, reviewRequest }) => ({
        url: "/adviser-review",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: reviewRequest,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),

    // Get assignments by adviser UUID
    getAssignmentsByAdviser: builder.query<
      AdvisorAssignmentResponse[],
      { token: string; adviserUuid: string }
    >({
      query: ({ token, adviserUuid }) => ({
        url: `/adviser/${adviserUuid}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AssignAdviser"],
    }),

    // Get all assignments by author UUID (current user)
    getAllAssignmentsByAuthor: builder.query<
      AdvisorAssignmentResponse[],
      { token: string }
    >({
      query: ({ token }) => ({
        url: "/assignments", // Changed from /assignments/author to /assignments to get ALL
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AssignAdviser"],
    }),

    // Get assignments by author UUID (specific adviser)
    getAssignmentsByAuthor: builder.query<
      AdvisorAssignmentResponse[],
      { token: string; adviserUuid: string }
    >({
      query: ({ token, adviserUuid }) => ({
        url: `/assignments/adviser/${adviserUuid}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AssignAdviser"],
    }),

    // Get assignments for current adviser (paginated)
    getAssignmentsForCurrentAdviser: builder.query<
      PaginatedAssignmentsResponse,
      { token: string; page?: number; size?: number }
    >({
      query: ({ token, page = 0, size = 10 }) => ({
        url: "/assignments/adviser",
        method: "GET",
        params: { page, size },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AssignAdviser"],
    }),
    getAllAssignments: builder.query<
      AdvisorAssignmentResponse[],
      { token: string }
    >({
      query: ({ token }) => ({
        url: "/assignment",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AssignAdviser"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useAssignAdviserMutation,
  useReAssignAdviserMutation,
  useRejectPaperMutation,
  useReviewPaperByAdviserMutation,
  useGetAssignmentsByAdviserQuery,
  useGetAllAssignmentsByAuthorQuery,
  useGetAssignmentsByAuthorQuery,
  useGetAssignmentsForCurrentAdviserQuery,
  useGetAllAssignmentsQuery,
} = AssignmentApi;
