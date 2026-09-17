import { useState } from "react";

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

/* =========================
   MOCK VACANCIES
========================= */

const initialJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Tech Solutions Nepal",
    location: "Kathmandu",
    type: "Internship",
    salary: "NPR 15,000/month",
    posted: "2 days ago",
    deadline: "September 25, 2026",
    openings: 2,
    postedBy: "Admin",
    postedByName: "School Admin",
    description:
      "We are looking for a motivated student interested in frontend development. The selected student will work on real-world web projects with the development team.",
    requirements: [
      "Basic knowledge of HTML, CSS and JavaScript",
      "Understanding of React.js",
      "Good communication skills",
    ],
    skills: ["React", "JavaScript", "HTML", "CSS"],
    applied: false,
  },

  {
    id: 2,
    title: "UI/UX Design Intern",
    company: "Creative Labs",
    location: "Remote",
    type: "Part-time",
    salary: "NPR 18,000/month",
    posted: "3 days ago",
    deadline: "September 28, 2026",
    openings: 1,
    postedBy: "Teacher",
    postedByName: "Mr. Sharma",
    description:
      "Creative Labs is looking for a UI/UX design intern to help create modern and user-friendly interfaces for web and mobile applications.",
    requirements: [
      "Basic knowledge of UI/UX principles",
      "Figma knowledge preferred",
      "Creative thinking",
    ],
    skills: ["Figma", "UI/UX", "Prototyping"],
    applied: false,
  },

  {
    id: 3,
    title: "Junior React Developer",
    company: "Digital Works",
    location: "Lalitpur",
    type: "Full-time",
    salary: "NPR 35,000/month",
    posted: "5 days ago",
    deadline: "October 5, 2026",
    openings: 3,
    postedBy: "Admin",
    postedByName: "School Admin",
    description:
      "Digital Works is hiring junior React developers to join its frontend development team and work on modern web applications.",
    requirements: [
      "Knowledge of React.js",
      "JavaScript ES6+",
      "Understanding of REST APIs",
    ],
    skills: ["React", "JavaScript", "REST API"],
    applied: false,
  },

  {
    id: 4,
    title: "Backend Developer Intern",
    company: "Cloud Nepal",
    location: "Kathmandu",
    type: "Internship",
    salary: "NPR 20,000/month",
    posted: "1 week ago",
    deadline: "September 30, 2026",
    openings: 2,
    postedBy: "Teacher",
    postedByName: "Mr. Rai",
    description:
      "Cloud Nepal is offering an internship opportunity for students interested in backend development using Node.js and MongoDB.",
    requirements: [
      "Basic Node.js knowledge",
      "Basic MongoDB knowledge",
      "Understanding of APIs",
    ],
    skills: ["Node.js", "Express", "MongoDB", "API"],
    applied: false,
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

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
      job.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      );

    const matchesType =
      type === "All" || job.type === type;

    return matchesSearch && matchesType;
  });

  /* =========================
     APPLY FOR VACANCY
  ========================= */

  const handleApply = (jobId) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applied: true,
            }
          : job
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vacancies, companies or skills..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white"
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

      {filtered.length > 0 ? (

        <div className="grid gap-5 lg:grid-cols-2">

          {filtered.map((job) => (

            <VacancyCard
              key={job.id}
              job={job}
              onApply={handleApply}
            />

          ))}

        </div>

      ) : (

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <Briefcase className="mx-auto h-10 w-10 text-slate-300" />

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

function VacancyCard({ job, onApply }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">

      {/* Top */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950">
          <Briefcase className="h-5 w-5 text-amber-400" />
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
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
          value={job.salary}
        />

        <InfoItem
          icon={CalendarDays}
          label="Deadline"
          value={job.deadline}
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

          <GraduationCap className="h-4 w-4 text-amber-600" />

          <p className="text-xs font-semibold text-slate-700">
            Requirements
          </p>

        </div>

        <ul className="mt-2 space-y-1">

          {job.requirements.map((requirement, index) => (

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

        {job.skills.map((skill) => (

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
            className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-600"
          >

            <CheckCircle2 className="h-4 w-4" />

            Applied

          </button>

        ) : (

          <button
            type="button"
            onClick={() => onApply(job.id)}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >

            <Send className="h-4 w-4" />

            Apply Now

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
    <div className="rounded-xl border border-slate-100 bg-white p-3">

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