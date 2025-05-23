import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useRegisterMutation, useVerifyOTPMutation, useResendOTPMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useEffect, useState } from "react";

const SignUp = () => {
  const { user } = useSelector((state) => state.auth);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: errorsOTP },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignup = async (data) => {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        title: "Administrator",
        role: "Admin",
        isAdmin: true,
      };

      const res = await registerUser(userData).unwrap();
      setUserId(res.userId);
      setShowOTPForm(true);
      startCountdown();
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      console.error("Registration error:", err);
    }
  };

  const handleOTPVerification = async (data) => {
    try {
      const res = await verifyOTP({
        userId,
        otp: data.otp,
      }).unwrap();
      
      dispatch(setCredentials(res));
      toast.success(res.message);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      console.error("OTP verification error:", err);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      const res = await resendOTP({ userId }).unwrap();
      toast.success(res.message);
      startCountdown();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      console.error("Resend OTP error:", err);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black">
      <div className="w-full max-w-md mx-4">
        {!showOTPForm ? (
          <form
            onSubmit={handleSubmit(handleSignup)}
            className="bg-white dark:bg-slate-900 shadow-xl rounded-lg p-8"
          >
            <div className="mb-8 text-center">
              <p className="text-red-600 text-3xl font-bold">Create Account</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Join us to manage your tasks efficiently
              </p>
            </div>

            <div className="space-y-4">
              <Textbox
                placeholder="John Doe"
                type="text"
                name="name"
                label="Full Name"
                className="w-full rounded-lg"
                register={register("name", {
                  required: "Full Name is required!",
                })}
                error={errors.name ? errors.name.message : ""}
              />

              <Textbox
                placeholder="you@example.com"
                type="email"
                name="email"
                label="Email Address"
                className="w-full rounded-lg"
                register={register("email", {
                  required: "Email is required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email ? errors.email.message : ""}
              />

              <Textbox
                placeholder="password"
                type="password"
                name="password"
                label="Password"
                className="w-full rounded-lg"
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <Textbox
                placeholder="confirm password"
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                className="w-full rounded-lg"
                register={register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords don't match",
                })}
                error={errors.confirmPassword ? errors.confirmPassword.message : ""}
              />
            </div>

            <div className="mt-8">
              {isLoading ? (
                <Loading />
              ) : (
                <Button
                  type="submit"
                  label="Create Account"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                />
              )}
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitOTP(handleOTPVerification)}
            className="bg-white dark:bg-slate-900 shadow-xl rounded-lg p-8"
          >
            <div className="mb-8 text-center">
              <p className="text-red-600 text-3xl font-bold">Verify Email</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Please enter the OTP sent to your email
              </p>
            </div>

            <div className="space-y-4">
              <Textbox
                placeholder="Enter OTP"
                type="text"
                name="otp"
                label="OTP"
                className="w-full rounded-lg"
                register={registerOTP("otp", {
                  required: "OTP is required!",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Please enter a valid 6-digit OTP",
                  },
                })}
                error={errorsOTP.otp ? errorsOTP.otp.message : ""}
              />
            </div>

            <div className="mt-8 space-y-4">
              {isVerifying ? (
                <Loading />
              ) : (
                <Button
                  type="submit"
                  label="Verify OTP"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                />
              )}
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                  className={`text-red-600 hover:underline ${
                    countdown > 0 || isResending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isResending
                    ? "Resending..."
                    : countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/log-in" className="text-red-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
