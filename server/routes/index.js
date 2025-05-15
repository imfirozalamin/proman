import express from "express";
import userRoutes from "./userRoute.js";
import taskRoutes from "./taskRoute.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "API working" });
});
router.use("/user", userRoutes);
router.use("/task", taskRoutes);

export default router;
