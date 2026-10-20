import { useEffect, useState } from "react";

import {
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit3,
  Save,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// The student owns their contact details only. Name, email, program and
// semester are enrollment records kept by the administration, so they render
// as read-only here and the backend rejects a change to them.
const EDITABLE_FIELDS = ["phone", "address"];

const readForm = (user, studentId) => ({
  name: user?.name || "",
  studentId: user?.studentId || studentId || "",
  email: user?.email || "",
  phone: user?.phone || "",
  course: user?.program || "",
  semester: user?.semester || "",
  className: user?.className || "",
  address: user?.address || "",
});

export default function Profile() {
  const { user, studentId, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState(() => readForm(user, studentId));

  // The auth context refreshes the account from the database on load, so the
  // form follows it whenever a fresher copy arrives — unless a draft is open.
  useEffect(() => {
    if (!editing) setProfile(readForm(user, studentId));
  }, [user, studentId, editing]);

  const update = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const { data } = await api.patch(
        "/profile",
        Object.fromEntries(
          EDITABLE_FIELDS.map((field) => [field, profile[field]])
        )
      );

      setProfile(readForm(data, data?.studentId));

      // Leaving edit mode repopulates the form from the auth context, so the
      // saved record has to be in the context first or the old values reappear.
      await refreshUser();
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEditing = () => {
    if (editing) {
      handleSave();
      return;
    }

    setError("");
    setSaved(false);
    setEditing(true);
  };

  const initials = profile.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Account
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Keep your contact details up to date. Academic records are maintained
          by the school office.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {saved && !error && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          Your contact details have been updated.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-950 text-4xl font-bold text-amber-400">
              {initials}
            </div>

            <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <h2 className="mt-5 font-semibold text-slate-900">
            {profile.name}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {profile.studentId}
          </p>

          <div className="mt-5 border-t pt-5">
            <p className="text-xs text-slate-400">Current Program</p>
            <p className="mt-1 text-sm font-medium">
              {profile.course || "Not recorded"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400">Class</p>
            <p className="mt-1 text-sm font-medium">
              {profile.className || "Not assigned"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-slate-200 bg-card">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="font-semibold">Personal Information</h2>
              <p className="mt-1 text-xs text-slate-400">
                Your account information
              </p>
            </div>

            <button
              onClick={toggleEditing}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              {editing ? (
                <>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save"}
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <Field
              label="Full Name"
              value={profile.name}
              editing={false}
              locked
            />

            <Field
              label="Student ID"
              value={profile.studentId}
              editing={false}
              locked
            />

            <Field
              label="Email"
              value={profile.email}
              editing={false}
              locked
              icon={Mail}
            />

            <Field
              label="Phone"
              value={profile.phone}
              editing={editing}
              onChange={(v) => update("phone", v)}
              icon={Phone}
            />

            <Field
              label="Program"
              value={profile.course}
              editing={false}
              locked
              icon={GraduationCap}
            />

            <Field
              label="Semester"
              value={profile.semester}
              editing={false}
              locked
            />

            <Field
              label="Address"
              value={profile.address}
              editing={editing}
              onChange={(v) => update("address", v)}
              icon={MapPin}
            />
          </div>

          <div className="flex items-start gap-3 border-t bg-slate-50/70 p-6">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

            <p className="text-xs leading-relaxed text-slate-500">
              Name, email, program and semester are part of your official
              enrollment record and can only be changed by the school
              administration.
              {editing && " You can edit your phone number and address."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, icon: Icon, locked }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          disabled={!editing}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`h-11 w-full rounded-xl border px-4 text-sm outline-none ${
            Icon ? "pl-10" : ""
          } ${
            editing
              ? "border-slate-300 bg-card focus:border-amber-500"
              : "border-slate-100 bg-slate-50 text-slate-600"
          }`}
        />

        {locked && (
          <span className="absolute -top-2 right-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Office
          </span>
        )}
      </div>
    </div>
  );
}
