import { useEffect, useState } from "react";

import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  SlidersHorizontal,
  CalendarDays,
  Users,
  GraduationCap,
  CheckCircle2,
  Send,
  Building2,
  UserCircle,
} from "lucide-react";
import api from "../../api/axios";

/* =========================
   DATE HELPERS
========================= */

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

const formatPosted = (value) => {
  if (!value) return "";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const days = Math.floor((Date.now() - then) / 86400000);

  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  /* =========================
     LOAD VACANCIES
  ========================= */

  useEffect(() => {
    let active = true;

    setLoading(true);

    api
      .get("/jobs")
      .then(({ data }) => {
        if (!active) return;

        setJobs(
          (data || []).map((job) => ({
            ...job,
            deadline: formatDate(job.deadline),
            posted: formatPosted(job.createdAt),
          }))
        );
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load vacancies."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  /* =========================
     FILTER JOBS
  ========================= */

  const filtered = jobs.filter((job) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      (job.skills || []).some((skill) =>
        skill.toLowerCase().includes(query)
      );

    const matchesType =
      type === "All" || job.type === type;

    return matchesSearch && matchesType;
  });

  /* =========================
     APPLY FOR VACANCY
  ========================= */

  const markApplied = (jobId) =>
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId ? { ...job, applied: true } : job
      )
    );

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setError("");

    try {
      await api.post(`/jobs/${jobId}/apply`);
      markApplied(jobId);
    } catch (err) {
      const status = err?.response?.status;

      // Already applied is the desired end state, so reflect it as applied.
      if (status === 409) {
        markApplied(jobId);
      } else if (status === 400) {
        setError(err?.response?.data?.message || "This vacancy is closed.");
      } else {
        setError(
          err?.response?.data?.message || "Unable to apply right now."
        );
      }
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Career Center
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          Vacancies & Opportunities
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Find internships and job opportunities posted by your
          school administration and teachers.
        </p>
      </div>

      {/* ================= SEARCH ================= */}

      <div className="rounded-2xl border border-slate-200 bg-card p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vacancies, companies or skills..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-card"
            />

          </div>

          {/* Type */}

          <div className="relative">

            <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none focus:border-amber-500"
            >
              <option value="All">All Opportunities</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Full-time">Full-time</option>
            </select>

          </div>

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* ================= RESULT COUNT ================= */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-semibold text-slate-900">
            Available Vacancies
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {filtered.length} opportunity
            {filtered.length !== 1 ? "ies" : "y"} found
          </p>
        </div>

      </div>

      {/* ================= VACANCY CARDS ================= */}

      {loading ? (

        <p className="text-sm text-slate-500">Loading vacancies…</p>

      ) : filtered.length > 0 ? (

        <div className="grid gap-5 lg:grid-cols-2">

          {filtered.map((job) => (

            <VacancyCard
              key={job.id}
              job={job}
              onApply={handleApply}
              applying={applyingId === job.id}
            />

          ))}

        </div>

      ) : (

        <div className="rounded-2xl border border-slate-200 bg-card p-12 text-center">

          <Briefcase className="mx-auto h-10 w-10 text-slate-400" />

          <p className="mt-4 font-semibold text-slate-800">
            No vacancies found
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Try another search or filter.
          </p>

        </div>

      )}

    </div>
  );
}

/* =========================
   VACANCY CARD
========================= */

function VacancyCard({ job, onApply, applying }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-6 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">

      {/* Top */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950">
          <Briefcase className="h-5 w-5 text-amber-400" />
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {job.type}
        </span>

      </div>

      {/* Title */}

      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        {job.title}
      </h2>

      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">

        <Building2 className="h-4 w-4" />

        {job.company}

      </div>

      {/* Posted By */}

      <div className="mt-3 flex items-center gap-2">

        <UserCircle className="h-4 w-4 text-slate-400" />

        <p className="text-xs text-slate-500">

          Posted by{" "}

          <span className="font-semibold text-slate-700">
            {job.postedByName}
          </span>

          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {job.postedBy}
          </span>

        </p>

      </div>

      {/* Basic Information */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <InfoItem
          icon={MapPin}
          label="Location"
          value={job.location}
        />

        <InfoItem
          icon={Users}
          label="Openings"
          value={`${job.openings} position${
            job.openings > 1 ? "s" : ""
          }`}
        />

        <InfoItem
          icon={Clock}
          label="Salary"
          value={job.salary || "Not specified"}
        />

        <InfoItem
          icon={CalendarDays}
          label="Deadline"
          value={job.deadline || "Not specified"}
        />

      </div>

      {/* Vacancy Description */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Vacancy Information
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {job.description}
        </p>

      </div>

      {/* Requirements */}

      <div className="mt-5">

        <div className="flex items-center gap-2">

          <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />

          <p className="text-xs font-semibold text-slate-700">
            Requirements
          </p>

        </div>

        <ul className="mt-2 space-y-1">

          {(job.requirements || []).map((requirement, index) => (

            <li
              key={index}
              className="flex items-start gap-2 text-xs text-slate-500"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

              {requirement}

            </li>

          ))}

        </ul>

      </div>

      {/* Skills */}

      <div className="mt-4 flex flex-wrap gap-2">

        {(job.skills || []).map((skill) => (

          <span
            key={skill}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
          >
            {skill}
          </span>

        ))}

      </div>

      {/* Footer */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

        <p className="text-xs text-slate-400">
          Posted {job.posted}
        </p>

        {job.applied ? (

          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >

            <CheckCircle2 className="h-4 w-4" />

            Applied

          </button>

        ) : (

          <button
            type="button"
            disabled={applying}
            onClick={() => onApply(job.id)}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >

            <Send className="h-4 w-4" />

            {applying ? "Applying…" : "Apply Now"}

          </button>

        )}

      </div>

    </div>
  );
}

/* =========================
   INFO ITEM
========================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-card p-3">

      <div className="flex items-center gap-1.5 text-slate-400">

        <Icon className="h-3.5 w-3.5" />

        <span className="text-[10px] font-medium">
          {label}
        </span>

      </div>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}