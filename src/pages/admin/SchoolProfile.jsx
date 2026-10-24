import { useEffect, useState } from "react";
import { Building2, Save, LoaderCircle } from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FIELDS = [
  { name: "name", label: "School name", hint: "Shown on the sign-in page and every receipt." },
  { name: "shortName", label: "Short name", hint: "The initials used in the sidebar." },
  { name: "tagline", label: "Tagline" },
  { name: "address", label: "Address" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "session", label: "Current session" },
];

export default function SchoolProfile() {
  const { refreshUser } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/school");
        setForm(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load the school details.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading school details…
      </div>
    );
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(
        "/school",
        Object.fromEntries(FIELDS.map((field) => [field.name, form[field.name] ?? ""]))
      );

      setForm(data);

      // The shell's title, sidebar and reveal all read the school from the auth
      // context, so without this the new name only appears after a refresh.
      await refreshUser();
      setMessage("School details updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save the school details.");
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-700";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-card px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:text-emerald-400">
          <Building2 size={25} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">School Profile</h1>

          <p className="mt-1 text-sm text-slate-500">
            One record for the whole school. Everyone sees these changes the next time
            they sign in.
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.name === "name" ? "sm:col-span-2" : ""}>
              <label htmlFor={field.name} className={labelClass}>
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                value={form[field.name] || ""}
                onChange={(event) => update(field.name, event.target.value)}
                className={inputClass}
              />

              {field.hint && (
                <p className="mt-1.5 text-xs text-slate-400">{field.hint}</p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[13px] font-semibold text-slate-700">
              School code: {form.code || "not set"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Every account types this code to sign in, so it cannot be changed here — a
              typo would lock the whole school out.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
