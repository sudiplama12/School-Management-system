import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, Tear } from "../../components/Motion";
import { Pin } from "../../components/Paper";
import { sheetProps } from "../../utils/paper";

// A field printed on the paper, not on the page behind it: the fill is the
// white of a printed form box and the type stays ink in both themes.
const FIELD =
  "w-full rounded-sm border border-[color:var(--qd-sheet-edge)] bg-white/70 px-4 py-3 text-[color:var(--qd-sheet-ink)] outline-none focus:border-[color:var(--qd-pen)]";

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const classOptions = (user?.assignedClasses?.length
    ? user.assignedClasses
    : ["Grade 10 - A"]
  ).concat(""); // trailing empty string = whole school
  const [className, setClassName] = useState(classOptions[0]);

  const load = () => {
    setLoading(true);
    api
      .get("/notices")
      .then(({ data }) => setNotices(data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load notices.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const publishNotice = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Please enter title and message.");
      return;
    }

    try {
      await api.post("/notices", {
        title,
        message,
        className,
        category: "General",
        priority: "normal",
      });

      setTitle("");
      setMessage("");
      setShowForm(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not publish notice.");
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;

    try {
      await api.delete(`/notices/${id}`);
      setNotices((current) => current.filter((notice) => notice.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete notice.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Notices
          </h1>

          <p className="mt-1 text-slate-500">
            Send important notices to your students.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={20} />
          Create Notice
        </button>
      </div>

      {showForm && (
        // The draft: a straight sheet on the desk with the pen still on it, so
        // it reads as the thing that becomes one of the sheets below.
        <form
          onSubmit={publishNotice}
          {...sheetProps(0, { tilt: 0, className: "p-6" })}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Create Notice
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Discard draft"
              className="rounded-sm p-2 text-[color:var(--qd-sheet-muted)] transition hover:bg-[#1f3a63]/10 hover:text-[color:var(--qd-pen)]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className={FIELD}
            />

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={FIELD}
            >
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls || "Whole School"}
                </option>
              ))}
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              placeholder="Write notice..."
              className={`${FIELD} qd-hand text-lg`}
            />

            <button
              type="submit"
              className="w-full rounded-sm border border-[#1f3a63] bg-[#1f3a63] px-5 py-3 font-bold text-[#fbf5e4] transition hover:bg-[#16294a]"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      <div className="qd-board space-y-6 p-4 pt-6 sm:p-6 sm:pt-8">
        <AnimatePresence initial={false}>
          {notices.map((notice, index) => (
            // Deleting a notice tears its sheet off the board and the rest of
            // the pile takes up the slack, which is what a notice board does.
            <Tear
              as="article"
              key={notice.id}
              index={index}
              {...sheetProps(index, { fold: true, className: "p-5 sm:p-6" })}
            >
              <Pin />

              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h2 className="text-lg font-bold">
                        {notice.title}
                      </h2>

                      <p className="qd-hand mt-0.5 text-base text-[color:var(--qd-pen)]">
                        {notice.className}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteNotice(notice.id)}
                      aria-label={`Delete ${notice.title}`}
                      className="self-start rounded-sm p-2 text-[#a52a37] transition hover:bg-[#a52a37]/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="mt-4 leading-7">
                    {notice.message}
                  </p>

                  <p className="qd-hand mt-4 text-base text-[color:var(--qd-sheet-muted)]">
                    {notice.date} • {notice.time}
                  </p>
                </div>
              </div>
            </Tear>
          ))}
        </AnimatePresence>

        {!loading && notices.length === 0 && (
          <p className="text-sm text-[color:var(--qd-kraft-type)]">
            You have not posted any notices yet.
          </p>
        )}
      </div>
    </div>
  );
}