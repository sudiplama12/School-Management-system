import {
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function Attendance() {
  const records = [
    {
      date: "2026-09-25",
      subject: "Web Technology",
      status: "Present",
    },
    {
      date: "2026-09-24",
      subject: "Economics",
      status: "Present",
    },
    {
      date: "2026-09-23",
      subject: "Database",
      status: "Absent",
    },
    {
      date: "2026-09-22",
      subject: "JavaScript",
      status: "Present",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Attendance
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        View your child's attendance record.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <Stat
          title="Attendance"
          value="92%"
          icon={CheckCircle}
        />

        <Stat
          title="Present"
          value="46"
          icon={CheckCircle}
        />

        <Stat
          title="Absent"
          value="4"
          icon={XCircle}
        />

      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>
              <th className="p-4 text-left text-xs text-slate-500">
                Date
              </th>

              <th className="p-4 text-left text-xs text-slate-500">
                Subject
              </th>

              <th className="p-4 text-left text-xs text-slate-500">
                Status
              </th>
            </tr>

          </thead>

          <tbody className="divide-y">

            {records.map((record) => (
              <tr key={`${record.date}-${record.subject}`}>

                <td className="p-4 text-sm">
                  {record.date}
                </td>

                <td className="p-4 text-sm font-medium">
                  {record.subject}
                </td>

                <td className="p-4">

                  {record.status === "Present" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      Present
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <XCircle className="h-3 w-3" />
                      Absent
                    </span>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function Stat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <Icon className="h-5 w-5 text-emerald-600" />

      <p className="mt-3 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}