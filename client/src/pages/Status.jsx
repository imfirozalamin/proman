import React from "react";
import { Loading, Title } from "../components";
import moment from "moment";
import { useGetDasboardStatsQuery } from "../redux/slices/api/taskApiSlice";

const StatusPage = () => {
  // Use RTK Query to fetch dashboard stats including tasks
  const { data, isLoading, error } = useGetDasboardStatsQuery();

  // Extract tasks safely
  const tasks = data?.last10Task || [];

  // Count tasks by completion status, priority and date ranges
  const getCompletionStats = () => {
    const today = moment();
    const stats = {
      byPriority: {
        high: { completed: 0, total: 0 },
        medium: { completed: 0, total: 0 },
        low: { completed: 0, total: 0 },
      },
      byTimeframe: {
        overdue: { completed: 0, total: 0 },
        thisWeek: { completed: 0, total: 0 },
        nextWeek: { completed: 0, total: 0 },
        future: { completed: 0, total: 0 },
      },
      total: { completed: 0, total: 0 },
    };

    tasks.forEach((task) => {
      const isCompleted = task.stage === "completed";
      const dueDate = moment(task.deadline);
      const daysUntilDue = dueDate.diff(today, "days");

      // Count by priority
      if (stats.byPriority[task.priority]) {
        stats.byPriority[task.priority].total++;
        if (isCompleted) stats.byPriority[task.priority].completed++;
      }

      // Count by timeframe
      if (daysUntilDue < 0) {
        stats.byTimeframe.overdue.total++;
        if (isCompleted) stats.byTimeframe.overdue.completed++;
      } else if (daysUntilDue <= 7) {
        stats.byTimeframe.thisWeek.total++;
        if (isCompleted) stats.byTimeframe.thisWeek.completed++;
      } else if (daysUntilDue <= 14) {
        stats.byTimeframe.nextWeek.total++;
        if (isCompleted) stats.byTimeframe.nextWeek.completed++;
      } else {
        stats.byTimeframe.future.total++;
        if (isCompleted) stats.byTimeframe.future.completed++;
      }

      // Total counts
      stats.total.total++;
      if (isCompleted) stats.total.completed++;
    });

    return stats;
  };

  const stats = getCompletionStats();

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Category</th>
        <th className="py-2">Total Projects</th>
        <th className="py-2">Completed</th>
        <th className="py-2">Completion Rate</th>
      </tr>
    </thead>
  );

  const TableRow = ({ category, data }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-100">
      <td className="p-2 font-medium">{category}</td>
      <td className="p-2">{data.total}</td>
      <td className="p-2">{data.completed}</td>
      <td className="p-2">
        <span
          className={`px-2 py-1 rounded-full text-white ${
            data.total > 0
              ? data.completed / data.total >= 0.7
                ? "bg-green-600"
                : data.completed / data.total >= 0.4
                ? "bg-amber-600"
                : "bg-red-600"
              : "bg-gray-400"
          }`}
        >
          {data.total > 0
            ? `${Math.round((data.completed / data.total) * 100)}%`
            : "N/A"}
        </span>
      </td>
    </tr>
  );

  if (isLoading) return <Loading />;

  if (error)
    return (
      <div className="text-red-600 p-4">
        Error loading data. Please try again later.
      </div>
    );

  return (
    <div className="w-full md:px-1 px-0 mb-6">
      <div className="flex items-center justify-between mb-8">
        <Title title="Project Completion Status" />
      </div>

      <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
        <h3 className="text-lg font-semibold mb-4">By Priority</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full mb-5">
            <TableHeader />
            <tbody>
              <TableRow category="High Priority" data={stats.byPriority.high} />
              <TableRow
                category="Medium Priority"
                data={stats.byPriority.medium}
              />
              <TableRow category="Low Priority" data={stats.byPriority.low} />
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mb-4">By Deadline</h3>
        <div className="overflow-x-auto">
          <table className="w-full mb-5">
            <TableHeader />
            <tbody>
              <TableRow category="Overdue" data={stats.byTimeframe.overdue} />
              <TableRow
                category="Due This Week"
                data={stats.byTimeframe.thisWeek}
              />
              <TableRow
                category="Due Next Week"
                data={stats.byTimeframe.nextWeek}
              />
              <TableRow
                category="Future Projects"
                data={stats.byTimeframe.future}
              />
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Overall Completion</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {stats.total.completed}/{stats.total.total}
            </div>
            <div
              className={`text-xl font-semibold ${
                stats.total.total > 0
                  ? stats.total.completed / stats.total.total >= 0.7
                    ? "text-green-600"
                    : stats.total.completed / stats.total.total >= 0.4
                    ? "text-amber-600"
                    : "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {stats.total.total > 0
                ? `${Math.round(
                    (stats.total.completed / stats.total.total) * 100
                  )}%`
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
