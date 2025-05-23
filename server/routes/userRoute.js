import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  getUserTaskStatus,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
  verifyOTP,
  resendOTP,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);

router.get("/get-team", protectRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);
router.get("/get-status", protectRoute, getUserTaskStatus);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

//   FOR ADMIN ONLY - ADMIN ROUTES
router
  .route("/:id")
  .put(protectRoute, activateUserProfile)
  .delete(protectRoute, deleteUserProfile);

export default router;
