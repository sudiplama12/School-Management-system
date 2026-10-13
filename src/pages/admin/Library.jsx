
import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  ArrowLeftRight,
  RotateCcw,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  quantity: 1,
};

export default function Library() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("books");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBook);
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

  const addBook = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/library/books", {
        ...bookForm,
        quantity: Number(bookForm.quantity),
      });

      setBookForm(emptyBook);
      setShowBookForm(false);
      setMessage("Book added successfully.");
      await loadLibrary();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add book.");
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

  const issuedCount = issues.filter(
    (issue) => issue.status === "issued"
  ).length;

  const overdueCount = issues.filter(
    (issue) =>
      issue.status === "issued" &&
      issue.dueDate &&
      new Date(issue.dueDate) < new Date()
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={() => setShowBookForm(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Book
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Book Titles",
              value: books.length,
              icon: BookOpen,
              color: "bg-blue-100 text-blue-700",
            },
            {
              label: "Total Copies",
              value: totalCopies,
              icon: BookOpen,
              color: "bg-violet-100 text-violet-700",
            },
            {
              label: "Available Copies",
              value: availableCopies,
              icon: RotateCcw,
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              label: "Currently Issued",
              value: issuedCount,
              icon: ArrowLeftRight,
              color: "bg-amber-100 text-amber-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
                  <p className="mt-1 text-xs text-red-600">
                    {overdueCount} overdue
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("books")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "books"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Book Inventory
            </button>

            <button
              onClick={() => setActiveTab("issues")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "issues"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Issued / Returned Books
            </button>

            <button
              onClick={() => setActiveTab("issue")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                activeTab === "issue"
                  ? "bg-indigo-600 text-white"
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
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500">
            Loading library data...
          </div>
        ) : activeTab === "books" ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Book</th>
                    <th className="px-5 py-4">ISBN</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Available</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {book.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {book.author}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {book.isbn || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {book.category || "General"}
                      </td>
                      <td className="px-5 py-4">{book.quantity ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                          {book.availableCopies ?? book.quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => deleteBook(book._id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No books found. Add your first book.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "issues" ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Book</th>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Issue Date</th>
                    <th className="px-5 py-4">Due Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIssues.map((issue) => {
                    const overdue =
                      issue.status === "issued" &&
                      issue.dueDate &&
                      new Date(issue.dueDate) < new Date();

                    return (
                      <tr key={issue._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {issue.book?.title || issue.bookTitle || "Book"}
                        </td>
                        <td className="px-5 py-4">
                          {issue.student?.name ||
                            issue.studentName ||
                            "Student"}
                        </td>
                        <td className="px-5 py-4">
                          {formatDate(issue.issueDate || issue.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          {formatDate(issue.dueDate)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              issue.status === "returned"
                                ? "bg-emerald-50 text-emerald-700"
                                : overdue
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {issue.status === "returned"
                              ? "Returned"
                              : overdue
                                ? "Overdue"
                                : "Issued"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {issue.status === "issued" && (
                            <button
                              onClick={() => returnBook(issue._id)}
                              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
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
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No issue records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form
            onSubmit={issueBook}
            className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Issue Book to Student
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only books with available copies can be issued.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Book
              </label>
              <select
                required
                value={issueForm.bookId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, bookId: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Student
              </label>
              <select
                required
                value={issueForm.studentId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, studentId: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Return Due Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={issueForm.dueDate}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, dueDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Issue Book
            </button>
          </form>
        )}

        {showBookForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
            <form
              onSubmit={addBook}
              className="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Book
                </h2>
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    {label}
                  </label>
                  <input
                    required={name === "title" || name === "author"}
                    value={bookForm[name]}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, [name]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bookForm.quantity}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, quantity: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Save Book
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
