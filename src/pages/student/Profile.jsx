import { useState } from "react";



import {
  Camera,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit3,
  Save,
} from "lucide-react";

export default function Profile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Student",
    studentId: "STU-2049",
    email: "student@school.edu",
    phone: "+977 9800000000",
    course: "BSc Computer Science",
    semester: "6th Semester",
    address: "Biratnagar, Nepal",
  });

  const update = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Account
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your personal and academic information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-950 text-4xl font-bold text-amber-400">
              S
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
              {profile.course}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="font-semibold">Personal Information</h2>
              <p className="mt-1 text-xs text-slate-400">
                Your account information
              </p>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-slate-50"
            >
              {editing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save
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
              editing={editing}
              onChange={(v) => update("name", v)}
            />

            <Field
              label="Student ID"
              value={profile.studentId}
              editing={false}
            />

            <Field
              label="Email"
              value={profile.email}
              editing={editing}
              onChange={(v) => update("email", v)}
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
              editing={editing}
              onChange={(v) => update("course", v)}
              icon={GraduationCap}
            />

            <Field
              label="Semester"
              value={profile.semester}
              editing={editing}
            />

            <Field
              label="Address"
              value={profile.address}
              editing={editing}
              onChange={(v) => update("address", v)}
              icon={MapPin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, icon: Icon }) {
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
              ? "border-slate-300 bg-white focus:border-amber-500"
              : "border-slate-100 bg-slate-50 text-slate-600"
          }`}
        />
      </div>
    </div>
  );
}