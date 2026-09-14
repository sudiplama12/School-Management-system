import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  CalendarDays,
} from "lucide-react";

const feeSummary = {
  totalFee: 85000,
  paid: 60000,
  pending: 25000,
  dueDate: "September 30, 2026",
};

const feeHistory = [
  {
    id: 1,
    description: "Semester Fee",
    amount: 30000,
    date: "September 5, 2026",
    method: "Bank Transfer",
    status: "Paid",
    receipt: "REC-2026-001",
  },
  {
    id: 2,
    description: "Library Fee",
    amount: 5000,
    date: "August 20, 2026",
    method: "Cash",
    status: "Paid",
    receipt: "REC-2026-002",
  },
  {
    id: 3,
    description: "Examination Fee",
    amount: 10000,
    date: "August 10, 2026",
    method: "Bank Transfer",
    status: "Paid",
    receipt: "REC-2026-003",
  },
  {
    id: 4,
    description: "Admission / Tuition Fee",
    amount: 15000,
    date: "July 15, 2026",
    method: "Online",
    status: "Paid",
    receipt: "REC-2026-004",
  },
];

export default function Fee() {
  const paymentPercentage = Math.round(
    (feeSummary.paid / feeSummary.totalFee) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Finance
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium text-slate-900">
          Fee Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your fee details, payment status, and transaction history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={CreditCard}
          label="Total Fee"
          value={`NPR ${feeSummary.totalFee.toLocaleString()}`}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Paid Amount"
          value={`NPR ${feeSummary.paid.toLocaleString()}`}
          iconStyle="success"
        />

        <SummaryCard
          icon={Clock}
          label="Pending Amount"
          value={`NPR ${feeSummary.pending.toLocaleString()}`}
          iconStyle="warning"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Due Date"
          value={feeSummary.dueDate}
          small
        />
      </div>

      {/* Payment Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Payment Progress
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {paymentPercentage}% of your total fee has been paid.
            </p>
          </div>

          <span className="text-lg font-semibold text-slate-900">
            {paymentPercentage}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs">
          <span className="text-slate-400">
            Paid: NPR {feeSummary.paid.toLocaleString()}
          </span>

          <span className="font-medium text-amber-700">
            Remaining: NPR {feeSummary.pending.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pending Payment Alert */}
      {feeSummary.pending > 0 && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">
              Pending Fee Payment
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              You have NPR {feeSummary.pending.toLocaleString()} remaining.
              Please complete your payment before {feeSummary.dueDate}.
            </p>

            <button
              type="button"
              className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Pay Pending Fee
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your recent fee transactions.
            </p>
          </div>

          <Receipt className="h-5 w-5 text-slate-400" />
        </div>

        <div className="divide-y divide-slate-100">
          {feeHistory.map((payment) => (
            <div
              key={payment.id}
              className="p-5 transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Receipt className="h-4 w-4 text-slate-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {payment.description}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {payment.date} • {payment.method}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Receipt: {payment.receipt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      NPR {payment.amount.toLocaleString()}
                    </p>

                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {payment.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Note:</span>{" "}
          Payment information shown here is currently demo data. Online
          payment and receipt generation can be connected to the backend
          later.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconStyle = "default",
  small = false,
}) {
  const iconClasses = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            iconClasses[iconStyle]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-400">{label}</p>

          <p
            className={`mt-1 font-semibold text-slate-900 ${
              small ? "text-sm" : "text-lg"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}