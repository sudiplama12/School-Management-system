import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Repeat new password", autoComplete: "new-password" },
];

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Every account used to sign in with a password printed in the project README,
// and only the admin screen could change one — which refuses to edit the very
// account that is signed in. This is the way out for the office.
export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("The two new passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      await api.put("/profile/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      // The change invalidates the token this page was opened with, so staying
      // put would only produce a mysterious sign-out on the next click.
      logout();
      navigate("/login", {
        replace: true,
        state: { notice: "Password changed. Sign in with your new password." },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to change your password.");
      setSaving(false);
    }
  };

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-700";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-card px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Signing in here ends every other session on this account, so an
            old password left in a notebook stops working.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={(event) => update(field.name, event.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
