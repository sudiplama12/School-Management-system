import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Clock,
  Shuffle,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Assignments() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState(
    (user?.assignedClasses || [])[0] || "Grade 10 - A"
  );
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState(30);
  const [randomize, setRandomize] = useState(false);
  const [questions, setQuestions] = useState([]);

  const classOptions = user?.assignedClasses?.length
    ? user.assignedClasses
    : ["Grade 10 - A"];

  const load = () => {
    setLoading(true);
    api
      .get("/assignments")
      .then(({ data }) => setAssignments(data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load assignments.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;

    setLoading(true);
    api
      .get("/assignments")
      .then(({ data }) => {
        if (active) setAssignments(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load assignments."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const addMCQ = () => {
    setQuestions((current) => [
      ...current,
      {
        id: Date.now(),
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        answer: "",
        marks: 1,
      },
    ]);
  };

  const addLongQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: Date.now(),
        type: "long",
        question: "",
        options: [],
        answer: "",
        marks: 5,
      },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((current) =>
      current.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions((current) =>
      current.map((q) => {
        if (q.id !== questionId) return q;

        const options = [...q.options];
        options[optionIndex] = value;

        return { ...q, options };
      })
    );
  };

  const removeQuestion = (id) => {
    setQuestions((current) => current.filter((q) => q.id !== id));
  };

  const createAssignment = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter assignment title.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/assignments", {
        title,
        subject,
        className,
        instructions,
        dueDate: dueDate || undefined,
        duration: Number(duration),
        randomize,
        questions: questions.map((q) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
          marks: Number(q.marks || 0),
        })),
      });

      setTitle("");
      setSubject("");
      setInstructions("");
      setDueDate("");
      setDuration(30);
      setRandomize(false);
      setQuestions([]);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/assignments/${id}`);
      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== id)
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete assignment.");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "—";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Assignments
          </h1>
          <p className="mt-1 text-slate-500">
            Create and manage assignments for your authorized classes.
          </p>
        </div>

        <button
          onClick={() => setShowForm((value) => !value)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={20} />
          Create Assignment
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={createAssignment}
          className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Create Assignment
              </h2>
              <p className="text-sm text-slate-500">
                Add MCQ or long-answer questions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Assignment Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mathematics Unit Test"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Class
              </label>

              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Timer (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Instructions
              </label>

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="2"
                placeholder="Optional instructions for students…"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="h-5 w-5"
              />

              <span className="flex items-center gap-2 font-medium">
                <Shuffle size={18} />
                Randomize questions
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addMCQ}
              className="rounded-xl border border-emerald-300 px-4 py-2 font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
            >
              + Add MCQ
            </button>

            <button
              type="button"
              onClick={addLongQuestion}
              className="rounded-xl border border-blue-300 px-4 py-2 font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50"
            >
              + Add Long Question
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold">
                    Question {index + 1}{" "}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {q.type === "mcq" ? "MCQ" : "Long Answer"}
                    </span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                  placeholder="Enter question..."
                  className="mb-4 w-full rounded-xl border border-slate-300 bg-card px-4 py-3"
                />

                {q.type === "mcq" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {q.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        value={option}
                        onChange={(e) =>
                          updateOption(q.id, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="rounded-xl border border-slate-300 bg-card px-4 py-3"
                      />
                    ))}

                    <select
                      value={q.answer}
                      onChange={(e) => updateQuestion(q.id, "answer", e.target.value)}
                      className="rounded-xl border border-slate-300 bg-card px-4 py-3"
                    >
                      <option value="">Select correct answer</option>

                      {q.options.map((option, index) => (
                        <option key={index} value={option}>
                          Option {index + 1}: {option || "Empty"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">Marks</label>

                  <input
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestion(q.id, "marks", Number(e.target.value))
                    }
                    className="w-32 rounded-xl border border-slate-300 bg-card px-4 py-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Assignment"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-slate-500">
          You have not created any assignments yet.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {assignment.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {assignment.className}
                  </p>
                </div>

                <button
                  onClick={() => deleteAssignment(assignment.id)}
                  className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50"
                >
                  <Trash2 size={19} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300">
                  {assignment.type}
                </span>

                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:text-blue-300">
                  <Clock size={15} />
                  {assignment.duration} min
                </span>

                {assignment.randomize && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:text-amber-300">
                    <Shuffle size={15} />
                    Random
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Created: {formatDate(assignment.createdAt)}
              </p>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  {assignment.questions?.length || 0} question(s)
                </span>

                <span className="text-slate-500">
                  {assignment.totalMarks} marks • {assignment.submissionCount} submitted
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
