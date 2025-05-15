// Data.js
const tasks = [
  {
    _id: "6824d37c8d45ed7c740f3a63",
    title: "Test Project 2",
    date: "2025-01-01T00:00:00.000+00:00",
    priority: "high",
    stage: "todo",
    activities: [
      {
        description: "",
      },
    ],
    assets: [
      // File URLs or references can be added here
    ],
    links: [],
    team: ["user1", "user2"],
    isTrashed: false,
    subTasks: [],
    createdAt: "2025-05-14T17:31:40.007+00:00",
    updatedAt: "2025-05-14T17:31:40.007+00:00",
    __v: 0,
  },
];

export const getTasks = () => {
  return JSON.parse(localStorage.getItem("tasks")) || tasks;
};

export const saveTask = (taskData) => {
  const currentTasks = getTasks();
  currentTasks.push(taskData);
  localStorage.setItem("tasks", JSON.stringify(currentTasks));
};

export const updateTask = (updatedTask) => {
  let currentTasks = getTasks();
  currentTasks = currentTasks.map((task) =>
    task._id === updatedTask._id ? updatedTask : task
  );
  localStorage.setItem("tasks", JSON.stringify(currentTasks));
};

export const deleteTask = (_id) => {
  let currentTasks = getTasks();
  currentTasks = currentTasks.filter((task) => task._id !== _id);
  localStorage.setItem("tasks", JSON.stringify(currentTasks));
};
