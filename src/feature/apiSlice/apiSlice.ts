import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlide = createApi({
  reducerPath: "apiSlide",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL
   }),
  endpoints: () => ({}),
});
