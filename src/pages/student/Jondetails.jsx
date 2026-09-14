import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

const job = {
  id: 1,
  title: "Frontend Developer Intern",
  company: "Tech Solutions Nepal",
  location: "Kathmandu",
  type: "Internship",
  salary: "NPR 15,000/month",
  posted: "2 days ago",
  description:
    "We are looking for a motivated student who enjoys building modern web applications using React and JavaScript.",
  requirements: [
    "Basic knowledge of React",
    "HTML, CSS and JavaScript",
    "Understanding of Git and GitHub",
    "Good communication skills",
    "Willingness to learn",
  ],
};

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate("/student/jobs")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      <section className="rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500">
              <Briefcase className="h-6 w-6 text-slate-950" />
            </div>

            <p className="mt-6 text-sm text-slate-400">
              {job.company}
            </p>

            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
              {job.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>

              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {job.type}
              </span>

              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/student/applications")}
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
          >
            Apply Now
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold">About this role</h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {job.description}
          </p>

          <h2 className="mt-8 text-lg font-semibold">
            Requirements
          </h2>

          <div className="mt-4 space-y-3">
            {job.requirements.map((requirement) => (
              <div
                key={requirement}
                className="flex items-center gap-3 text-sm text-slate-600"
              >
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                {requirement}
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-2xl border bg-white p-6">
          <h3 className="font-semibold">Job Summary</h3>

          <div className="mt-5 space-y-5">
            <Summary label="Company" value={job.company} />
            <Summary label="Location" value={job.location} />
            <Summary label="Job Type" value={job.type} />
            <Summary label="Salary" value={job.salary} />
            <Summary label="Posted" value={job.posted} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}