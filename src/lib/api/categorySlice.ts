import { Paper } from "@/types/paperType/paperType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories`,
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<Paper[],void>({
      query: () => ({
        url: "/",
      }),
    }),
  }),
});
