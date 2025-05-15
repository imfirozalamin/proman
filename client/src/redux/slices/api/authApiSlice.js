import { USERS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: data,
      }),
      // Store token in localStorage after successful login
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) {
            localStorage.setItem('token', data.token);
          }
        } catch (err) {
          console.error('Error storing token:', err);
        }
      },
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
      // Store token in localStorage after successful registration
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) {
            localStorage.setItem('token', data.token);
          }
        } catch (err) {
          console.error('Error storing token:', err);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      // Remove token from localStorage on logout
      onQueryStarted: async () => {
        localStorage.removeItem('token');
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } =
  authApiSlice;
