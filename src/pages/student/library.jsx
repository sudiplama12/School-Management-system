import { useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  BookMarked,
} from "lucide-react";

const resources = [
  {
    id: 1,
    title: "Database Management Systems",
    author: "Raghu Ramakrishnan",
    category: "Database",
    type: "Book",
    status: "Available",
    description:
      "A useful reference for database concepts, SQL, normalization, and database design.",
  },
  {
    id: 2,
    title: "Web Technology",
    author: "Academic Resource",
    category: "Web Development",
    type: "PDF",
    status: "Available",
    description:
      "Study material covering HTML, CSS, JavaScript, web development, and modern web concepts.",
  },
  {
    id: 3,
    title: "Software Engineering",
    author: "Ian Sommerville",
    category: "Software Engineering",
    type: "Book",
    status: "Borrowed",
    dueDate: "September 20, 2026",
    description:
      "Reference material for software processes, requirements, design, testing, and maintenance.",
  },
  {
    id: 4,
    title: "Computer Networks",
    author: "Academic Resource",
    category: "Networking",
    type: "PDF",
    status: "Available",
    description:
      "Networking fundamentals including protocols, architectures, routing, and network security.",
  },
  {
    id: 5,
    title: "Artificial Intelligence Fundamentals",
    author: "Academic Resource",
    category: "Artificial Intelligence",
    type: "Book",
    status: "Available",
    description:
      "Introduction to artificial intelligence, machine learning, search algorithms, and intelligent systems.",
  },
  {
    id: 6,
    title: "Computer Security",
    author: "Academic Resource",
    category: "Security",
    type: "PDF",
    status: "Available",
    description:
      "Learning resources about cybersecurity, authentication, threats, encryption, and network security.",
  },
];

const categories = [
  "All",
  "Database",
  "Web Development",
  "Software Engineering",
  "Networking",
  "Artificial Intelligence",
  "Security",
];

export default function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory =
        category === "All" || resource.category === category;

      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.author.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const availableCount = resources.filter(
    (resource) => resource.status === "Available"
  ).length;

  const borrowedCount = resources.filter(
    (resource) => resource.status === "Borrowed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Academic Resources
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          Library
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Browse books, study materials, and academic resources.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Resources"
          value={resources.length}
        />

        <StatCard
          icon={CheckCircle2}
          label="Available"
          value={availableCount}
        />

        <StatCard
          icon={BookMarked}
          label="Borrowed"
          value={borrowedCount}
        />
      </div>

      {/* Search + Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, authors, categories..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Library Resources
          </h2>

          <p className="text-xs text-slate-400">
            {filteredResources.length} resource
            {filteredResources.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No resources found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try another search term or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Icon className="h-5 w-5 text-amber-600" />
        </div>

        <div>
          <p className="text-xs text-slate-400">{label}</p>

          <p className="mt-1 text-xl font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource }) {
  const isAvailable = resource.status === "Available";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm">
      <div className="flex gap-4">
        {/* Book Icon */}
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950">
          <BookOpen className="h-5 w-5 text-amber-400" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Category + Type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              {resource.category}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {resource.type}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            {resource.title}
          </h3>

          {/* Author */}
          <p className="mt-1 text-xs font-medium text-slate-500">
            {resource.author}
          </p>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {resource.description}
          </p>

          {/* Status */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              {isAvailable ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Available
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <Clock className="h-4 w-4" />
                    Borrowed
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Due: {resource.dueDate}
                  </p>
                </div>
              )}
            </div>

            {/* Action */}
            {isAvailable ? (
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                {resource.type === "PDF" ? (
                  <>
                    <Download className="h-4 w-4" />
                    Download
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    View
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400"
              >
                Currently Borrowed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}