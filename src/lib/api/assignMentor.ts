// store/paperApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PapersResponse } from "@/types/paperType/paperType";

export type Assignment = {
  paperUuid: string;
  adviserUuid: string;
  deadline: string; // You may use Date type if you want to convert to actual date objects
};

export type AssignmentDetails = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // Or Date if you prefer converting it to a Date object
  status: "ASSIGNED" | "PENDING" | "COMPLETED"; // Assuming these are possible values for status
  assignedDate: string; // Or Date
  updateDate: string | null; // Can be Date or null
};

export type AssignmentUpdate = {
  paperUuid: string;
  newAdviserUuid: string;
  adminUuid: string;
  deadline: string; // Or Date if you want to convert it to a Date object
  reason: string;
};

export const AssignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/paper`,
  }),
  tagTypes: ["AssignAdviser"],
  endpoints: (builder) => ({
    assignAdviser: builder.mutation<
      AssignmentDetails,
      { token: string; assignMent: Assignment }
    >({
      query: ({ token, assignMent }) => ({
        url: "/assign-adviser", // Ensure this is the correct endpoint URL
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: assignMent,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),
    reAssignAdviser: builder.mutation<
      AssignmentDetails,
      { token: string; assignMent: AssignmentUpdate }
    >({
      query: ({ token, assignMent }) => ({
        url: "/reassign-adviser", // Ensure this is the correct endpoint URL
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: assignMent,
      }),
      invalidatesTags: ["AssignAdviser"],
    }),
  }),
});

export const { useAssignAdviserMutation, useReAssignAdviserMutation } = AssignmentApi;

// ✅ Hooks are generated correctly