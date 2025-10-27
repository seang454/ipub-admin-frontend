// store/paperApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PapersResponse } from "@/types/paperType/paperType";

export const paperApi = createApi({
  reducerPath: "paperApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin`,
  }),
  tagTypes: ["Paper"],
  endpoints: (builder) => ({
    getPaper: builder.query<
      PapersResponse,
      { token: string; page?: number; size?: number }
    >({
      query: ({ token, page = 0, size = 100 }) => ({
        url: "/papers",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          size,
        },
      }),
      providesTags: ["Paper"],
    }),
  }),
});

// ✅ Hooks are generated correctly
export const { useGetPaperQuery } = paperApi;
