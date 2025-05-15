import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useEffect } from "react";

const ROLES = [
  "Developer",
  "Designer",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Other"
];

const TITLES = [
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Principal",
  "Manager",
  "Director",
  "Other"
];

const SignUp = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const handleSignup = async (data) => {
    try {
      // Prepare the data to match your backend expectations
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        title: `${data.title} ${data.role}`,
        isAdmin: false // Default to false for security
      };

      const res = await registerUser(userData).unwrap();
      dispatch(setCredentials(res));
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      console.error("Registration error:", err);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black">
      <div className="w-full max-w-md mx-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title Level
                </label>
                <select
                  {...register("title", { required: "Title is required!" })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Title</option>
                  {TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  {...register("role", { required: "Role is required!" })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

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
              error={
                errors.confirmPassword ? errors.confirmPassword.message : ""
              }
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
