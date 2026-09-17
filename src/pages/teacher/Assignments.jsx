import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Clock,
  Shuffle,
  CheckCircle2,
  X,
} from "lucide-react";

const initialAssignments = [
  {
    id: 1,
    title: "Mathematics Unit Test",
    className: "Grade 10 - A",
    type: "Mixed",
    duration: 30,
    randomize: true,
    questions: [
      {
        id: 1,
        type: "mcq",
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4",
        marks: 1,
      },
      {
        id: 2,
        type: "long",
        question: "Explain linear equations.",
        options: [],
        answer: "",
        marks: 5,
      },
    ],
    createdAt: new Date().toLocaleString(),
  },
];

export default function Assignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("Grade 10 - A");
  const [duration, setDuration] = useState(30);
  const [randomize, setRandomize] = useState(false);
  const [questions, setQuestions] = useState([]);

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
      current.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions((current) =>
      current.map((q) => {
        if (q.id !== questionId) return q;

        const options = [...q.options];
        options[optionIndex] = value;

        return {
          ...q,
          options,
        };
      })
    );
  };

  const removeQuestion = (id) => {
    setQuestions((current) =>
      current.filter((q) => q.id !== id)
    );
  };

  const createAssignment = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter assignment title.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    const assignment = {
      id: Date.now(),
      title,
      className,
      type:
        questions.some((q) => q.type === "mcq") &&
        questions.some((q) => q.type === "long")
          ? "Mixed"
          : questions[0].type === "mcq"
          ? "MCQ"
          : "Long Answer",
      duration: Number(duration),
      randomize,
      questions,
      createdAt: new Date().toLocaleString(),
    };

    setAssignments((current) => [assignment, ...current]);

    setTitle("");
    setDuration(30);
    setRandomize(false);
    setQuestions([]);
    setShowForm(false);
  };

  const deleteAssignment = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== id)
    );
  };

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

      {showForm && (
        <form
          onSubmit={createAssignment}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
                <option>Grade 10 - A</option>
                <option>Grade 9 - A</option>
              </select>
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

            <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
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
              className="rounded-xl border border-emerald-300 px-4 py-2 font-medium text-emerald-700 hover:bg-emerald-50"
            >
              + Add MCQ
            </button>

            <button
              type="button"
              onClick={addLongQuestion}
              className="rounded-xl border border-blue-300 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
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
                      {q.type === "mcq"
                        ? "MCQ"
                        : "Long Answer"}
                    </span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <input
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(
                      q.id,
                      "question",
                      e.target.value
                    )
                  }
                  placeholder="Enter question..."
                  className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                />

                {q.type === "mcq" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {q.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        value={option}
                        onChange={(e) =>
                          updateOption(
                            q.id,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                      />
                    ))}

                    <select
                      value={q.answer}
                      onChange={(e) =>
                        updateQuestion(
                          q.id,
                          "answer",
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                    >
                      <option value="">
                        Select correct answer
                      </option>

                      {q.options.map((option, index) => (
                        <option key={index} value={option}>
                          Option {index + 1}: {option || "Empty"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">
                    Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestion(
                        q.id,
                        "marks",
                        Number(e.target.value)
                      )
                    }
                    className="w-32 rounded-xl border border-slate-300 bg-white px-4 py-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Save Assignment
          </button>
        </form>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={19} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                {assignment.type}
              </span>

              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                <Clock size={15} />
                {assignment.duration} min
              </span>

              {assignment.randomize && (
                <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                  <Shuffle size={15} />
                  Random
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Created: {assignment.createdAt}
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 size={18} className="text-emerald-600" />
              {assignment.questions.length} question(s)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}