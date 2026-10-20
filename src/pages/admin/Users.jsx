
import { useEffect, useState } from "react";
import { Search, RefreshCw, Users as UsersIcon } from "lucide-react";
import api from "../../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users", {
        params: { search },
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [search]);

  const roleStyle = {
    admin: "bg-red-50 text-red-700 dark:text-red-300",
    teacher: "bg-blue-50 text-blue-700 dark:text-blue-300",
    student: "bg-emerald-50 text-emerald-700 dark:text-emerald-300",
    parent: "bg-teal-50 text-teal-700 dark:text-teal-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          All Users
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          View accounts across the school management system.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-card p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or username..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card shadow-sm">
        <table className="w-full min-w-[650px]">
          <thead className="bg-slate-50">
            <tr>
              {["User", "Email", "Role", "Status", "Joined"].map((title) => (
                <th
                  key={title}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  <Users className="mx-auto mb-2 text-slate-400" size={28} />
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {user.username || user._id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        roleStyle[user.role] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm capitalize text-slate-600">
                    {user.status || "active"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
