import { Bell, Clock } from "lucide-react";

const notices = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    message:
      "The parent-teacher meeting will be held on Sunday at 11:00 AM.",
    className: "Grade 10 - A",
    createdAt: "Sep 17, 2026 • 3:45 PM",
  },
  {
    id: 2,
    title: "Mathematics Assignment",
    message:
      "A new Mathematics assignment has been posted.",
    className: "Grade 10 - A",
    createdAt: "Sep 17, 2026 • 1:20 PM",
  },
];

export default function Notices() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Notices
        </h1>

        <p className="mt-1 text-slate-500">
          Important notices from your teachers.
        </p>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="rounded-xl bg-emerald-100 p-3">
                <Bell className="text-emerald-600" size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {notice.title}
                </h2>

                <p className="mt-1 text-sm font-medium text-emerald-600">
                  {notice.className}
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  {notice.message}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={16} />
                  {notice.createdAt}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}