import { useEffect, useState } from "react";
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function StudentDetails() {
  const { child: authChild } = useAuth();

  const [child, setChild] = useState(authChild || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (active) setChild(data?.user?.child || null);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message ||
              "Unable to load your child's details."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const dash = (value) => value || "—";
  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Student Details
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your child's academic and personal information.
        </p>

        {loading && (
          <p className="mt-1 text-sm text-slate-400">Loading…</p>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* PROFILE */}
      <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {child?.name ?? (loading ? "Loading…" : "No child linked")}
            </h2>

            <p className="text-sm text-slate-500">
              Student ID: {dash(child?.studentId)}
            </p>

            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Active Student
            </span>
          </div>

        </div>

      </div>

      {/* INFORMATION */}
      <div className="grid gap-5 md:grid-cols-2">

        <Info
          icon={GraduationCap}
          label="Program"
          value={dash(child?.program)}
        />

        <Info
          icon={BookOpen}
          label="Class"
          value={dash(child?.className)}
        />

        <Info
          icon={User}
          label="Section"
          value={dash(child?.section)}
        />

        <Info
          icon={User}
          label="Roll Number"
          value={dash(child?.rollNumber)}
        />

        <Info
          icon={Mail}
          label="Email"
          value={dash(child?.email)}
        />

        <Info
          icon={Phone}
          label="Phone"
          value={dash(child?.phone)}
        />

        <Info
          icon={CalendarDays}
          label="Admission Date"
          value={formatDate(child?.admissionDate)}
        />

        <Info
          icon={MapPin}
          label="Address"
          value={dash(child?.address)}
        />

      </div>

    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>

    </div>
  );
}