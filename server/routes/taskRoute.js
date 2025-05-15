import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/create", createTask);
router.post("/duplicate/:id", duplicateTask);
router.post("/activity/:id", postTaskActivity);

router.get("/dashboard", dashboardStatistics);
router.get("/", getTasks);
router.get("/:id", getTask);

router.put("/create-subtask/:id", createSubTask);
router.put("/update/:id", updateTask);
router.put("/change-stage/:id", updateTaskStage);
router.put(
  "/change-status/:taskId/:subTaskId",
  updateSubTaskStage
);
router.put("/:id", trashTask);

router.delete(
  "/delete-restore/:id?",

  deleteRestoreTask
);

export default router;
