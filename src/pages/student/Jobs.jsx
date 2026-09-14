import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  SlidersHorizontal,
} from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Tech Solutions Nepal",
    location: "Kathmandu",
    type: "Internship",
    salary: "NPR 15,000/month",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "UI/UX Design Intern",
    company: "Creative Labs",
    location: "Remote",
    type: "Part-time",
    salary: "NPR 18,000/month",
    posted: "3 days ago",
  },
  {
    id: 3,
    title: "Junior React Developer",
    company: "Digital Works",
    location: "Lalitpur",
    type: "Full-time",
    salary: "NPR 35,000/month",
    posted: "5 days ago",
  },
  {
    id: 4,
    title: "Backend Developer Intern",
    company: "Cloud Nepal",
    location: "Kathmandu",
    type: "Internship",
    salary: "NPR 20,000/month",
    posted: "1 week ago",
  },
];

export default function Jobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      type === "All" || job.type === type;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Career Center
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium">
          Find your next opportunity
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Explore internships and jobs matched to your skills.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs or companies..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none"
            >
              <option>All</option>
              <option>Internship</option>
              <option>Part-time</option>
              <option>Full-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
                <Briefcase className="h-5 w-5 text-amber-400" />
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {job.type}
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              {job.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {job.company}
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {job.posted}
              </span>
            </div>

            <div className="mt-4 text-sm font-semibold text-slate-700">
              {job.salary}
            </div>

            <button
              onClick={() => navigate(`/student/jobs/${job.id}`)}
              className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View Job
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-semibold">No jobs found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try another search or filter.
          </p>
        </div>
      )}
    </div>
  );
}