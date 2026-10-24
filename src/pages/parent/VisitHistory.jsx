import { useEffect, useState } from "react";

import {
  CalendarDays,
  MapPin,
  User,
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function VisitHistory() {
  const { childStudentId } = useAuth();

  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!childStudentId) {
      setError("No child is linked to this parent account.");
      setLoading(false);
      return;
    }

    const loadVisits = async () => {
      try {
        const response = await api.get(
          `/visits/student/${childStudentId}`
        );

        if (active) setVisits(response.data || []);
      } catch (err) {
        if (active)
          setError(
            err?.response?.data?.message ||
              "Unable to load home visit history."
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadVisits();

    return () => {
      active = false;
    };
  }, [childStudentId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Home Visit History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View previous home visits conducted by teachers.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">
            Loading home visit history…
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>
        </div>
      ) : visits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">

          <FileText className="mx-auto h-10 w-10 text-slate-400" />

          <p className="mt-3 text-sm text-slate-500">
            No home visit history available.
          </p>

        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                    Teacher
                  </th>

                  <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs uppercase text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {visits.map((visit) => (

                  <tr key={visit._id}>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {visit.teacherName ||
                            visit.teacherId ||
                            "Teacher"}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        <span className="text-sm text-slate-600">
                          {visit.visitDate
                            ? new Date(
                                visit.visitDate
                              ).toLocaleDateString()
                            : "-"}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">

                        <CheckCircle className="h-3.5 w-3.5" />

                        Completed

                      </span>

                    </td>

                    <td className="px-5 py-4 text-right">

                      <button
                        onClick={() =>
                          setSelectedVisit(visit)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                      >

                        <Eye className="h-4 w-4" />

                        View Details

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card">

            <div className="flex items-center justify-between border-b p-5">

              <div>

                <h2 className="font-bold text-slate-800">
                  Home Visit Details
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedVisit.teacherName ||
                    "Teacher"}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedVisit(null)
                }
                className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              >
                Close
              </button>

            </div>

            <div className="space-y-5 p-5">

              <Detail
                title="Observation"
                text={
                  selectedVisit.observation ||
                  "No observation recorded."
                }
              />

              <Detail
                title="Remarks"
                text={
                  selectedVisit.remarks ||
                  "No remarks recorded."
                }
              />

              <Detail
                title="Recommendations"
                text={
                  selectedVisit.recommendations ||
                  "No recommendations recorded."
                }
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function Detail({ title, text }) {
  return (
    <div>

      <h3 className="mb-2 font-semibold text-slate-700">
        {title}
      </h3>

      <div className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
        {text}
      </div>

    </div>
  );
}