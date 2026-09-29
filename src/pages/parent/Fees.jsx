import {
  Wallet,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function Fees() {
  const fees = [
    {
      title: "Semester Fee",
      amount: "Rs. 45,000",
      status: "Paid",
    },
    {
      title: "Library Fee",
      amount: "Rs. 2,000",
      status: "Paid",
    },
    {
      title: "Examination Fee",
      amount: "Rs. 3,000",
      status: "Pending",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Fees
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        View your child's fee information.
      </p>

      <div className="mt-6 space-y-4">

        {fees.map((fee) => (
          <div
            key={fee.title}
            className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="flex-1">

              <h2 className="font-semibold text-slate-800">
                {fee.title}
              </h2>

              <p className="mt-1 text-sm font-bold">
                {fee.amount}
              </p>

            </div>

            {fee.status === "Paid" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle className="h-3 w-3" />
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}