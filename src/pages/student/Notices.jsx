import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";
import api from "../../api/axios";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/notices")
      .then(({ data }) => {
        if (active) setNotices(data);
      })
      .catch((err) => {
        if (active)
          setError(err?.response?.data?.message || "Unable to load notices.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading notices…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-500">No notices for your class yet.</p>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="rounded-xl bg-emerald-100 p-3">
                  <Bell className="text-emerald-600 dark:text-emerald-400" size={22} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {notice.title}
                    </h2>
                    {notice.priority === "Important" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        Important
                      </span>
                    )}
                    {notice.isNew && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {notice.className || "Whole School"} · {notice.teacher}
                  </p>

                  <p className="mt-4 leading-7 text-slate-600">
                    {notice.message}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={16} />
                    {notice.date} • {notice.time}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}