import { useState } from "react";
import {
  Plus,
  Trash2,
  Bell,
  X,
} from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      message:
        "The parent-teacher meeting will be held on Sunday at 11:00 AM.",
      className: "Grade 10 - A",
      createdAt: "Sep 17, 2026 • 3:45 PM",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [className, setClassName] = useState("Grade 10 - A");

  const publishNotice = (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Please enter title and message.");
      return;
    }

    const newNotice = {
      id: Date.now(),
      title,
      message,
      className,
      createdAt: new Date().toLocaleString(),
    };

    setNotices((current) => [newNotice, ...current]);

    setTitle("");
    setMessage("");
    setShowForm(false);
  };

  const deleteNotice = (id) => {
    if (!window.confirm("Delete this notice?")) return;

    setNotices((current) =>
      current.filter((notice) => notice.id !== id)
    );
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
        <form
          onSubmit={publishNotice}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Create Notice
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option>Grade 10 - A</option>
              <option>Grade 9 - A</option>
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              placeholder="Write notice..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="rounded-xl bg-emerald-100 p-3">
                <Bell className="text-emerald-600" />
              </div>

              <div className="flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {notice.title}
                    </h2>

                    <p className="text-sm text-emerald-600">
                      {notice.className}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="self-start rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="mt-4 leading-7 text-slate-600">
                  {notice.message}
                </p>

                <p className="mt-4 text-sm text-slate-400">
                  {notice.createdAt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}