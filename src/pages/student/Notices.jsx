import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";
import api from "../../api/axios";
import { Tear } from "../../components/Motion";
import { Pin } from "../../components/Paper";
import { sheetProps } from "../../utils/paper";

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

      <div className="qd-board space-y-6 p-5 pt-7 sm:p-7 sm:pt-9">
        {loading ? (
          <p className="text-sm text-[color:var(--qd-kraft-type)]">Loading notices…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-[color:var(--qd-kraft-type)]">
            No notices for your class yet.
          </p>
        ) : (
          notices.map((notice, index) => (
            <Tear
              key={notice.id}
              as="article"
              index={index}
              {...sheetProps(index, { fold: true })}
            >
              <Pin />

              <div className="flex gap-4 px-5 py-5 sm:px-7">
                <div className="shrink-0 text-[color:var(--qd-sheet-muted)]">
                  <Bell size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {notice.title}
                    </h2>

                    {/* Not a chip: on paper an urgent notice is ringed in red
                        pen and a fresh one has today's date scribbled by it. */}
                    {notice.priority === "Important" && (
                      <span className="qd-hand rounded-full border-2 border-[#a52a37] px-2 text-sm leading-6 text-[#a52a37]">
                        Important
                      </span>
                    )}
                    {notice.isNew && (
                      <span className="qd-hand text-base leading-none text-[color:var(--qd-pen)]">
                        new
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-[color:var(--qd-pen)]">
                    {notice.className || "Whole School"} · {notice.teacher}
                  </p>

                  <p className="mt-4 leading-7">{notice.message}</p>

                  <div className="qd-hand mt-4 flex items-center gap-2 text-base text-[color:var(--qd-sheet-muted)]">
                    <Clock size={16} />
                    {notice.date} • {notice.time}
                  </div>
                </div>
              </div>
            </Tear>
          ))
        )}
      </div>
    </div>
  );
}