import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  CalendarDays,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ATTENDANCE_KEY = "school_attendance";

// =====================================================
// DEMO AUTHORIZED CLASS
// =====================================================
// Later this should come from the backend/admin authorization.
const AUTHORIZED_CLASS = "BIM 6th Semester";

// =====================================================
// DEMO STUDENTS
// =====================================================
const STUDENTS = [
  {
    id: "ST001",
    name: "Aarav Sharma",
    rollNo: "01",
    className: "BIM 6th Semester",
  },
  {
    id: "ST002",
    name: "Sita Rai",
    rollNo: "02",
    className: "BIM 6th Semester",
  },
  {
    id: "ST003",
    name: "Prakash Thapa",
    rollNo: "03",
    className: "BIM 6th Semester",
  },
  {
    id: "ST004",
    name: "Anisha Gurung",
    rollNo: "04",
    className: "BIM 6th Semester",
  },
  {
    id: "ST005",
    name: "Bibek Karki",
    rollNo: "05",
    className: "BIM 6th Semester",
  },

  // This student should NOT appear for this teacher.
  {
    id: "ST006",
    name: "Ramesh Adhikari",
    rollNo: "06",
    className: "BCA 5th Semester",
  },
];

// =====================================================
// SUBJECTS
// =====================================================
const SUBJECTS = [
  "Web Technology",
  "Database Management System",
  "Artificial Intelligence",
  "Computer Security",
  "Project",
];

// =====================================================
// DATE
// =====================================================
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// =====================================================
// LOAD ATTENDANCE
// =====================================================
function loadAttendance() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ATTENDANCE_KEY)
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [selectedSubject, setSelectedSubject] = useState(
    SUBJECTS[0]
  );

  const [attendance, setAttendance] = useState(
    loadAttendance
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [expandedStudent, setExpandedStudent] =
    useState(null);

  // ===================================================
  // SAVE TO LOCAL STORAGE
  // ===================================================
  useEffect(() => {
    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify(attendance)
    );
  }, [attendance]);

  // ===================================================
  // ONLY AUTHORIZED CLASS STUDENTS
  // ===================================================
  const authorizedStudents = useMemo(() => {
    return STUDENTS.filter(
      (student) =>
        student.className === AUTHORIZED_CLASS
    );
  }, []);

  // ===================================================
  // GET ATTENDANCE FOR CURRENT DATE + SUBJECT
  // ===================================================
  const currentAttendance = useMemo(() => {
    return attendance.filter(
      (record) =>
        record.date === selectedDate &&
        record.subject === selectedSubject &&
        record.className === AUTHORIZED_CLASS
    );
  }, [
    attendance,
    selectedDate,
    selectedSubject,
  ]);

  // ===================================================
  // STUDENT STATUS
  // ===================================================
  const getStudentStatus = (studentId) => {
    const record = currentAttendance.find(
      (item) => item.studentId === studentId
    );

    return record?.status || "unmarked";
  };

  // ===================================================
  // MARK ATTENDANCE
  // ===================================================
  const markAttendance = (student, status) => {
    setAttendance((previous) => {
      const filtered = previous.filter(
        (record) =>
          !(
            record.studentId === student.id &&
            record.date === selectedDate &&
            record.subject === selectedSubject
          )
      );

      return [
        ...filtered,
        {
          id: `${student.id}-${selectedDate}-${selectedSubject}`,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          className: student.className,
          subject: selectedSubject,
          date: selectedDate,
          status,
          markedAt: new Date().toISOString(),
        },
      ];
    });
  };

  // ===================================================
  // CANCEL ATTENDANCE
  // ===================================================
  const cancelAttendance = (student) => {
    setAttendance((previous) =>
      previous.filter(
        (record) =>
          !(
            record.studentId === student.id &&
            record.date === selectedDate &&
            record.subject === selectedSubject
          )
      )
    );
  };

  // ===================================================
  // FILTER STUDENTS
  // ===================================================
  const filteredStudents = useMemo(() => {
    return authorizedStudents.filter((student) => {
      const matchesSearch =
        student.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        student.rollNo
          .toLowerCase()
          .includes(search.toLowerCase());

      const status = getStudentStatus(student.id);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    authorizedStudents,
    search,
    statusFilter,
    currentAttendance,
  ]);

  // ===================================================
  // COUNTS
  // ===================================================
  const totalStudents = authorizedStudents.length;

  const presentCount = currentAttendance.filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = currentAttendance.filter(
    (record) => record.status === "absent"
  ).length;

  const unmarkedCount =
    totalStudents - presentCount - absentCount;

  const attendancePercentage =
    totalStudents > 0
      ? Math.round(
          (presentCount / totalStudents) * 100
        )
      : 0;

  // ===================================================
  // STUDENT DETAIL
  // ===================================================
  const getStudentHistory = (studentId) => {
    return attendance
      .filter(
        (record) =>
          record.studentId === studentId &&
          record.className === AUTHORIZED_CLASS
      )
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );
  };

  // ===================================================
  // TOGGLE DETAILS
  // ===================================================
  const toggleDetails = (studentId) => {
    setExpandedStudent((previous) =>
      previous === studentId
        ? null
        : studentId
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Attendance
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage attendance for your authorized class.
                </p>
              </div>
            </div>
          </div>

          {/* CLASS */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-medium text-emerald-600">
              Authorized Class
            </p>

            <p className="mt-1 font-bold text-emerald-800">
              {AUTHORIZED_CLASS}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* DATE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Attendance Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* SUBJECT */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(e) =>
                setSelectedSubject(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {SUBJECTS.map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Student
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Name or roll number..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          textClass="text-slate-900"
        />

        {/* PRESENT */}
        <StatCard
          title="Present"
          value={presentCount}
          icon={CheckCircle2}
          textClass="text-emerald-600"
        />

        {/* ABSENT */}
        <StatCard
          title="Absent"
          value={absentCount}
          icon={XCircle}
          textClass="text-red-600"
        />

        {/* PERCENTAGE */}
        <StatCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          icon={CalendarDays}
          textClass="text-blue-600"
        />
      </div>

      {/* =================================================
          UNMARKED NOTICE
      ================================================= */}

      {unmarkedCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <RotateCcw className="h-5 w-5 text-amber-600" />

          <p className="text-sm text-amber-800">
            <span className="font-bold">
              {unmarkedCount}
            </span>{" "}
            student{unmarkedCount !== 1 ? "s are" : " is"}{" "}
            not marked yet for this subject.
          </p>
        </div>
      )}

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="mb-4 flex flex-wrap gap-2">

        <FilterButton
          active={statusFilter === "all"}
          onClick={() =>
            setStatusFilter("all")
          }
        >
          All ({totalStudents})
        </FilterButton>

        <FilterButton
          active={statusFilter === "present"}
          onClick={() =>
            setStatusFilter("present")
          }
        >
          Present ({presentCount})
        </FilterButton>

        <FilterButton
          active={statusFilter === "absent"}
          onClick={() =>
            setStatusFilter("absent")
          }
        >
          Absent ({absentCount})
        </FilterButton>

        <FilterButton
          active={statusFilter === "unmarked"}
          onClick={() =>
            setStatusFilter("unmarked")
          }
        >
          Unmarked ({unmarkedCount})
        </FilterButton>

      </div>

      {/* =================================================
          STUDENT TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="bg-slate-50">

              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Roll No.
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Mark Attendance
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Details
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredStudents.map((student) => {

                const status =
                  getStudentStatus(student.id);

                const isExpanded =
                  expandedStudent === student.id;

                return (
                  <StudentRow
                    key={student.id}
                    student={student}
                    status={status}
                    isExpanded={isExpanded}
                    selectedSubject={selectedSubject}
                    onMark={markAttendance}
                    onCancel={cancelAttendance}
                    onDetails={toggleDetails}
                    history={getStudentHistory(
                      student.id
                    )}
                  />
                );
              })}

            </tbody>

          </table>
        </div>

        {/* EMPTY */}
        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">

            <Users className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 font-bold text-slate-800">
              No students found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter.
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          SECURITY INFORMATION
      ================================================= */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Class authorization:
          </span>{" "}
          This demo displays students assigned to{" "}
          <span className="font-semibold">
            {AUTHORIZED_CLASS}
          </span>
          . In the production backend, the admin-authorized
          class should be verified server-side.
        </p>
      </div>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================
function StatCard({
  title,
  value,
  icon: Icon,
  textClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${textClass}`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>

      </div>

    </div>
  );
}

// =====================================================
// FILTER BUTTON
// =====================================================
function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

// =====================================================
// STUDENT ROW
// =====================================================
function StudentRow({
  student,
  status,
  isExpanded,
  onMark,
  onCancel,
  onDetails,
  history,
}) {
  return (
    <>
      <tr className="hover:bg-slate-50">

        {/* STUDENT */}
        <td className="px-5 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                {student.name}
              </p>

              <p className="text-xs text-slate-400">
                {student.id}
              </p>
            </div>

          </div>

        </td>

        {/* ROLL */}
        <td className="px-5 py-5">
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {student.rollNo}
          </span>
        </td>

        {/* STATUS */}
        <td className="px-5 py-5">

          {status === "present" && (
            <StatusBadge
              text="Present"
              type="present"
            />
          )}

          {status === "absent" && (
            <StatusBadge
              text="Absent"
              type="absent"
            />
          )}

          {status === "unmarked" && (
            <StatusBadge
              text="Not Marked"
              type="unmarked"
            />
          )}

        </td>

        {/* ACTIONS */}
        <td className="px-5 py-5">

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                onMark(student, "present")
              }
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                status === "present"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Present
            </button>

            <button
              type="button"
              onClick={() =>
                onMark(student, "absent")
              }
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                status === "absent"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Absent
            </button>

            {status !== "unmarked" && (
              <button
                type="button"
                onClick={() =>
                  onCancel(student)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
                Cancel
              </button>
            )}

          </div>

        </td>

        {/* DETAILS */}
        <td className="px-5 py-5 text-right">

          <button
            type="button"
            onClick={() =>
              onDetails(student.id)
            }
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
          >
            Details

            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

        </td>

      </tr>

      {/* =================================================
          STUDENT DETAILS
      ================================================= */}

      {isExpanded && (
        <tr>
          <td
            colSpan="5"
            className="bg-slate-50 px-5 py-6"
          >

            <div className="rounded-xl border border-slate-200 bg-white p-5">

              <div className="mb-4 flex items-center gap-3">

                <BookOpen className="h-5 w-5 text-emerald-600" />

                <div>
                  <h3 className="font-bold text-slate-800">
                    {student.name}'s Attendance Details
                  </h3>

                  <p className="text-xs text-slate-500">
                    Subject-wise attendance history
                  </p>
                </div>

              </div>

              {history.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No attendance records found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[600px]">

                    <thead>
                      <tr className="border-b border-slate-200">

                        <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-400">
                          Date
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-400">
                          Subject
                        </th>

                        <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-400">
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {history.map((record) => (
                        <tr key={record.id}>

                          <td className="px-3 py-3 text-sm text-slate-600">
                            {record.date}
                          </td>

                          <td className="px-3 py-3 text-sm font-medium text-slate-700">
                            {record.subject}
                          </td>

                          <td className="px-3 py-3">

                            <StatusBadge
                              text={
                                record.status ===
                                "present"
                                  ? "Present"
                                  : "Absent"
                              }
                              type={record.status}
                            />

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </td>
        </tr>
      )}

    </>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================
function StatusBadge({ text, type }) {
  const styles = {
    present:
      "bg-emerald-50 text-emerald-700",
    absent:
      "bg-red-50 text-red-700",
    unmarked:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[type] || styles.unmarked
      }`}
    >
      {text}
    </span>
  );
}