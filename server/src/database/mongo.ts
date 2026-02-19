import { useMemo, useState, useRef, useEffect } from "react";
import { useContext } from "react";
import DashHeader from "../components/DashHeader";
import AddTaskForm from "../components/AddTaskForm";
import SearchBar from "../components/SearchBar";
import TaskList from "../components/TaskList";
import { AuthContext } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import TaskSkeleton from "../components/TaskSkeleton";

const Dashboard = () => {
  const { user, logout, isLoggingOut } = useContext(AuthContext);
  const loadMoreRef = useRef(null);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const {
    tasks,
    hasMore,
    loading,
    loadingMore,
    addTask,
    editTask,
    removeTask,
    loadMore,
    limit,
  } = useTasks();

  // Scroll to loading skeleton when loading more
  useEffect(() => {
    if (loadingMore && loadMoreRef.current) {
      setTimeout(() => {
        loadMoreRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [loadingMore]);

  // Client-side filtering (only for search/date)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!dateFilter) return matchesSearch;

      const taskDate = new Date(t.createdAt).toISOString().split("T")[0];
      const matchesDate = taskDate === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [tasks, search, dateFilter]);

  const handleUpdateTask = async (taskId, updates) => {
    setUpdatingTaskId(taskId);
    try {
      await editTask(taskId, updates);
    } finally {
      setTimeout(() => setUpdatingTaskId(null), 500);
    }
  };

  const handleToggleComplete = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      handleUpdateTask(taskId, { completed: !task.completed });
    }
  };

  const clearDateFilter = () => setDateFilter("");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Logging out...</p>
          </div>
        </div>
      )}

      <DashHeader userName={user?.name} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-6 pb-12">
        <AddTaskForm onAdd={addTask} />

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            {dateFilter && (
              <button
                onClick={clearDateFilter}
                className="px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear date filter"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {dateFilter && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
            <span>
              Showing tasks created on{" "}
              {new Date(dateFilter).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <button
              onClick={clearDateFilter}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3">
            <TaskList
              tasks={filteredTasks}
              onDelete={removeTask}
              onToggle={handleToggleComplete}
              onUpdate={handleUpdateTask}
              updatingTaskId={updatingTaskId}
            />

            {/* Loading skeleton */}
            {loadingMore && (
              <div ref={loadMoreRef} className="space-y-3 mt-3">
                {Array.from({ length: limit }).map((_, index) => (
                  <TaskSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          {hasMore && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading more tasks...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Load More Tasks
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
      <div className="mt-100"></div>
    </div>
  );
};

export default Dashboard;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

export const useTasks = () => {
  const { user } = useContext(AuthContext);
  const limit = 3;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["tasks", page, limit],
    queryFn: () => fetchTasks(page, limit),
    enabled: !!user,
    keepPreviousData: true,
  });

  // Merge pages into one list
  const allTasks = queryClient.getQueryData(["allTasks"]) || [];

  if (data?.tasks) {
    const existingIds = new Set(allTasks.map((t) => t._id));
    const newTasks = data.tasks.filter((t) => !existingIds.has(t._id));

    if (newTasks.length) {
      queryClient.setQueryData(["allTasks"], [...allTasks, ...newTasks]);
    }
  }

  const tasks = queryClient.getQueryData(["allTasks"]) || [];

  // ➕ Add
  const addTaskMutation = useMutation({
    mutationFn: ({ title, description }) => createTask(title, description),
    onSuccess: (newTask) => {
      queryClient.setQueryData(["allTasks"], (old = []) => [newTask, ...old]);
    },
  });

  // ✏️ Edit
  const editTaskMutation = useMutation({
    mutationFn: ({ id, updates }) => updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previous = queryClient.getQueryData(["allTasks"]) || [];

      queryClient.setQueryData(
        ["allTasks"],
        previous.map((t) => (t._id === id ? { ...t, ...updates } : t))
      );

      return { previous };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["allTasks"], ctx.previous);
    },
  });

  // ❌ Delete (FIXED)
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => deleteTask(id),

    onMutate: async (id) => {
      setDeletingTaskId(id);
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previous = queryClient.getQueryData(["allTasks"]) || [];

      queryClient.setQueryData(
        ["allTasks"],
        previous.filter((t) => t._id !== id)
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(["allTasks"], ctx.previous);
    },

    onSettled: () => {
      setDeletingTaskId(null);
    },
  });

  const loadMore = () => setPage((p) => p + 1);

  return {
    tasks,
    deletingTaskId,
    hasMore: data ? page < data.totalPages : false,
    loading: isLoading && page === 1,
    loadingMore: isFetching && page > 1,
    limit,

    loadMore,

    addTask: (title, description) =>
      addTaskMutation.mutateAsync({ title, description }),
    editTask: (id, updates) => editTaskMutation.mutateAsync({ id, updates }),
    removeTask: (id) => deleteTaskMutation.mutateAsync(id),
  };
};


import axiosInstance from "../api/axios";

// Get all tasks
export const fetchTasks = async (page = 1, limit = 5) => {
  const res = await axiosInstance.get(`/tasks?page=${page}&limit=${limit}`);
  return res.data;
};

// Create a new task
export const createTask = async (title, description) => {
  const res = await axiosInstance.post("/tasks", { title, description });
  return res.data;
};

// Update a task
export const updateTask = async (id, updates) => {
  const res = await axiosInstance.put(`/tasks/${id}`, updates);
  return res.data;
};

// Delete a task
export const deleteTask = async (id) => {
  await axiosInstance.delete(`/tasks/${id}`);
};
