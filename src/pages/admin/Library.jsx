
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  ArrowLeftRight,
  RotateCcw,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import { AnimatePresence, Fade, Pop } from "../../components/Motion";
import { sheetProps } from "../../utils/paper";

// Every field in this page is written on paper, so the inputs are ruled boxes in
// white ink: a cream sheet with a slate border turns into a cream sheet with a
// near-white border in dark mode, which is the same invisible-text trap the
// notices fell into before the paper layer existed.
const FIELD =
  "w-full rounded-sm border border-[color:var(--qd-sheet-edge)] bg-white/70 px-4 py-3 text-[color:var(--qd-sheet-ink)] outline-none focus:border-[color:var(--qd-pen)] placeholder:text-[color:var(--qd-sheet-muted)]";

const LABEL =
  "mb-1.5 block text-sm font-semibold text-[color:var(--qd-sheet-muted)]";

const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  type: "Book",
  description: "",
  quantity: 1,
};

// A copy is still owed to the library in each of these states.
const OPEN_STATUSES = ["issued", "overdue", "lost"];

// Native date inputs are filled from the local calendar, never from
// toISOString(), which is a day early this side of GMT.
const toDateInput = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function Library() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("books");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { pathname } = useLocation();

  // The sidebar points Manage Books, Issue Books and Return Books at this page.
  useEffect(() => {
    setActiveTab(
      pathname.endsWith("/issue")
        ? "issue"
        : pathname.endsWith("/return")
          ? "issues"
          : "books"
    );
  }, [pathname]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [editing, setEditing] = useState(null);
  const [issueForm, setIssueForm] = useState({
    bookId: "",
    studentId: "",
    dueDate: "",
  });

  const loadLibrary = async () => {
    setLoading(true);
    setError("");

    try {
      const [bookRes, issueRes, studentRes] = await Promise.all([
        api.get("/library/books"),
        api.get("/library/issues"),
        api.get("/admin/students"),
      ]);

      setBooks(Array.isArray(bookRes.data) ? bookRes.data : bookRes.data.books || []);
      setIssues(Array.isArray(issueRes.data) ? issueRes.data : issueRes.data.issues || []);
      setStudents(
        Array.isArray(studentRes.data)
          ? studentRes.data
          : studentRes.data.students || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load library data. Check your backend routes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const openBookForm = (book = null) => {
    setEditing(book);
    setBookForm(
      book
        ? {
            title: book.title || "",
            author: book.author || "",
            isbn: book.isbn || "",
            category: book.category || "",
            type: book.type || "Book",
            description: book.description || "",
            quantity: book.quantity ?? 1,
          }
        : emptyBook
    );
    setError("");
    setMessage("");
    setShowBookForm(true);
  };

  const saveBook = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const payload = {
      ...bookForm,
      quantity: Number(bookForm.quantity),
    };

    try {
      if (editing) {
        await api.patch(
          `/library/books/${editing.id || editing._id}`,
          payload
        );
        setMessage(`"${payload.title}" updated successfully.`);
      } else {
        await api.post("/library/books", payload);
        setMessage("Book added successfully.");
      }

      setBookForm(emptyBook);
      setEditing(null);
      setShowBookForm(false);
      await loadLibrary();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the book.");
    } finally {
      setSaving(false);
    }
  };

  const issueBook = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/library/issues", issueForm);
      setIssueForm({ bookId: "", studentId: "", dueDate: "" });
      setMessage("Book issued successfully.");
      setActiveTab("issues");
      await loadLibrary();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to issue book.");
    }
  };

  const returnBook = async (issueId) => {
    if (!window.confirm("Confirm that this book has been returned?")) return;

    setError("");
    setMessage("");

    try {
      await api.patch(`/library/issues/${issueId}/return`);
      setMessage("Book returned successfully.");
      await loadLibrary();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to return book.");
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm("Delete this book from the library?")) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/library/books/${bookId}`);
      setMessage("Book deleted successfully.");
      await loadLibrary();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete book.");
    }
  };

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.isbn} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredIssues = issues.filter((issue) =>
    `${issue.book?.title || issue.bookTitle || ""} ${
      issue.student?.name || issue.studentName || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalCopies = books.reduce(
    (sum, book) => sum + Number(book.quantity || 0),
    0
  );

  const availableCopies = books.reduce(
    (sum, book) => sum + Number(book.availableCopies ?? book.quantity ?? 0),
    0
  );

  const issuedCount = issues.filter((issue) =>
    OPEN_STATUSES.includes(issue.status)
  ).length;

  const overdueCount = issues.filter((issue) => issue.overdue).length;

  const lostCount = issues.filter((issue) => issue.status === "lost").length;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              SMART SCHOOL MANAGEMENT SYSTEM
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Library Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage books, student issues, returns, and overdue books.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadLibrary}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-card px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={() => openBookForm()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Book
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:text-green-300">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Book Titles",
              value: books.length,
              icon: BookOpen,
              color: "bg-blue-100 text-blue-700 dark:text-blue-300",
            },
            {
              label: "Total Copies",
              value: totalCopies,
              icon: BookOpen,
              color: "bg-teal-100 text-teal-700 dark:text-teal-300",
            },
            {
              label: "Available Copies",
              value: availableCopies,
              icon: RotateCcw,
              color: "bg-emerald-100 text-emerald-700 dark:text-emerald-300",
            },
            {
              label: "Currently Issued",
              value: issuedCount,
              icon: ArrowLeftRight,
              color: "bg-amber-100 text-amber-700 dark:text-amber-300",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <span className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={21} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {loading ? "…" : stat.value}
                </p>
                {stat.label === "Currently Issued" && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {overdueCount} overdue · {lostCount} lost
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("books")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "books"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Book Inventory
            </button>

            <button
              onClick={() => setActiveTab("issues")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "issues"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Issued / Returned Books
            </button>

            <button
              onClick={() => setActiveTab("issue")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "issue"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Issue a Book
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books or students..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-card p-12 text-center text-slate-500">
            Loading library data...
          </div>
        ) : activeTab === "books" ? (
          <div className="qd-register qd-margin overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="qd-reg-row">
                  <th className="px-5 py-3.5 pl-12 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Book
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    ISBN
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Total
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Available
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="qd-reg-row">
                    <td className="px-5 py-4 pl-12">
                      <div className="flex items-start gap-3">
                        {/* The title as it stands on the shelf. */}
                        <span
                          aria-hidden="true"
                          className="qd-kraft qd-book mt-0.5 block h-9 w-6 shrink-0"
                        />

                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="mt-1 text-xs text-[color:var(--qd-sheet-muted)]">
                            {book.author}
                            {book.code ? ` · ${book.code}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{book.isbn || "—"}</td>
                    <td className="px-5 py-4">
                      {book.category || "General"}
                      {book.type === "PDF" && (
                        <span className="qd-hand ml-2 text-base text-[color:var(--qd-pen)]">
                          pdf
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">{book.quantity ?? 0}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`qd-total inline-block px-3 py-1 font-bold ${
                          Number(book.availableCopies ?? book.quantity ?? 0) > 0
                            ? "text-[color:var(--qd-pen)]"
                            : "text-[color:var(--qd-pen-red)]"
                        }`}
                      >
                        {book.availableCopies ?? book.quantity ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBookForm(book)}
                          aria-label={`Edit ${book.title}`}
                          className="rounded-sm border border-[color:var(--qd-sheet-edge)] px-3 py-2 text-xs font-semibold text-[color:var(--qd-pen)] transition hover:bg-white/60"
                        >
                          <Pencil size={12} className="mr-1 inline" />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteBook(book._id)}
                          aria-label={`Delete ${book.title}`}
                          className="rounded-sm border border-[color:var(--qd-pen-red)] px-3 py-2 text-xs font-semibold text-[color:var(--qd-pen-red)] transition hover:bg-white/60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 pl-12 text-[color:var(--qd-sheet-muted)]"
                    >
                      No books found. Add your first book.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "issues" ? (
          <div className="qd-register qd-margin overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="qd-reg-row">
                  <th className="px-5 py-3.5 pl-12 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Book
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Student
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Issue Date
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Due Date
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => {
                  const open = OPEN_STATUSES.includes(issue.status);
                  const label =
                    issue.status === "returned"
                      ? "Returned"
                      : issue.status === "lost"
                        ? "Lost"
                        : issue.overdue
                          ? "Overdue"
                          : "Issued";

                  // Only two inks on this page: the clerk's blue for a loan that
                  // is still tidy, red for the ones somebody has to chase.
                  const tone =
                    issue.status === "returned"
                      ? "text-[color:var(--qd-sheet-muted)]"
                      : issue.status === "lost" || issue.overdue
                        ? "text-[color:var(--qd-pen-red)]"
                        : "text-[color:var(--qd-pen)]";

                  return (
                    <tr key={issue._id} className="qd-reg-row">
                      <td className="px-5 py-4 pl-12 font-semibold">
                        {issue.book?.title || issue.bookTitle || "Book"}
                      </td>
                      <td className="px-5 py-4">
                        {issue.student?.name ||
                          issue.studentName ||
                          "Student"}
                        {issue.student?.studentId && (
                          <p className="mt-1 text-xs font-normal text-[color:var(--qd-sheet-muted)]">
                            {issue.student.studentId}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {formatDate(issue.issueDate || issue.createdAt)}
                      </td>
                      <td className="px-5 py-4">{formatDate(issue.dueDate)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`qd-cell inline-block rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wide ${tone}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {open && (
                          <button
                            onClick={() => returnBook(issue._id)}
                            aria-label={`Return ${issue.book?.title || "book"} for ${
                              issue.student?.name || "student"
                            }`}
                            className="flex items-center gap-2 rounded-sm border border-[color:var(--qd-pen)] px-3 py-2 text-xs font-semibold text-[color:var(--qd-pen)] transition hover:bg-white/60"
                          >
                            <RotateCcw size={14} />
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredIssues.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 pl-12 text-[color:var(--qd-sheet-muted)]"
                    >
                      No issue records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <form
            onSubmit={issueBook}
            {...sheetProps(0, {
              tilt: 0,
              className: "mx-auto max-w-2xl space-y-5 p-6 sm:p-8",
            })}
          >
            <div>
              <h2 className="text-xl font-bold">Issue Book to Student</h2>
              <p className="mt-1 text-sm text-[color:var(--qd-sheet-muted)]">
                Only books with available copies can be issued.
              </p>
            </div>

            <div>
              <label className={LABEL}>Select Book</label>
              <select
                required
                value={issueForm.bookId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, bookId: e.target.value })
                }
                className={FIELD}
              >
                <option value="">Choose a book</option>
                {books
                  .filter((book) => Number(book.availableCopies ?? book.quantity ?? 0) > 0)
                  .map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} — Available:{" "}
                      {book.availableCopies ?? book.quantity}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Select Student</label>
              <select
                required
                value={issueForm.studentId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, studentId: e.target.value })
                }
                className={FIELD}
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name || student.fullName || student.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Return Due Date</label>
              <input
                type="date"
                required
                min={toDateInput()}
                value={issueForm.dueDate}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, dueDate: e.target.value })
                }
                className={FIELD}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-sm bg-[color:var(--qd-pen)] px-5 py-3 font-semibold text-white transition hover:bg-[#16294a]"
            >
              Issue Book
            </button>
          </form>
        )}

        <AnimatePresence>
          {showBookForm && (
            <Fade className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
              <Pop
                as="form"
                origin="center"
                onSubmit={saveBook}
                className="qd-sheet qd-scrollbar my-auto max-h-[92dvh] w-full max-w-lg space-y-4 overflow-y-auto p-6"
              >
                <div className="flex items-start justify-between gap-4 border-b-2 border-[color:var(--qd-sheet-rule)] pb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {editing ? "Edit Book" : "Add New Book"}
                    </h2>
                    <p className="mt-1 text-xs text-[color:var(--qd-sheet-muted)]">
                      {editing
                        ? `Accession ${editing.code || "—"} · ${
                            editing.availableCopies ?? editing.quantity ?? 0
                          } of ${editing.quantity ?? 0} copies on the shelf`
                        : "New copies go straight onto the shelf."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBookForm(false)}
                    className="rounded-lg p-2 text-[color:var(--qd-sheet-muted)] transition hover:bg-white/70 hover:text-[color:var(--qd-sheet-ink)]"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {[
                  ["title", "Book Title", "Enter book title"],
                  ["author", "Author", "Enter author name"],
                  ["isbn", "ISBN", "Enter ISBN (optional)"],
                  ["category", "Category", "e.g. Science, Math, English"],
                ].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label className={LABEL}>{label}</label>
                    <input
                      required={name === "title" || name === "author"}
                      value={bookForm[name]}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, [name]: e.target.value })
                      }
                      placeholder={placeholder}
                      className={FIELD}
                    />
                  </div>
                ))}

                <div>
                  <label className={LABEL}>Format</label>
                  <select
                    value={bookForm.type}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, type: e.target.value })
                    }
                    className={FIELD}
                  >
                    <option value="Book">Book (issued to a student)</option>
                    <option value="PDF">PDF (downloadable reference)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Description</label>
                  <textarea
                    rows={3}
                    value={bookForm.description}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, description: e.target.value })
                    }
                    placeholder="Shown to students in the catalogue (optional)"
                    className={`${FIELD} resize-y`}
                  />
                </div>

                <div>
                  <label className={LABEL}>Number of Copies</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookForm.quantity}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, quantity: e.target.value })
                    }
                    className={FIELD}
                  />
                  <p className="mt-1.5 text-xs text-[color:var(--qd-sheet-muted)]">
                    {editing
                      ? "Raising the count adds the difference to the shelf. Stock cannot fall below the copies still on loan."
                      : "Use 0 to catalogue a title before its copies arrive."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-sm bg-[color:var(--qd-pen)] px-5 py-3 font-semibold text-white transition hover:bg-[#16294a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Save Book"}
                </button>
              </Pop>
            </Fade>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
