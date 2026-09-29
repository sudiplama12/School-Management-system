import {
  Bell,
  CalendarDays,
} from "lucide-react";

export default function Notices() {
  const notices = [
    {
      title: "Semester Examination Notice",
      date: "2026-09-25",
      description:
        "The semester examination schedule has been published.",
    },
    {
      title: "Parent Meeting",
      date: "2026-09-20",
      description:
        "Parents are requested to attend the upcoming meeting.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Notices
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Important notices from the institution.
      </p>

      <div className="mt-6 space-y-4">

        {notices.map((notice) => (
          <div
            key={notice.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Bell className="h-5 w-5 text-emerald-600" />
              </div>

              <div>

                <h2 className="font-bold text-slate-800">
                  {notice.title}
                </h2>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {notice.date}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {notice.description}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}