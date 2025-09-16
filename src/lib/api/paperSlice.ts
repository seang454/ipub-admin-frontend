// store/paperApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PapersResponse } from "@/types/paperType/paperType";

export const paperApi = createApi({
  reducerPath: "paperApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/papers`,
  }),
  tagTypes: ["Paper"],
  endpoints: (builder) => ({
    getPaper: builder.query<PapersResponse, void>({
      query: () => "/published",
      providesTags: ["Paper"],
    }),
  }),
});

// ✅ Hooks are generated correctly
export const { useGetPaperQuery } = paperApi;
