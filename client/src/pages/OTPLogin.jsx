// src/pages/OTPLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { account } from "../appwrite";

const OTPLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsSending(true);
      await account.createMagicURLSession(
        "unique()",
        email,
        `${window.location.origin}/verify`
      );
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setIsVerifying(true);
      await account.updateMagicURLSession("current", otp);
      // If verification succeeds, you'll get a session
      // You can then redirect to dashboard or get user info
      navigate("/dashboard");
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-lg p-8">
          <div className="mb-8 text-center">
            <p className="text-red-600 text-3xl font-bold">OTP Login</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {otpSent
                ? "Enter the OTP sent to your email"
                : "Enter your email to receive OTP"}
            </p>
          </div>

          <div className="space-y-6">
            {!otpSent ? (
              <>
                <Textbox
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email Address"
                  className="w-full rounded-lg"
                />
                <Button
                  label={isSending ? <Loading /> : "Send OTP"}
                  onClick={handleSendOTP}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={isSending}
                />
              </>
            ) : (
              <>
                <Textbox
                  placeholder="123456"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  label="OTP"
                  className="w-full rounded-lg"
                />
                <Button
                  label={isVerifying ? <Loading /> : "Verify OTP"}
                  onClick={handleVerifyOTP}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={isVerifying}
                />
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Use different email
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Prefer password login?{" "}
            <a href="/login" className="text-red-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
