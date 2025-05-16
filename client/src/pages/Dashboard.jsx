import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaNewspaper } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import { LuClipboardEdit } from "react-icons/lu";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { Chart, Loading, UserInfo } from "../components";
import { useGetDasboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import { useSelector } from "react-redux";

const Card = ({ label, count, bg, icon }) => {
  return (
    <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
      <div className="h-full flex flex-1 flex-col justify-between">
        <p className="text-base text-gray-600">{label}</p>
        <span className="text-2xl font-semibold">{count}</span>
        <span className="text-sm text-gray-400"> </span>
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center text-white",
          bg
        )}
      >
        {icon}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data, isLoading, error } = useGetDasboardStatsQuery();
  const { user } = useSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const totals = data?.tasks || [];

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  const stats = [
    {
      _id: "1",
      label: "TOTAL PROJECTS",
      total: data?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLTED PROJECTS",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROJECTS ",
      total: totals["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODOS",
      total: totals["todo"],
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]" || 0,
    },
  ];

  const formatRemainingTime = (deadline) => {
    const duration = moment.duration(moment(deadline).diff(moment()));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const recommendedProjects = data?.last10Task
    ?.filter(
      (task) =>
        (task.priority === "high" ||
          moment(task.deadline).diff(moment(), "days") <= 3) &&
        task.stage !== "completed"
    )
    .sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return (
        moment(a.deadline).diff(moment()) - moment(b.deadline).diff(moment())
      );
    });

  const getVisibleProjects = () => {
    if (isExpanded) return recommendedProjects;
    return window.innerWidth >= 768
      ? recommendedProjects?.slice(0, 3)
      : recommendedProjects?.slice(0, 1);
  };

  const visibleProjects = getVisibleProjects();

  return (
    <div className="h-full py-4">
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {stats?.map(({ icon, bg, label, total }, index) => (
            <Card key={index} icon={icon} bg={bg} label={label} count={total} />
          ))}
        </div>

        {recommendedProjects?.length > 0 && (
          <div className="w-full bg-white my-8 p-4 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl text-gray-500 font-bold">
                Recommended Projects
              </h4>
              {recommendedProjects.length >
                (window.innerWidth >= 768 ? 3 : 1) && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  {isExpanded ? (
                    <>
                      <MdExpandLess className="mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <MdExpandMore className="mr-1" /> Show More
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleProjects?.map((project) => (
                <div
                  key={project._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-lg">{project.title}</h5>
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-full text-xs",
                        PRIOTITYSTYELS[project.priority]
                      )}
                    >
                      {project.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Deadline: {moment(project.deadline).format("MMM D, YYYY")}
                    <span className="ml-2 text-red-500 font-medium">
                      ({formatRemainingTime(project.deadline)})
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className={clsx(
                            "w-8 h-8 rounded-full text-white flex items-center justify-center text-xs",
                            BGS[index % BGS.length]
                          )}
                        >
                          <UserInfo user={member} />
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span
                        className={clsx(
                          "px-2 py-1 rounded text-xs",
                          TASK_TYPE[project.stage]
                        )}
                      >
                        {project.stage}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full bg-white my-16 p-4 rounded shadow-sm">
          <h4 className="text-xl text-gray-500 font-bold mb-2">
            Chart by Priority
          </h4>
          <Chart data={data?.graphData} />
        </div>
        <div className="w-full flex flex-col gap-4 2xl:gap-10 py-8">
          {data && <TaskTable tasks={data?.last10Task} />}
        </div>
      </>
    </div>
  );
};

const TaskTable = ({ tasks }) => {
  const { user } = useSelector((state) => state.auth);

  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600">
      <tr className="text-black dark:text-white text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Team</th>
        <th className="py-2 hidden md:block">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className="text-base text-black dark:text-gray-400">
            {task?.title}
          </p>
        </div>
      </td>
      <td className="py-2">
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className="capitalize">{task?.priority}</span>
        </div>
      </td>

      <td className="py-2">
        <div className="flex">
          {task?.team.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className="py-2 hidden md:block">
        <span className="text-base text-gray-600">
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );

  return (
    <div
      className={clsx(
        "w-full bg-white dark:bg-[#1f1f1f] px-2 md:px-4 pt-4 pb-4 shadow-md rounded",
        user?.isAdmin ? "w-full" : ""
      )}
    >
      <table className="w-full">
        <TableHeader />
        <tbody className="">
          {tasks.map((task, id) => (
            <TableRow key={task?._id + id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
