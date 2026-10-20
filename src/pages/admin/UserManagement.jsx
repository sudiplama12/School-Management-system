
import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../../api/axios";

// The fields listed here are the ones the account owner cannot change itself —
// the student profile screen only exposes phone and address, so the office has
// to be able to maintain the rest of the enrollment record.
const settings = {
  student: {
    title: "Student Management",
    singular: "Student",
    fields: [
      ["studentId", "Student ID"],
      ["className", "Class"],
      ["rollNumber", "Roll Number"],
      ["program", "Program"],
      ["semester", "Semester"],
      ["phone", "Phone"],
      ["address", "Address"],
    ],
  },
  teacher: {
    title: "Teacher Management",
    singular: "Teacher",
    fields: [
      ["teacherId", "Teacher ID"],
      ["subject", "Subject"],
      ["qualification", "Qualification"],
      ["assignedClasses", "Assigned Classes (comma-separated)"],
      ["phone", "Phone"],
      ["address", "Address"],
    ],
  },
  parent: {
    title: "Parent Management",
    singular: "Parent",
    fields: [
      ["parentId", "Parent ID"],
      ["childId", "Child Student ID"],
      ["phone", "Phone"],
      ["address", "Address"],
    ],
  },
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  studentId: "",
  className: "",
  rollNumber: "",
  program: "",
  semester: "",
  phone: "",
  address: "",
  teacherId: "",
  subject: "",
  qualification: "",
  assignedClasses: "",
  parentId: "",
  childId: "",
};

export default function UserManagement({ role }) {
  const config = settings[role];

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/users", {
        params: { role, search },
      });

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load accounts."
      );
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  }

  function openEdit(user) {
    setEditing(user);

    setForm({
      ...emptyForm,
      name: user.name || "",
      email: user.email || "",
      ...Object.fromEntries(
        config.fields.map(([field]) => [field, user[field] ?? ""])
      ),
      assignedClasses: (user.assignedClasses || []).join(", "),
    });

    setError("");
    setModal(true);
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveUser(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    for (const [field] of config.fields) {
      if (field === "assignedClasses") {
        payload[field] = form[field]
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
      } else {
        payload[field] = form[field].trim();
      }
    }

    if (form.password) {
      payload.password = form.password;
    }

    try {
      if (editing) {
        await api.patch(`/admin/users/${editing._id}`, payload);
      } else {
        if (form.password.length < 8) {
          setError("Password must contain at least 8 characters.");
          setSaving(false);
          return;
        }

        await api.post("/admin/users", {
          ...payload,
          role,
          password: form.password,
        });
      }

      setModal(false);
      setMessage(`${config.singular} saved successfully.`);
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save account."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/users/${user._id}`);
      setMessage("Account deleted successfully.");
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete account."
      );
    }
  }

  if (!config) {
    return <p className="p-6">Invalid account role.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Add, edit, search, and manage accounts.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} /> Add {config.singular}
        </button>
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

      <div className="relative rounded-2xl border border-slate-200 bg-card p-4">
        <Search
          size={18}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${config.singular.toLowerCase()}...`}
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
        <table className="w-full min-w-[650px]">
          <thead className="bg-slate-50">
            <tr>
              {["Name", "Email", "Status", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Loading accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No accounts found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {user.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Edit"
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:text-blue-300"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => removeUser(user)}
                        title="Delete"
                        className="rounded-lg bg-red-50 p-2 text-red-700 dark:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-6 w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editing ? "Edit" : "Add"} {config.singular}
              </h2>
              <button onClick={() => setModal(false)} aria-label="Close">
                <X />
              </button>
            </div>

            <form onSubmit={saveUser} className="space-y-4">
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              )}

              <Field label="Full name" name="name" value={form.name} onChange={updateField} required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} required />

              {!editing && (
                <Field
                  label="Initial password (minimum 8 characters)"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  required
                />
              )}

              {editing && (
                <Field
                  label="New password (optional)"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                />
              )}

              {config.fields.map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  name={field}
                  value={form[field]}
                  onChange={updateField}
                />
              ))}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={type === "password" ? 8 : undefined}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500"
      />
    </label>
  );
}
