import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export type Category = {
  uuid: string;
  name: string;
  slug: string;
};

export type SortInfo = {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
};

export type Pageable = {
  pageNumber: number;
  pageSize: number;
  sort: SortInfo;
  offset: number;
  paged: boolean;
  unpaged: boolean;
};

export type CategoryResponse = {
  content: Category[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: SortInfo;
  empty: boolean;
};

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories`,
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getAllCategories: builder.query<
      CategoryResponse,
      { page: number; size: number; token: string }
    >({
      query: ({ page, size, token }) => ({
        url: "",
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const { useGetAllCategoriesQuery } = categoryApi;
