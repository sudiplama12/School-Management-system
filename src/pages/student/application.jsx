import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  CalendarDays,
  FileText,
  Clock,
} from "lucide-react";
import api from "../../api/axios";

const STATUS_STYLES = {
  applied: {
    label: "Applied",
    className: "bg-slate-100 text-slate-600",
    icon: FileText,
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-amber-50 text-amber-700 dark:text-amber-300",
    icon: Clock,
  },
  selected: {
    label: "Selected",
    className: "bg-emerald-50 text-emerald-600 dark:text-emerald-400",
    icon: Briefcase,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 dark:text-red-400",
    icon: Briefcase,
  },
};

const DEFAULT_STATUS = {
  label: "Unknown",
  className: "bg-slate-100 text-slate-500",
  icon: FileText,
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/jobs/my-applications")
      .then(({ data }) => {
        if (active) setApplications(data || []);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load your applications."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Career Center
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          My Applications
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track the vacancies you have applied to and their current status.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your applications…</p>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-card p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-4 font-semibold text-slate-800">
              No applications yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Vacancies you apply to will appear here.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ application }) {
  const job = application.job || {};

  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950">
            <Briefcase className="h-5 w-5 text-amber-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              {job.title || "Vacancy"}
            </h2>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Building2 className="h-4 w-4" />
              {job.company || "—"}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || "Location not set"}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {job.type}
              </span>

              {job.deadline && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Deadline: {formatDate(job.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>

        <StatusBadge status={application.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || DEFAULT_STATUS;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
