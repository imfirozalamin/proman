import express from "express";
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
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", getTeamList);
router.get("/notifications", getNotificationsList);
router.get("/get-status", getUserTaskStatus);

router.put("/profile", updateUserProfile);
router.put("/read-noti", markNotificationRead);
router.put("/change-password",  changeUserPassword);
//   FOR ADMIN ONLY - ADMIN ROUTES
router
  .route("/:id")
  .put( activateUserProfile)
  .delete( deleteUserProfile);

export default router;
