
import { useEffect, useState } from "react";
import { ShieldCheck, Save } from "lucide-react";
import api from "../../api/axios";

const modules = [
  "students",
  "teachers",
  "parents",
  "attendance",
  "assignments",
  "notices",
  "reports",
];

const actions = ["view", "create", "edit", "delete"];

export default function Permissions() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);

      if (!userId && data.length) {
        setUserId(data[0]._id);
      }
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
  }, []);

  useEffect(() => {
    const user = users.find((item) => item._id === userId);
    const next = {};

    modules.forEach((moduleName) => {
      const value = user?.permissions?.[moduleName];
      next[moduleName] = Array.isArray(value) ? value : [];
    });

    setPermissions(next);
  }, [userId, users]);

  function togglePermission(moduleName, action) {
    setPermissions((current) => {
      const existing = current[moduleName] || [];

      return {
        ...current,
        [moduleName]: existing.includes(action)
          ? existing.filter((item) => item !== action)
          : [...existing, action],
      };
    });
  }

  async function savePermissions() {
    if (!userId) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.patch(`/admin/users/${userId}/permissions`, {
        permissions,
      });

      setMessage("Permissions saved successfully.");
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Role Permissions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage user access to school modules.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select user
        </label>

        <select
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Select an account</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} — {user.role} ({user.email})
            </option>
          ))}
        </select>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-card shadow-sm">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Module
              </th>
              {actions.map((action) => (
                <th
                  key={action}
                  className="px-4 py-4 text-center text-xs font-semibold uppercase text-slate-500"
                >
                  {action}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {modules.map((moduleName) => (
              <tr key={moduleName}>
                <td className="px-5 py-4 text-sm font-medium capitalize text-slate-700">
                  {moduleName}
                </td>

                {actions.map((action) => (
                  <td key={action} className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${action} ${moduleName}`}
                      checked={(permissions[moduleName] || []).includes(action)}
                      onChange={() =>
                        togglePermission(moduleName, action)
                      }
                      disabled={!userId}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex justify-end">
        <button
          onClick={savePermissions}
          disabled={!userId || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        The backend must enforce these permissions on protected API
        endpoints. Hiding a page or disabling a button is not sufficient
        security.
      </p>
    </div>
  );
}
