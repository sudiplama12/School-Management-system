import {
  Bell,
  CalendarDays,
  Pin,
  Megaphone,
  ChevronRight,
} from "lucide-react";

const notices = [
  {
    id: 1,
    title: "Final Examination Schedule Published",
    description:
      "The final examination schedule for the 6th semester has been published. Students are requested to check their examination dates and prepare accordingly.",
    date: "September 12, 2026",
    category: "Academic",
    pinned: true,
  },
  {
    id: 2,
    title: "Assignment Submission Deadline",
    description:
      "All pending assignments must be submitted before the announced deadline. Late submissions may not be accepted.",
    date: "September 10, 2026",
    category: "Assignment",
    pinned: false,
  },
  {
    id: 3,
    title: "Internship & Job Opportunities",
    description:
      "New internship and job opportunities have been added to the student career portal.",
    date: "September 8, 2026",
    category: "Career",
    pinned: false,
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting",
    description:
      "A parent-teacher meeting will be conducted to discuss student academic progress and attendance.",
    date: "September 5, 2026",
    category: "Event",
    pinned: false,
  },
];

export default function Notice() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Communication
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          Notices
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Stay updated with the latest school announcements and
          important information.
        </p>
      </div>

      {/* Notice summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Notices
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {notices.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Pin className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Important
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {notices.filter((notice) => notice.pinned).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Megaphone className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Latest Update
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                Today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notices */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    {notice.category}
                  </span>

                  {notice.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-base font-semibold text-slate-900">
                  {notice.title}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                  {notice.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    {notice.date}
                  </div>

                  <button className="flex items-center gap-1 text-xs font-semibold text-amber-700 opacity-0 transition group-hover:opacity-100">
                    Read more
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}