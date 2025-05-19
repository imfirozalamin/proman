import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { account } from "../appwrite";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await account.updateVerification(userId, secret);
        toast.success("Email verified successfully! You can now log in.");
        navigate("/log-in");
      } catch (error) {
        toast.error("Verification failed. The link may be invalid or expired.");
        navigate("/sign-up");
      }
    };

    if (userId && secret) {
      verifyEmail();
    } else {
      navigate("/sign-up");
    }
  }, [userId, secret, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="text-center">
        <p className="text-lg">Verifying your email...</p>
      </div>
    </div>
  );
};

export default Verify;
