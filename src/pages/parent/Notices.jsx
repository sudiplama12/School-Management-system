
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Search,
  User,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { AnimatePresence, Fade, Pop, Tear } from "../../components/Motion";
import { Pin } from "../../components/Paper";
import { sheetProps } from "../../utils/paper";

export default function Notices() {
  const [search, setSearch] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
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

  const filteredNotices = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return notices;

    return notices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(keyword) ||
        notice.message.toLowerCase().includes(keyword) ||
        (notice.teacher || "").toLowerCase().includes(keyword) ||
        notice.category.toLowerCase().includes(keyword)
    );
  }, [search, notices]);

  const newNoticeCount = notices.filter((notice) => notice.isNew).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Bell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
          <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-slate-700">
              {newNoticeCount} New Notices
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-slate-200">
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

        {/* Notice list: the board outside the staff room, with the parent's
            child's notices pinned to it. */}
        <div className="qd-board space-y-6 p-4 pt-6 sm:p-6 sm:pt-8">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => (
              <Tear
                key={notice.id}
                as="article"
                index={index}
                {...sheetProps(index, {
                  fold: true,
                  className: "group transition hover:shadow-lg",
                })}
              >
                <Pin />

                <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start">
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {notice.title}
                      </h2>

                      {/* On paper a priority is ringed in pen, not a coloured
                          pill — and every accent tint in this app flips under
                          `.dark`, which paper must not do. */}
                      {notice.isNew && (
                        <span className="qd-hand text-base leading-none text-[color:var(--qd-pen)]">
                          new
                        </span>
                      )}

                      <span
                        className={`qd-hand rounded-full border-2 px-2 text-sm leading-6 ${
                          notice.priority === "Important"
                            ? "border-[#a52a37] text-[#a52a37]"
                            : "border-[color:var(--qd-sheet-muted)] text-[color:var(--qd-sheet-muted)]"
                        }`}
                      >
                        {notice.priority}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-6">
                      {notice.message}
                    </p>

                    {/* Notice information */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[color:var(--qd-sheet-muted)]">
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

                      <span className="qd-hand text-base leading-none">
                        {notice.category}
                      </span>
                    </div>
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="flex shrink-0 items-center justify-center gap-1 rounded-sm border border-[#1f3a63] px-4 py-2.5 text-sm font-medium text-[color:var(--qd-pen)] transition hover:bg-[#1f3a63] hover:text-[#fbf5e4]"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </Tear>
            ))
          ) : (
            <div
              {...sheetProps(0, {
                fold: true,
                className: "px-6 py-14 text-center",
              })}
            >
              <Bell className="mx-auto mb-4 h-12 w-12 text-[color:var(--qd-sheet-muted)]" />

              <h3 className="text-lg font-semibold">
                {error ? "Could not load notices" : loading ? "Loading notices" : "No notices found"}
              </h3>

              <p className="mt-1 text-sm text-[color:var(--qd-sheet-muted)]">
                {error || (loading ? "Please wait…" : "Try searching with a different keyword.")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notice Details: the sheet taken off the board and read at a desk.
          Straight, not tilted — a page held up to read is held straight. */}
      <AnimatePresence>
        {selectedNotice && (
          <Fade className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <Pop
              origin="center"
              className="qd-sheet qd-sheet-fold qd-scrollbar max-h-[90dvh] w-full max-w-2xl overflow-y-auto"
            >
              <Pin />

              <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-7">
                <div className="pr-4">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="qd-hand text-base leading-none text-[color:var(--qd-sheet-muted)]">
                      {selectedNotice.category}
                    </span>

                    {selectedNotice.isNew && (
                      <span className="qd-hand text-base leading-none text-[color:var(--qd-pen)]">
                        new
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold">
                    {selectedNotice.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedNotice(null)}
                  aria-label="Close notice"
                  className="rounded-sm p-2 text-[color:var(--qd-sheet-muted)] transition hover:bg-[#1f3a63]/10 hover:text-[color:var(--qd-pen)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6 px-6 pb-6">
                <p className="border-y border-[color:var(--qd-sheet-rule)] py-4 text-sm leading-7">
                  {selectedNotice.message}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="qd-cell rounded-sm p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-[color:var(--qd-sheet-muted)]">
                      <User className="h-4 w-4" />
                      Posted By
                    </div>

                    <p className="font-semibold">
                      {selectedNotice.teacher}
                    </p>

                    <p className="text-sm text-[color:var(--qd-sheet-muted)]">
                      {selectedNotice.role}
                    </p>
                  </div>

                  <div className="qd-cell rounded-sm p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs text-[color:var(--qd-sheet-muted)]">
                      <CalendarDays className="h-4 w-4" />
                      Date &amp; Time
                    </div>

                    <p className="font-semibold">
                      {formatDate(selectedNotice.date)}
                    </p>

                    <p className="text-sm text-[color:var(--qd-sheet-muted)]">
                      {selectedNotice.time}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="w-full rounded-sm border border-[#1f3a63] bg-[#1f3a63] px-4 py-3 text-sm font-semibold text-[#fbf5e4] transition hover:bg-[#16294a]"
                >
                  Close Notice
                </button>
              </div>
            </Pop>
          </Fade>
        )}
      </AnimatePresence>
    </div>
  );
}

