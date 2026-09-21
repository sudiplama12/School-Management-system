import { useState } from "react";
import {
  Search,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

export default function StudentLocation() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState({});

  const students = [
    {
      id: "ST001",
      name: "Aarav Sharma",
      className: "BIM 6th Semester",
      locationStatus: "not_available",
    },
    {
      id: "ST002",
      name: "Sita Thapa",
      className: "BIM 6th Semester",
      locationStatus: "pending",
    },
    {
      id: "ST003",
      name: "Bibek Rai",
      className: "BIM 6th Semester",
      locationStatus: "approved",
    },
    {
      id: "ST004",
      name: "Anisha Gurung",
      className: "BIM 6th Semester",
      locationStatus: "not_available",
    },
  ];

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const requestLocation = (studentId) => {
    setRequests((previous) => ({
      ...previous,
      [studentId]: "pending",
    }));
  };

  const getStatus = (student) => {
    return requests[student.id] || student.locationStatus;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Student Location
              </h1>

              <p className="text-sm text-slate-500">
                Request student home locations from parents.
              </p>
            </div>
          </div>
        </div>

        {/* PRIVACY INFO */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h2 className="font-semibold text-blue-900">
                Location Privacy
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Teachers can only access a student's home
                location after the parent approves the request.
                The system does not continuously track students.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* STUDENTS */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => {
            const status = getStatus(student);

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* STUDENT */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {student.name}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {student.id} • {student.className}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Home Location Status
                  </p>

                  <div className="mt-2">
                    {status === "approved" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="h-4 w-4" />
                        Location Approved
                      </span>
                    )}

                    {status === "pending" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <Clock className="h-4 w-4" />
                        Request Pending
                      </span>
                    )}

                    {status === "not_available" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <XCircle className="h-4 w-4" />
                        Location Not Available
                      </span>
                    )}
                  </div>
                </div>

                {/* ACTION */}
                <div className="mt-5">
                  {status === "not_available" && (
                    <button
                      onClick={() =>
                        requestLocation(student.id)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Send className="h-4 w-4" />
                      Request Location
                    </button>
                  )}

                  {status === "pending" && (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700"
                    >
                      <Clock className="h-4 w-4" />
                      Waiting for Parent
                    </button>
                  )}

                  {status === "approved" && (
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700"
                    >
                      <MapPin className="h-4 w-4" />
                      View Location
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}