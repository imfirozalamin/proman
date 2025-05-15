import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const API_URL = import.meta.env.VITE_APP_BASE_URL + "/api";
const API_URL = import.meta.env.VITE_APP_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL + "/api",
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
