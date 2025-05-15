import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useEffect } from "react";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      localStorage.setItem("jwtoken", res.token);
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black">
      <div className="w-full max-w-md mx-4">
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="bg-white dark:bg-slate-900 shadow-xl rounded-lg p-8"
        >
          <div className="mb-8 text-center">
            <p className="text-red-600 text-3xl font-bold">Pro Manage!</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Please enter your credentials
            </p>
          </div>

          <div className="space-y-6">
            <Textbox
              placeholder="email"
              type="email"
              name="email"
              label="Email Address"
              className="w-full rounded-lg"
              register={register("email", {
                required: "Required!",
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
                required: "Required!",
              })}
              error={errors.password ? errors.password?.message : ""}
            />

            <div className="text-right">
              <a href="#" className="text-sm text-red-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type="submit"
                label="Log in"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              />
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-red-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
