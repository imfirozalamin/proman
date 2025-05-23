import { USERS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";
import { logout as logoutAction } from "../authSlice";

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
      // Clear all auth data on logout
      onQueryStarted: async (_, { dispatch }) => {
        try {
          // Remove token and user info from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          // Dispatch logout action to clear Redux state
          dispatch(logoutAction());
        } catch (err) {
          console.error('Error during logout:', err);
        }
      },
      // Even if the API call fails, we still want to clear local data
      onError: (_, __, { dispatch }) => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        dispatch(logoutAction());
      },
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`,
        method: "POST",
        body: data,
      }),
      // Store token in localStorage after successful verification
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
    resendOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
} = authApiSlice;
