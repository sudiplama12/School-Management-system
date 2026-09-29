
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Search,
  User,
  Clock,
  Megaphone,
  ChevronRight,
  X,
} from "lucide-react";

export default function Notices() {
  const [search, setSearch] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Frontend demo data
  // Later this will come from the backend API.
  const notices = [
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      message:
        "A parent-teacher meeting will be conducted to discuss students' academic progress, attendance, and overall performance. Parents are requested to attend the meeting on time.",
      teacher: "Mrs. Sita Sharma",
      role: "Class Teacher",
      date: "2026-09-28",
      time: "10:30 AM",
      priority: "Important",
      category: "Meeting",
      isNew: true,
    },
    {
      id: 2,
      title: "Monthly Examination Notice",
      message:
        "The monthly examination will begin from October 5, 2026. Students are requested to prepare according to the examination schedule provided by the school.",
      teacher: "Mr. Ram Thapa",
      role: "Mathematics Teacher",
      date: "2026-09-25",
      time: "09:15 AM",
      priority: "Important",
      category: "Exam",
      isNew: true,
    },
    {
      id: 3,
      title: "School Holiday Notice",
      message:
        "The school will remain closed on October 2, 2026 due to a public holiday. Regular classes will resume from the following school day.",
      teacher: "School Administration",
      role: "Administration",
      date: "2026-09-23",
      time: "02:00 PM",
      priority: "Normal",
      category: "Holiday",
      isNew: false,
    },
    {
      id: 4,
      title: "Attendance Reminder",
      message:
        "Parents are requested to regularly check their child's attendance. Please contact the class teacher if your child is absent for any reason.",
      teacher: "Mr. Hari Gurung",
      role: "Class Teacher",
      date: "2026-09-20",
      time: "11:45 AM",
      priority: "Normal",
      category: "Attendance",
      isNew: false,
    },
    {
      id: 5,
      title: "School Program",
      message:
        "The school is organizing a student participation program this month. Detailed information regarding participation and schedule will be shared with students and parents.",
      teacher: "Mrs. Mina KC",
      role: "Coordinator",
      date: "2026-09-18",
      time: "01:20 PM",
      priority: "Normal",
      category: "Event",
      isNew: false,
    },
  ];

  const filteredNotices = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return notices;

    return notices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(keyword) ||
        notice.message.toLowerCase().includes(keyword) ||
        notice.teacher.toLowerCase().includes(keyword) ||
        notice.category.toLowerCase().includes(keyword)
    );
  }, [search]);

  const newNoticeCount = notices.filter((notice) => notice.isNew).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Bell className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Notices
                </h1>
                <p className="text-sm text-slate-500">
                  School announcements and notices for parents
                </p>
              </div>
            </div>
          </div>

          {/* New notice count */}
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <Bell className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">
              {newNoticeCount} New Notices
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Notice list */}
        <div className="space-y-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Megaphone className="h-6 w-6 text-emerald-600" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-800">
                        {notice.title}
                      </h2>

                      {notice.isNew && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          New
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          notice.priority === "Important"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {notice.priority}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {notice.message}
                    </p>

                    {/* Notice information */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>
                          {notice.teacher} · {notice.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(notice.date)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{notice.time}</span>
                      </div>

                      <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">
                        {notice.category}
                      </span>
                    </div>
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="flex shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
              <Bell className="mx-auto mb-4 h-12 w-12 text-slate-300" />

              <h3 className="text-lg font-semibold text-slate-700">
                No notices found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try searching with a different keyword.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div className="pr-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {selectedNotice.category}
                  </span>

                  {selectedNotice.isNew && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      New
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  {selectedNotice.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-7 text-slate-700">
                  {selectedNotice.message}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                    <User className="h-4 w-4" />
                    Posted By
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedNotice.teacher}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedNotice.role}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    Date & Time
                  </div>

                  <p className="font-semibold text-slate-800">
                    {formatDate(selectedNotice.date)}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedNotice.time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

