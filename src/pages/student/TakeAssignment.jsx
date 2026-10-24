import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";

export default function TakeAssignment() {
  const location = useLocation();
  const navigate = useNavigate();

  const assignmentId = location.state?.assignmentId;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!assignmentId) {
      setError("No assignment selected. Please open one from your assignments list.");
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    api
      .get(`/assignments/${assignmentId}`)
      .then(({ data }) => {
        if (active) setAssignment(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load this assignment."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [assignmentId]);

  const setAnswer = (questionId, value) =>
    setAnswers((current) => ({ ...current, [questionId]: value }));

  const submitAssignment = async (e) => {
    e.preventDefault();

    if (!assignment) return;

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      answers: assignment.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      })),
      note,
    };

    try {
      const { data } = await api.post(
        `/assignments/${assignment.id}/submit`,
        payload
      );

      setResult({ score: data.score, totalMarks: data.totalMarks });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const status = err?.response?.status;

      if (status === 409) {
        setSubmitError("You have already submitted this assignment.");
      } else if (status === 403) {
        setSubmitError("This assignment is not assigned to your class.");
      } else {
        setSubmitError(
          err?.response?.data?.message || "Could not submit your answers."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "No deadline";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* HEADER */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => navigate("/student/assignments")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to assignments
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {assignment ? assignment.title : "Take Assignment"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Answer each question, then submit your work.
              </p>
            </div>
          </div>
        </div>

        {/* LOADING / ERROR */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading assignment…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-slate-200 bg-card p-10 text-center shadow-sm">
            <FileText className="mx-auto h-14 w-14 text-slate-400" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">
              Assignment unavailable
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && assignment && (

          <>
            {/* META */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Subject</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {assignment.subject || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Time Limit</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {assignment.duration || 0} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Marks</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {assignment.totalMarks}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Due Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
              </div>

            </div>

            {/* RESULT */}
            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                <h2 className="mt-3 text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  Assignment submitted
                </h2>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  Your objective answers were marked automatically. Written
                  answers will be graded by your teacher.
                </p>
                <p className="mt-4 text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                  {result.score}
                  {result.totalMarks != null && (
                    <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {" "}/ {result.totalMarks}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={submitAssignment}
              className="space-y-5"
            >
              {assignment.instructions && (
                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Teacher Instructions
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {assignment.instructions}
                  </p>
                </div>
              )}

              {submitError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              )}

              {assignment.questions.map((q, index) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-slate-900">
                      <span className="mr-2 text-emerald-600 dark:text-emerald-400">
                        Q{index + 1}.
                      </span>
                      {q.question}
                    </h3>

                    <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {q.marks} mark{q.marks === 1 ? "" : "s"}
                    </span>
                  </div>

                  {q.type === "mcq" ? (
                    <div className="mt-4 space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                            answers[q.id] === option
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => setAnswer(q.id, option)}
                            disabled={Boolean(result)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      rows="5"
                      disabled={Boolean(result)}
                      placeholder="Write your answer…"
                      className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                    />
                  )}
                </div>
              ))}

              <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Note to teacher (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="2"
                  disabled={Boolean(result)}
                  placeholder="Anything you want your teacher to know…"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50"
                />
              </div>

              {!result && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Assignment"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
