import React, { useState } from "react";
import moment from "moment";
import clsx from "clsx";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { UserInfo } from "../components";
import { BGS, PRIOTITYSTYELS, TASK_TYPE } from "../utils";

const RecommendedSection = ({ recommendedProjects }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recommendedProjects || recommendedProjects.length === 0) return null;

  const formatRemainingTime = (deadline) => {
    const duration = moment.duration(moment(deadline).diff(moment()));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) return `${days}d ${hours}h left`;
    else if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getVisibleProjects = () => {
    if (isExpanded) return recommendedProjects;
    return window.innerWidth >= 768
      ? recommendedProjects?.slice(0, 3)
      : recommendedProjects?.slice(0, 1);
  };

  const visibleProjects = getVisibleProjects();

  return (
    <div className="w-full bg-white my-8 p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl text-gray-500 font-bold">
          Recommended Projects
        </h4>
        {recommendedProjects.length > (window.innerWidth >= 768 ? 3 : 1) && (
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
              Deadline: {moment(project.date).format("MMM D, YYYY")}
              <span className="ml-2 text-red-500 font-medium">
                ({formatRemainingTime(project.date)})
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
  );
};

export default RecommendedSection;
