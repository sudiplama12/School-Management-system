import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Bell, BellOff, CheckCheck, Megaphone, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, Fade, Pop, Tear } from "./Motion";
import { Pin } from "./Paper";
import { sheetProps } from "../utils/paper";

// Notice read state lives on the server (NoticeRead collection), so a dismissal
// made on one device is honoured on the next. This provider keeps one in-memory
// copy of the reader's list and shares it with every layout's header bell.
const NoticeAlertsContext = createContext(null);

const DISMISS_KEY = "lms_notice_alert_dismissed";

const authorId = (notice) =>
  String(notice?.createdBy?.id || notice?.createdBy?._id || notice?.createdBy || "");

const useNoticeAlerts = () => {
  const context = useContext(NoticeAlertsContext);

  if (!context) {
    throw new Error("useNoticeAlerts must be used inside NoticeAlertsProvider");
  }

  return context;
};

export function NoticeAlertsProvider({ children }) {
  const { user } = useAuth();

  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  // A teacher reads the whole school here, not just their own drafts: nobody
  // needs a pop-up telling them about a notice they wrote.
  const query =
    user?.role === "teacher" ? "?mine=false" : "";

  const load = useCallback(async () => {
    if (!user) {
      setNotices([]);
      return;
    }

    try {
      const { data } = await api.get(`/notices${query}`);

      const list = Array.isArray(data) ? data : [];

      setNotices(list.filter((notice) => authorId(notice) !== String(user.id || user._id)));
    } catch {
      // Keep the last known list; the next refresh may succeed.
    }
  }, [user, query]);

  useEffect(() => {
    load();

    if (!user) return undefined;

    const timer = setInterval(load, 60000);

    return () => clearInterval(timer);
  }, [load, user]);

  const unread = useMemo(() => notices.filter((notice) => !notice.read), [notices]);

  // Raise the pop-up only when more notices have arrived than the reader last
  // dismissed, so closing it does not reopen on the next poll.
  useEffect(() => {
    if (!user || !unread.length) return;

    const dismissed = Number(sessionStorage.getItem(DISMISS_KEY) || 0);

    if (unread.length > dismissed) setOpen(true);
  }, [unread, user]);

  const markRead = useCallback(
    async (id) => {
      try {
        await api.post(`/notices/${id}/read`);

        setNotices((previous) =>
          previous.map((notice) =>
            (notice.id || notice._id) === id ? { ...notice, read: true } : notice
          )
        );
      } catch {
        setError("Could not dismiss that notice. Try again.");
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await api.post(`/notices/read-all${query}`);

      // Reset the dismissed counter so the next genuinely new notice interrupts.
      sessionStorage.setItem(DISMISS_KEY, "0");

      await load();
    } catch {
      setError("Could not mark everything as read. Try again.");
    }
  }, [load, query]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, String(unread.length));
    setOpen(false);
  }, [unread.length]);

  // Opening the pop-up by hand starts from a clean slate.
  const show = useCallback(() => {
    setError("");
    setOpen(true);
  }, []);

  const value = {
    notices,
    unread,
    open,
    error,
    setOpen,
    show,
    dismiss,
    markRead,
    markAllRead,
    refresh: load,
  };

  return (
    <NoticeAlertsContext.Provider value={value}>
      {children}
      <NoticeAlertsModal />
    </NoticeAlertsContext.Provider>
  );
}

export function NoticeBell({ className = "" }) {
  const { unread, show } = useNoticeAlerts();

  return (
    <button
      type="button"
      onClick={show}
      aria-label={`Notices${unread.length ? `, ${unread.length} unread` : ""}`}
      className={`relative rounded-xl p-2 transition hover:bg-slate-100 ${className}`}
    >
      <Bell className="h-5 w-5 text-slate-500" />

      {unread.length > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {unread.length > 9 ? "9+" : unread.length}
        </span>
      )}
    </button>
  );
}

function NoticeAlertsModal() {
  const { open, setOpen, unread, error, dismiss, markRead, markAllRead } =
    useNoticeAlerts();

  return (
    <AnimatePresence>
      {open && (
        <Fade className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4">
          {/* The board itself: kraft-corked, with the reader's unread sheets
              pinned to it. Everything on it is written in ink on paper or in
              cream on cork, never in slate — both of those surfaces flip under
              `.dark` and paper does not. */}
          <Pop
            origin="center"
            className="qd-board qd-scrollbar flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5d4028] bg-[#6d4826]">
                  <Megaphone className="h-5 w-5 text-[color:var(--qd-kraft-type)]" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[color:var(--qd-kraft-type)]">
                    {unread.length
                      ? `${unread.length} new notice${unread.length > 1 ? "s" : ""}`
                      : "No new notices"}
                  </h2>
                  <p className="text-xs text-[#e8d9c4]/80">
                    Marking a notice read here clears it on every device.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Close notices"
                className="rounded-xl p-2 text-[#e8d9c4]/70 transition hover:bg-black/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="qd-scrollbar min-h-0 flex-1 overflow-y-auto pt-3">
              {unread.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-[color:var(--qd-kraft-type)]">
                  <BellOff className="h-7 w-7" />
                  <p className="text-sm">
                    You are all caught up.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 pt-2">
                  {/* Each sheet leaves on a corner when it is marked read, so
                      the list visibly empties instead of rows blinking out. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {unread.map((notice, index) => (
                      <Tear
                        as="article"
                        key={notice.id || notice._id}
                        index={index}
                        {...sheetProps(index, { className: "p-4" })}
                      >
                        <Pin />

                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            {notice.title}
                          </h3>

                          <span className="qd-hand shrink-0 text-base leading-none text-[color:var(--qd-sheet-muted)]">
                            {notice.category || "General"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6">{notice.message}</p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs text-[color:var(--qd-sheet-muted)]">
                            {notice.teacher} · {notice.date} {notice.time}
                          </p>

                          <button
                            type="button"
                            onClick={() => markRead(notice.id || notice._id)}
                            className="rounded-sm border border-[#1f3a63] px-3 py-1.5 text-xs font-semibold text-[color:var(--qd-pen)] transition hover:bg-[#1f3a63] hover:text-[#fbf5e4]"
                          >
                            Mark read
                          </button>
                        </div>
                      </Tear>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}

            {unread.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#5d4028] pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-[#e8d9c4]/75 transition hover:text-white"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              </div>
            )}
          </Pop>
        </Fade>
      )}
    </AnimatePresence>
  );
}
