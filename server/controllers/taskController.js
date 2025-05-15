import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } =
      req.body;

    let text = "New project added!";
    if (team?.length > 1) {
      text += ` and ${team.length - 1} others.`;
    }

    text += ` The project priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
      date
    ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newLinks = links ? links.split(",") : [];

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
      links: newLinks,
      description,
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    const users = await User.find({ _id: team });

    if (users) {
      for (const user of users) {
        await User.findByIdAndUpdate(user._id, {
          $push: { tasks: task._id },
        });
      }
    }

    res
      .status(200)
      .json({ status: true, task, message: "Project created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await Task.findById(id);

    const text = ` The project priority is set a ${
      task.priority
    } priority, so check and act accordingly. The project date is ${new Date(
      task.date
    ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newTask = await Task.create({
      ...task.toObject(),
      title: "Duplicate - " + task.title,
      activities: activity,
    });

    await Notice.create({
      team: newTask.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Project duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, team, stage, priority, assets, links, description } =
    req.body;

  try {
    const task = await Task.findById(id);
    const newLinks = links ? links.split(",") : [];

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;
    task.links = newLinks;
    task.description = description;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const task = await Task.findById(id);
    task.stage = stage.toLowerCase();
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Project stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      { _id: taskId, "subTasks._id": subTaskId },
      { $set: { "subTasks.$.isCompleted": status } }
    );

    res.status(200).json({
      status: true,
      message: status
        ? "Sub-task marked completed"
        : "Sub-task marked uncompleted",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    task.subTasks.push({ title, tag, date, isCompleted: false });
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { stage, isTrashed, search } = req.query;

  let query = { isTrashed: isTrashed ? true : false };

  if (stage) query.stage = stage;

  if (search) {
    query = {
      ...query,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { stage: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ],
    };
  }

  const tasks = await Task.find(query)
    .populate({ path: "team", select: "name title email" })
    .sort({ _id: -1 });

  res.status(200).json({ status: true, tasks });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({ path: "team", select: "name title role email" })
      .populate({ path: "activities.by", select: "name" });

    res.status(200).json({ status: true, task });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  try {
    const task = await Task.findById(id);
    task.activities.push({ type, activity, by: userId });
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    task.isTrashed = true;
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task trashed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const task = await Task.findById(id);
      task.isTrashed = false;
      await task.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res
      .status(200)
      .json({ status: true, message: "Operation performed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    // Removed role restriction — all users get full access
    const allTasks = await Task.find({ isTrashed: false })
      .populate({ path: "team", select: "name role title email" })
      .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isActive createdAt")
      .limit(10)
      .sort({ _id: -1 });

    const groupedTasks = allTasks.reduce((result, task) => {
      result[task.stage] = (result[task.stage] || 0) + 1;
      return result;
    }, {});

    const graphData = Object.entries(
      allTasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const summary = {
      totalTasks: allTasks.length,
      last10Task: allTasks.slice(0, 10),
      users,
      tasks: groupedTasks,
      graphData,
    };

    res
      .status(200)
      .json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
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
};
