import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  BookMarked,
  CalendarDays,
  AlertTriangle,
  RotateCcw,
  CircleDollarSign,
} from "lucide-react";
import api from "../../api/axios";
import { AnimatePresence, Fade, Pop, Turn } from "../../components/Motion";
import { Stamp } from "../../components/Paper";
import { sheetProps } from "../../utils/paper";

/* =========================
   DATE HELPERS
========================= */

const formatDate = (value) => {
  if (!value) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Library() {
  const [resources, setResources] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Which title is lying open on the desk, and which way its leaf is turning.
  const [open, setOpen] = useState(-1);
  const [dir, setDir] = useState(1);

  /* =========================
     LOAD CATALOGUE + ISSUES
  ========================= */

  useEffect(() => {
    let active = true;

    setLoading(true);

    Promise.all([api.get("/library/books"), api.get("/library/issues")])
      .then(([booksResponse, issuesResponse]) => {
        if (!active) return;

        setResources(
          (booksResponse.data || []).map((book) => ({
            ...book,
            dueDate: formatDate(book.dueDate),
          }))
        );

        setIssuedBooks(
          (issuesResponse.data || []).map((issue) => ({
            ...issue,
            issueDate: formatDate(issue.issueDate),
            returnDate: formatDate(issue.returnDate),
            returnedDate: formatDate(issue.returnedDate),
          }))
        );
      })
      .catch((err) => {
        if (active)
          setError(
            err?.response?.data?.message || "Unable to load the library."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Category filter is built from the fetched catalogue.
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        resources.map((resource) => resource.category).filter(Boolean)
      )
    );

    return ["All", ...unique];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory =
        category === "All" || resource.category === category;

      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.author.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category, resources]);

  const openBook = (index) => {
    setDir(index >= open ? 1 : -1);
    setOpen(index);
  };

  // Walking the catalogue is turning its pages: the next title comes over the
  // gutter from the right, the previous one comes back.
  const turnTo = (step) => {
    const next = open + step;

    if (next < 0 || next >= filteredResources.length) return;

    setDir(step);
    setOpen(next);
  };

  useEffect(() => {
    if (open < 0) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(-1);
      if (event.key === "ArrowRight") turnTo(1);
      if (event.key === "ArrowLeft") turnTo(-1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filteredResources]);

  // The shelf can shrink under a search, so the open title is read out of the
  // filtered list rather than held as an object that may no longer be there.
  const opened = filteredResources[open] ?? null;

  const availableCount = resources.filter(
    (resource) => resource.status === "Available"
  ).length;

  const borrowedCount = resources.filter(
    (resource) => resource.status === "Borrowed"
  ).length;

  const issuedCount = issuedBooks.filter(
    (book) => book.status === "Issued"
  ).length;

  const overdueCount = issuedBooks.filter(
    (book) => book.status === "Overdue"
  ).length;

  const lostCount = issuedBooks.filter(
    (book) => book.status === "Lost"
  ).length;

  const totalFine = issuedBooks.reduce(
    (total, book) => total + book.fine,
    0
  );

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Academic Resources
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          Library
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Browse books, study materials, and manage your issued books.
        </p>
      </div>

      {/* ================= LOADING / ERROR ================= */}

      {loading && (
        <p className="text-sm text-slate-500">Loading library…</p>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* ================= STATISTICS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={BookOpen}
          label="Total Resources"
          value={resources.length}
        />

        <StatCard
          icon={CheckCircle2}
          label="Available"
          value={availableCount}
        />

        <StatCard
          icon={BookMarked}
          label="Currently Issued"
          value={issuedCount}
        />

        <StatCard
          icon={CircleDollarSign}
          label="Total Fine"
          value={`NPR ${totalFine}`}
        />

      </div>

      {/* ================= ISSUED BOOK SUMMARY ================= */}

      <div className="grid gap-4 sm:grid-cols-3">

        <SummaryCard
          icon={Clock}
          label="Overdue Books"
          value={overdueCount}
          type="warning"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Lost Books"
          value={lostCount}
          type="danger"
        />

        <SummaryCard
          icon={RotateCcw}
          label="Returned Books"
          value={
            issuedBooks.filter((book) => book.status === "Returned").length
          }
          type="success"
        />

      </div>

      {/* ================= MY ISSUED BOOKS ================= */}

      <section>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              My Issued Books
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Track issued books, return dates, overdue fines, and lost books.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {issuedBooks.length} Records
          </span>
        </div>

        {/* The loan book: ruled stock and a red margin, one line per copy out.
            On a phone the same records become one slip each, because a
            five-column register cannot be read down the width of a screen. */}
        <div className="qd-register qd-margin hidden overflow-x-auto md:block">

            <table className="w-full text-left text-sm">

              <thead>

                <tr className="qd-reg-row">
                  <th className="px-5 py-3 pl-12 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Book
                  </th>

                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Issue Date
                  </th>

                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Return Date
                  </th>

                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                    Fine
                  </th>
                </tr>

              </thead>

              <tbody>

                {issuedBooks.map((book) => (
                  <tr key={book.id} className="qd-reg-row">

                    <td className="px-5 py-4 pl-12">

                      <p className="text-sm font-semibold">
                        {book.title}
                      </p>

                      <p className="mt-1 text-xs text-[color:var(--qd-sheet-muted)]">
                        {book.author}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[color:var(--qd-sheet-muted)]">
                        ID: {book.bookId}
                      </p>

                    </td>

                    <td className="px-5 py-4">
                      <DateValue date={book.issueDate} />
                    </td>

                    <td className="px-5 py-4">
                      <DateValue date={book.returnDate} />
                    </td>

                    <td className="px-5 py-4">
                      <BookStatus status={book.status} />
                    </td>

                    <td className="px-5 py-4">

                      {book.fine > 0 ? (
                        <span className="qd-hand text-xl leading-6 text-[color:var(--qd-pen-red)]">
                          NPR {book.fine}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--qd-sheet-muted)]">
                          No Fine
                        </span>
                      )}

                    </td>

                  </tr>
                ))}

                {!issuedBooks.length && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 pl-12 text-sm text-[color:var(--qd-sheet-muted)]"
                    >
                      Nothing is out on loan to you.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

        </div>

        <div className="qd-board space-y-5 p-4 md:hidden">

            {issuedBooks.map((book, index) => (
              <div
                key={book.id}
                {...sheetProps(index, { stack: true, className: "p-4" })}
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="text-sm font-semibold">
                      {book.title}
                    </h3>

                    <p className="mt-1 text-xs text-[color:var(--qd-sheet-muted)]">
                      {book.author}
                    </p>
                  </div>

                  <BookStatus status={book.status} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <DateInfo
                    icon={CalendarDays}
                    label="Issued"
                    value={book.issueDate}
                  />

                  <DateInfo
                    icon={CalendarDays}
                    label="Return Date"
                    value={book.returnDate}
                  />

                </div>

                <div className="mt-4 border-t border-[color:var(--qd-sheet-edge)] pt-3">

                  <p className="text-xs uppercase tracking-wide text-[color:var(--qd-sheet-muted)]">
                    Fine
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      book.fine > 0
                        ? "qd-hand text-xl text-[color:var(--qd-pen-red)]"
                        : "text-[color:var(--qd-pen)]"
                    }`}
                  >
                    {book.fine > 0
                      ? `NPR ${book.fine}`
                      : "No Fine"}
                  </p>

                </div>

              </div>
            ))}

        </div>

      </section>

      {/* ================= SEARCH + FILTER ================= */}

      <div className="rounded-2xl border border-slate-200 bg-card p-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, authors, categories..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-card focus:ring-1 focus:ring-amber-500"
            />

          </div>

          <div className="flex items-center gap-2">

            <Filter className="h-4 w-4 text-slate-400" />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </div>

      </div>

      {/* ================= RESOURCE LIST ================= */}

      <div>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="font-semibold text-slate-900">
            Library Resources
          </h2>

          <p className="text-xs text-slate-400">
            {filteredResources.length} title{filteredResources.length !== 1 ? "s" : ""} · tap a
            cover to open it
          </p>

        </div>

        {filteredResources.length === 0 ? (

          <div className="qd-board p-6 sm:p-10">

            <div
              {...sheetProps(0, {
                fold: true,
                tilt: 0,
                className: "mx-auto max-w-sm px-6 py-10 text-center",
              })}
            >
              <BookOpen className="mx-auto h-9 w-9 text-[color:var(--qd-sheet-muted)]" />

              <h3 className="mt-4 font-serif text-lg font-semibold">
                No titles on this shelf
              </h3>

              <p className="mt-1 text-sm text-[color:var(--qd-sheet-muted)]">
                Try another search term or category.
              </p>
            </div>

          </div>

        ) : (

          <div className="qd-board grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 sm:gap-6 sm:p-7 lg:grid-cols-4 xl:grid-cols-5">

            {filteredResources.map((resource, index) => (
              <BookCover
                key={resource.id || resource._id}
                book={resource}
                index={index}
                onOpen={() => openBook(index)}
              />
            ))}

          </div>

        )}

      </div>

      <AnimatePresence>
        {opened && (
          <BookSpread
            book={opened}
            dir={dir}
            index={open}
            total={filteredResources.length}
            onClose={() => setOpen(-1)}
            onTurn={turnTo}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div>

          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({ icon: Icon, label, value, type }) {

  const styles = {
    warning: "bg-amber-50 text-amber-700 dark:text-amber-300",
    danger: "bg-red-50 text-red-600 dark:text-red-400",
    success: "bg-emerald-50 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[type]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>

          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================
   DATE VALUE
========================= */

function DateValue({ date }) {

  return (
    <div className="flex items-center gap-2">

      <CalendarDays className="h-4 w-4 text-[color:var(--qd-sheet-muted)]" />

      <span className="text-xs text-[color:var(--qd-sheet-ink)]">
        {date}
      </span>

    </div>
  );
}

/* =========================
   MOBILE DATE INFO
========================= */

function DateInfo({ icon: Icon, label, value }) {

  return (
    <div>

      <div className="flex items-center gap-1.5 text-[color:var(--qd-sheet-muted)]">

        <Icon className="h-3.5 w-3.5" />

        <span className="text-[10px] uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="mt-1 text-xs font-medium text-[color:var(--qd-sheet-ink)]">
        {value}
      </p>

    </div>
  );
}

/* =========================
   BOOK STATUS
========================= */

// These sit on paper, so they are pen marks in a ruled box rather than the
// coloured chips the rest of the app uses: an accent tint on cream turns
// translucent in dark mode and disappears.
function BookStatus({ status }) {

  const config = {
    Issued: {
      className: "text-[color:var(--qd-pen)]",
      icon: BookMarked,
    },

    Overdue: {
      className: "text-[color:var(--qd-pen-red)]",
      icon: Clock,
    },

    Returned: {
      className: "text-[color:var(--qd-sheet-muted)]",
      icon: CheckCircle2,
    },

    Lost: {
      className: "text-[color:var(--qd-pen-red)]",
      icon: AlertTriangle,
    },
  };

  // Guard against an unexpected status so the badge never throws.
  const item = config[status] || {
    className: "text-[color:var(--qd-sheet-ink)]",
    icon: BookOpen,
  };
  const Icon = item.icon;

  return (
    <span
      className={`qd-cell inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

/* =========================
   BOOK ON THE SHELF
========================= */

// A catalogue card used to summarise a book. This is the book: kraft over board,
// a spine along the hinge, the fore-edge of the leaves showing past the cover,
// and the title printed into the board rather than floated over it.
function BookCover({ book, index, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${book.title}`}
      className="qd-kraft qd-book qd-book-btn qd-fade-up relative flex aspect-[5/7] w-full flex-col justify-between p-3 pl-5 text-left sm:p-4 sm:pl-6"
      style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
    >
      <span aria-hidden="true" className="qd-spine absolute inset-y-0 left-0 w-2 sm:w-2.5" />

      <p className="text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]">
        {book.category || "General"}
      </p>

      <div className="qd-cover-label px-2.5 py-3 sm:px-3.5 sm:py-4">
        <h3 className="font-serif text-sm font-semibold leading-snug sm:text-base">
          {book.title}
        </h3>

        <p className="mt-2 text-[10px] sm:text-xs">{book.author}</p>
      </div>

      <p className="qd-hand text-base leading-5 sm:text-lg">
        {book.status === "Available" ? "On the shelf" : "Out on loan"}
      </p>
    </button>
  );
}

/* =========================
   OPEN BOOK
========================= */

const NAV =
  "flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-40";

// The detail view is the book opened flat on the desk. The left-hand leaf is the
// title page and stays where it is; the right-hand one is a page, and it turns —
// swinging about the gutter instead of scaling in a corner — every time the
// reader steps to another title.
function BookSpread({ book, dir, index, total, onClose, onTurn }) {
  const isAvailable = book.status === "Available";
  const copies = Number(book.availableCopies ?? book.quantity ?? 0);

  return (
    <Fade
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <Pop
        as="div"
        origin="center"
        className="my-auto w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
            {book.code ? `Accession ${book.code}` : "Library catalogue"}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close the book"
            className="rounded-xl p-2 text-white transition hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="qd-kraft qd-book-spread qd-book-open relative p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row">
            <div className="qd-page flex-1 p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--qd-sheet-muted)]">
                {book.type === "PDF"
                  ? "Digital reference"
                  : `${book.category || "General"} · ${book.type || "Book"}`}
              </p>

              <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
                {book.title}
              </h2>

              <p className="qd-hand mt-2 text-2xl leading-7 text-[color:var(--qd-pen)]">
                by {book.author}
              </p>

              {!isAvailable && (
                <div
                  {...sheetProps(0, {
                    stack: true,
                    tilt: -1.6,
                    className: "mt-5 px-4 py-3",
                  })}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--qd-sheet-muted)]">
                    Date due
                  </p>

                  <p className="qd-hand text-2xl leading-7 text-[color:var(--qd-pen-red)]">
                    {book.dueDate || "Not dated"}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-[color:var(--qd-sheet-edge)] pt-4">
                <div className="text-xs leading-5 text-[color:var(--qd-sheet-muted)]">
                  <p>{book.isbn ? `ISBN ${book.isbn}` : "No ISBN recorded"}</p>

                  <p>{copies} of {Number(book.quantity ?? 0)} copies on the shelf</p>
                </div>

                <Stamp>School Library</Stamp>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <Turn
                key={book.id || book._id}
                dir={dir}
                className="qd-page min-h-[17rem] flex-1 p-5 sm:p-7"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--qd-sheet-muted)]">
                  About this title
                </p>

                <p className="mt-3 text-sm leading-7">
                  {book.description ||
                    "No description has been written for this title yet."}
                </p>

                <div className="mt-6 space-y-3">
                  <p
                    className={`qd-cell inline-flex rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                      isAvailable
                        ? "text-[color:var(--qd-pen)]"
                        : "text-[color:var(--qd-pen-red)]"
                    }`}
                  >
                    {isAvailable
                      ? "On the shelf"
                      : `Out on loan · due ${book.dueDate || "—"}`}
                  </p>

                  <p className="qd-hand text-xl leading-6 text-[color:var(--qd-pen)]">
                    {isAvailable
                      ? "Ask the librarian for this copy."
                      : "Ask the desk when it is next free."}
                  </p>
                </div>
              </Turn>
            </AnimatePresence>
          </div>

          {/* The binding, drawn over the gutter the two leaves meet in. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-3 left-1/2 hidden w-1.5 -translate-x-1/2 bg-[#3a2413]/35 sm:block"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onTurn(-1)} disabled={index <= 0} className={NAV}>
            <ChevronLeft size={16} />
            Previous title
          </button>

          <p className="text-xs text-white">
            {index + 1} of {total}
          </p>

          <button
            type="button"
            onClick={() => onTurn(1)}
            disabled={index >= total - 1}
            className={NAV}
          >
            Next title
            <ChevronRight size={16} />
          </button>
        </div>
      </Pop>
    </Fade>
  );
}
