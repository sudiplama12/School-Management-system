import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Wallet,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import { Donut, PALETTE } from "../../components/charts";

const emptyBill = {
  studentId: "",
  invoice: "",
  title: "",
  description: "",
  amount: "",
  paidAmount: "",
  dueDate: "",
};

const STATUS_STYLES = {
  paid: { label: "Paid", chip: "bg-emerald-50 text-emerald-700 dark:text-emerald-300" },
  partial: { label: "Part paid", chip: "bg-sky-50 text-sky-700 dark:text-sky-300" },
  pending: { label: "Pending", chip: "bg-amber-50 text-amber-700 dark:text-amber-300" },
  overdue: { label: "Overdue", chip: "bg-red-50 text-red-700 dark:text-red-300" },
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

// Date inputs need the local calendar day, never the UTC slice of toISOString.
const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, hint, tone = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function Fees() {
  const location = useLocation();

  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  // /admin/fees?status=overdue lets the dashboard deep-link straight to a queue.
  const [status, setStatus] = useState(
    () => new URLSearchParams(location.search).get("status") || ""
  );

  const [billForm, setBillForm] = useState(emptyBill);
  const [editing, setEditing] = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);

  const [payingFee, setPayingFee] = useState(null);
  const [payment, setPayment] = useState({ amount: "", paidAt: "" });

  const loadFees = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);

      const term = search.trim();
      if (term) params.set("search", term);

      const query = params.toString();

      const [feeRes, summaryRes] = await Promise.all([
        api.get(`/fees${query ? `?${query}` : ""}`),
        api.get("/fees/summary"),
      ]);

      setFees(feeRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee records.");
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  // One debounced reload for both filters so typing does not fire a request per
  // keystroke, and clearing the box still refetches the full list.
  useEffect(() => {
    const timer = setTimeout(loadFees, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  useEffect(() => {
    api
      .get("/admin/students")
      .then(({ data }) =>
        setStudents(Array.isArray(data) ? data : data.students || [])
      )
      .catch(() => setStudents([]));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setBillForm(emptyBill);
    setShowBillForm(true);
    setMessage("");
  };

  const openEdit = (fee) => {
    setEditing(fee);
    setBillForm({
      studentId: fee.studentId || "",
      invoice: fee.invoice || "",
      title: fee.title || "",
      description: fee.description || "",
      amount: String(fee.amount ?? ""),
      paidAmount: String(fee.paidAmount ?? ""),
      dueDate: toDateInput(fee.dueDate),
    });
    setShowBillForm(true);
    setMessage("");
  };

  const saveBill = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      invoice: billForm.invoice.trim(),
      title: billForm.title.trim(),
      description: billForm.description.trim(),
      amount: Number(billForm.amount),
      dueDate: billForm.dueDate || undefined,
    };

    try {
      if (editing) {
        await api.patch(`/fees/${editing.id || editing._id}`, payload);
        setMessage(`${payload.title} updated.`);
      } else {
        await api.post("/fees", {
          ...payload,
          studentId: billForm.studentId,
          paidAmount: Number(billForm.paidAmount) || 0,
        });
        setMessage(`Bill raised for ${payload.title}.`);
      }

      setShowBillForm(false);
      setEditing(null);
      setBillForm(emptyBill);
      await loadFees();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save this bill.");
    } finally {
      setSaving(false);
    }
  };

  const openPayment = (fee) => {
    setPayingFee(fee);
    setPayment({ amount: String(fee.outstanding ?? 0), paidAt: "" });
    setError("");
    setMessage("");
  };

  const savePayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post(`/fees/${payingFee.id || payingFee._id}/payment`, {
        amount: Number(payment.amount),
        paidAt: payment.paidAt || undefined,
      });

      setMessage(
        `${money(payment.amount)} received on ${payingFee.title}.`
      );
      setPayingFee(null);
      await loadFees();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to record that payment.");
    } finally {
      setSaving(false);
    }
  };

  const deleteFee = async (fee) => {
    if (!window.confirm(`Delete bill ${fee.invoice || fee.title}?`)) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/fees/${fee.id || fee._id}`);
      setMessage("Bill deleted.");
      await loadFees();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete this bill.");
    }
  };

  const statusSegments = useMemo(() => {
    const byStatus = summary?.byStatus || {};

    return [
      { label: "Paid", value: byStatus.paid || 0, color: PALETTE.paid },
      { label: "Part paid", value: byStatus.partial || 0, color: PALETTE.sky },
      { label: "Pending", value: byStatus.pending || 0, color: PALETTE.pending },
      { label: "Overdue", value: byStatus.overdue || 0, color: PALETTE.absent },
    ].filter((segment) => segment.value > 0);
  }, [summary]);

  const update = (field) => (event) =>
    setBillForm((previous) => ({ ...previous, [field]: event.target.value }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            SMART SCHOOL MANAGEMENT SYSTEM
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <Wallet size={26} className="text-emerald-600 dark:text-emerald-400" />
            Fee Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Raise bills, record payments and track what the school is still due.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} /> New Bill
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Total billed"
          value={summary ? money(summary.billed) : "—"}
          hint={summary ? `${summary.bills} bills on record` : "loading…"}
        />
        <SummaryTile
          label="Collected"
          value={summary ? money(summary.collected) : "—"}
          hint={
            summary
              ? `${summary.collectionRate}% of all bills cleared`
              : "loading…"
          }
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryTile
          label="Outstanding"
          value={summary ? money(summary.outstanding) : "—"}
          hint={
            summary
              ? `${summary.unpaidCount} bills still awaiting payment`
              : "loading…"
          }
          tone="text-amber-600 dark:text-amber-400"
        />
        <SummaryTile
          label="Overdue"
          value={summary ? summary.overdueCount : "—"}
          hint="past their due date"
          tone="text-red-600 dark:text-red-400"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 size={16} /> {message}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Bills by status
          </h2>

          {statusSegments.length ? (
            <Donut
              data={statusSegments}
              size={150}
              thickness={20}
              centerValue={summary?.bills ?? 0}
              centerLabel="bills"
              className="mt-4"
            />
          ) : (
            <p className="mt-4 text-sm text-slate-400">No bills yet.</p>
          )}

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            A bill turns{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Paid</span> the
            moment its balance is cleared, and{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">Overdue</span> once an
            unpaid bill passes its due date.
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, invoice or fee title…"
                className="w-full rounded-xl border border-slate-200 bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Part paid</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>

            {search.trim() && (
              <button
                onClick={() => setSearch("")}
                className="rounded-xl border border-slate-200 bg-card px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-card">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Bill</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Due</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12">
                      <span className="flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 size={18} className="animate-spin" />
                        Loading fee records…
                      </span>
                    </td>
                  </tr>
                ) : fees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      No bills match these filters.
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => {
                    const style =
                      STATUS_STYLES[fee.status] || STATUS_STYLES.pending;

                    return (
                      <tr key={fee.id || fee._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {fee.studentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {fee.studentId}
                            {fee.className ? ` · ${fee.className}` : ""}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">{fee.title}</p>
                          <p className="text-xs text-slate-500">
                            {fee.invoice || "No invoice"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {money(fee.amount)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {fee.paidAmount > 0
                              ? `${money(fee.paidAmount)} paid`
                              : "nothing paid"}
                            {fee.outstanding > 0 && (
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {" "}
                                · {money(fee.outstanding)} due
                              </span>
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(fee.dueDate)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}
                          >
                            {style.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {fee.outstanding > 0 && (
                              <button
                                onClick={() => openPayment(fee)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                <Receipt size={14} /> Payment
                              </button>
                            )}

                            <button
                              onClick={() => openEdit(fee)}
                              aria-label={`Edit ${fee.invoice || fee.title}`}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={() => deleteFee(fee)}
                              aria-label={`Delete ${fee.invoice || fee.title}`}
                              className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showBillForm && (
        <Modal
          title={editing ? "Edit bill" : "Raise a new bill"}
          subtitle={
            editing
              ? "Payments already recorded against this bill stay untouched."
              : "The bill appears on the student's and parent's fee pages right away."
          }
          onClose={() => setShowBillForm(false)}
        >
          <form onSubmit={saveBill} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Student
              </label>
              <select
                required
                disabled={Boolean(editing)}
                value={billForm.studentId}
                onChange={update("studentId")}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student.studentId}>
                    {student.name} — {student.studentId}
                    {student.className ? ` (${student.className})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fee title
                </label>
                <input
                  required
                  value={billForm.title}
                  onChange={update("title")}
                  placeholder="Tuition — Term 1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Invoice number
                </label>
                <input
                  value={billForm.invoice}
                  onChange={update("invoice")}
                  placeholder="Auto-generated if left blank"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount (Rs.)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={billForm.amount}
                  onChange={update("amount")}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Due date
                </label>
                <input
                  type="date"
                  value={billForm.dueDate}
                  onChange={update("dueDate")}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                />
              </div>

              {!editing && (
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Already paid (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={billForm.paidAmount}
                    onChange={update("paidAmount")}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={billForm.description}
                onChange={update("description")}
                placeholder="What this bill covers"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing ? "Save changes" : "Raise bill"}
            </button>
          </form>
        </Modal>
      )}

      {payingFee && (
        <Modal
          title="Record a payment"
          subtitle={`${payingFee.studentName} · ${payingFee.title} · ${money(
            payingFee.outstanding
          )} outstanding`}
          onClose={() => setPayingFee(null)}
        >
          <form onSubmit={savePayment} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Amount received (Rs.)
              </label>
              <input
                required
                type="number"
                min="0.01"
                max={payingFee.outstanding}
                step="0.01"
                value={payment.amount}
                onChange={(event) =>
                  setPayment((previous) => ({
                    ...previous,
                    amount: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment date
              </label>
              <input
                type="date"
                value={payment.paidAt}
                onChange={(event) =>
                  setPayment((previous) => ({
                    ...previous,
                    paidAt: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Leave blank to stamp today. A payment that clears the balance
                marks the bill paid.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Record payment
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
