import {
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  BookOpen,
} from "lucide-react";

export default function StudentDetails() {
  const student = {
    id: "ST001",
    name: "Aarav Sharma",
    className: "BIM 6th Semester",
    section: "A",
    rollNo: "12",
    email: "aarav@example.com",
    phone: "98XXXXXXXX",
    admissionDate: "2023-09-15",
    address: "Bharatpur, Chitwan",
    program: "Bachelor of Information Management",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Student Details
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your child's academic and personal information.
        </p>
      </div>

      {/* PROFILE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-10 w-10 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {student.name}
            </h2>

            <p className="text-sm text-slate-500">
              Student ID: {student.id}
            </p>

            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active Student
            </span>
          </div>

        </div>

      </div>

      {/* INFORMATION */}
      <div className="grid gap-5 md:grid-cols-2">

        <Info
          icon={GraduationCap}
          label="Program"
          value={student.program}
        />

        <Info
          icon={BookOpen}
          label="Class"
          value={student.className}
        />

        <Info
          icon={User}
          label="Section"
          value={student.section}
        />

        <Info
          icon={User}
          label="Roll Number"
          value={student.rollNo}
        />

        <Info
          icon={Mail}
          label="Email"
          value={student.email}
        />

        <Info
          icon={Phone}
          label="Phone"
          value={student.phone}
        />

        <Info
          icon={CalendarDays}
          label="Admission Date"
          value={student.admissionDate}
        />

        <Info
          icon={MapPin}
          label="Address"
          value={student.address}
        />

      </div>

    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>

    </div>
  );
}