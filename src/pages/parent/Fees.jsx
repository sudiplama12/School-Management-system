import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "../../api/axios";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/fees/my-fees")
      .then(({ data }) => {
        if (active) setFees(data);
      })
      .catch((err) => {
        if (active)
          setError(err?.response?.data?.message || "Unable to load fees.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // The API stores statuses in lowercase ("paid"); the page shows labels.
  const isPaid = (fee) => String(fee.status || "").toLowerCase() === "paid";
  const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Fees
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        View your child's fee information.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">

        {loading ? (
          <p className="text-sm text-slate-500">Loading fees…</p>
        ) : fees.length === 0 ? (
          <p className="text-sm text-slate-500">No fee records for your child.</p>
        ) : (
          fees.map((fee) => (
            <div
              key={fee.id || fee.invoice}
              className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="flex-1">

                <h2 className="font-semibold text-slate-800">
                  {fee.title}
                </h2>

                <p className="mt-1 text-sm font-bold">
                  {money(fee.amount)}
                </p>

              </div>

              {isPaid(fee) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}

            </div>
          ))
        )}

      </div>

    </div>
  );
}