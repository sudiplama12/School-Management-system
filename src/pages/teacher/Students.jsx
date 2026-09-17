import { useMemo, useState } from "react";
import {
  Search,
  Users,
  User,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Eye,
  Pencil,
  Trash2,
  X,
  Filter,
  ChevronDown,
} from "lucide-react";

const initialStudents = [
  {
    id: 1,
    studentId: "STU-001",
    name: "Aarav Sharma",
    gender: "Male",
    className: "Grade 10",
    section: "A",
    email: "aarav@example.com",
    phone: "9800000001",
    location: "Birtamode",
    address: "Birtamode, Jhapa",
    parent: "Raj Sharma",
    attendance: "94%",
    status: "Active",
  },
  {
    id: 2,
    studentId: "STU-002",
    name: "Anisha Rai",
    gender: "Female",
    className: "Grade 10",
    section: "A",
    email: "anisha@example.com",
    phone: "9800000002",
    location: "Damak",
    address: "Damak, Jhapa",
    parent: "Milan Rai",
    attendance: "91%",
    status: "Active",
  },
  {
    id: 3,
    studentId: "STU-003",
    name: "Bibek Tamang",
    gender: "Male",
    className: "Grade 9",
    section: "B",
    email: "bibek@example.com",
    phone: "9800000003",
    location: "Mechinagar",
    address: "Mechinagar, Jhapa",
    parent: "Dawa Tamang",
    attendance: "88%",
    status: "Active",
  },
  {
    id: 4,
    studentId: "STU-004",
    name: "Diya Gurung",
    gender: "Female",
    className: "Grade 8",
    section: "A",
    email: "diya@example.com",
    phone: "9800000004",
    location: "Bhadrapur",
    address: "Bhadrapur, Jhapa",
    parent: "Ramesh Gurung",
    attendance: "96%",
    status: "Active",
  },
  {
    id: 5,
    studentId: "STU-005",
    name: "Kiran Limbu",
    gender: "Male",
    className: "Grade 9",
    section: "A",
    email: "kiran@example.com",
    phone: "9800000005",
    location: "Kakarvitta",
    address: "Kakarvitta, Jhapa",
    parent: "Prem Limbu",
    attendance: "89%",
    status: "Active",
  },
  {
    id: 6,
    studentId: "STU-006",
    name: "Manisha Karki",
    gender: "Female",
    className: "Grade 10",
    section: "B",
    email: "manisha@example.com",
    phone: "9800000006",
    location: "Dhulabari",
    address: "Dhulabari, Jhapa",
    parent: "Suresh Karki",
    attendance: "93%",
    status: "Active",
  },
  {
    id: 7,
    studentId: "STU-007",
    name: "Nischal Thapa",
    gender: "Male",
    className: "Grade 8",
    section: "B",
    email: "nischal@example.com",
    phone: "9800000007",
    location: "Chandragadhi",
    address: "Chandragadhi, Jhapa",
    parent: "Hari Thapa",
    attendance: "86%",
    status: "Active",
  },
  {
    id: 8,
    studentId: "STU-008",
    name: "Pragya Adhikari",
    gender: "Female",
    className: "Grade 9",
    section: "A",
    email: "pragya@example.com",
    phone: "9800000008",
    location: "Birtamode",
    address: "Birtamode, Jhapa",
    parent: "Rabin Adhikari",
    attendance: "95%",
    status: "Active",
  },
];

const classOptions = [
  "All Classes",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const genderOptions = [
  "All Genders",
  "Male",
  "Female",
];

export default function Students() {
  const [students, setStudents] = useState(initialStudents);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [genderFilter, setGenderFilter] = useState("All Genders");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [sortOrder, setSortOrder] = useState("az");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const locations = [
    "All Locations",
    ...new Set(students.map((student) => student.location)),
  ];

  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.location.toLowerCase().includes(query)
      );
    }

    // Class filter
    if (classFilter !== "All Classes") {
      result = result.filter(
        (student) => student.className === classFilter
      );
    }

    // Gender filter
    if (genderFilter !== "All Genders") {
      result = result.filter(
        (student) => student.gender === genderFilter
      );
    }

    // Location filter
    if (locationFilter !== "All Locations") {
      result = result.filter(
        (student) => student.location === locationFilter
      );
    }

    // Alphabetical sort
    result.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);

      return sortOrder === "az"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    students,
    search,
    classFilter,
    genderFilter,
    locationFilter,
    sortOrder,
  ]);

  const handleDelete = (id) => {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Remove ${student.name} from the student list?`
    );

    if (!confirmed) return;

    setStudents((current) =>
      current.filter((item) => item.id !== id)
    );

    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
    }
  };

  const handleUpdate = (updatedStudent) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === updatedStudent.id
          ? updatedStudent
          : student
      )
    );

    setEditingStudent(null);
  };

  const clearFilters = () => {
    setSearch("");
    setClassFilter("All Classes");
    setGenderFilter("All Genders");
    setLocationFilter("All Locations");
    setSortOrder("az");
  };

  const totalStudents = students.length;

  const maleStudents = students.filter(
    (student) => student.gender === "Male"
  ).length;

  const femaleStudents = students.filter(
    (student) => student.gender === "Female"
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Students
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage students assigned to your classes.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-white">
            <Users className="h-5 w-5" />
            <span className="font-semibold">
              {filteredStudents.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
        />

        <StatCard
          title="Male Students"
          value={maleStudents}
          icon={User}
        />

        <StatCard
          title="Female Students"
          value={femaleStudents}
          icon={User}
        />
      </section>

      {/* Search */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, student ID, email or location..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-600" />

          <h2 className="font-semibold text-slate-900">
            Filter Students
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Class */}
          <FilterSelect
            label="Class"
            value={classFilter}
            onChange={setClassFilter}
            options={classOptions}
          />

          {/* Gender */}
          <FilterSelect
            label="Gender"
            value={genderFilter}
            onChange={setGenderFilter}
            options={genderOptions}
          />

          {/* Location */}
          <FilterSelect
            label="Home Location"
            value={locationFilter}
            onChange={setLocationFilter}
            options={locations}
          />

          {/* Alphabet */}
          <FilterSelect
            label="Alphabetical Order"
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Clear all filters
        </button>
      </section>

      {/* Results */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Student List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No students found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Class
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Home Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Attendance
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                          {student.name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        {student.className} - {student.section}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {student.gender}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        {student.location}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-700">
                        {student.attendance}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          title="View Details"
                          onClick={() =>
                            setSelectedStudent(student)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="Edit Student"
                          onClick={() =>
                            setEditingStudent(student)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="Delete Student"
                          danger
                          onClick={() =>
                            handleDelete(student.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* View Details Modal */}
      {selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            setEditingStudent(selectedStudent);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

/* Statistics Card */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
      </div>
    </div>
  );
}

/* Filter Select */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        >
          {options.map((option) => {
            const item =
              typeof option === "string"
                ? {
                    value: option,
                    label: option,
                  }
                : option;

            return (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            );
          })}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

/* Action Button */

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/* Student Details */

function StudentDetails({
  student,
  onClose,
  onEdit,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between border-b p-6">
        <div>
          <p className="text-sm font-medium text-amber-600">
            Student Details
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {student.name}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {student.studentId}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
            {student.name.charAt(0)}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              {student.name}
            </h3>

            <p className="text-sm text-slate-500">
              {student.className} - Section{" "}
              {student.section}
            </p>

            <span className="mt-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {student.status}
            </span>
          </div>
        </div>

        {/* Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon={GraduationCap}
            label="Class"
            value={`${student.className} - ${student.section}`}
          />

          <InfoItem
            icon={User}
            label="Gender"
            value={student.gender}
          />

          <InfoItem
            icon={Mail}
            label="Email"
            value={student.email}
          />

          <InfoItem
            icon={Phone}
            label="Phone"
            value={student.phone}
          />

          <InfoItem
            icon={MapPin}
            label="Home Location"
            value={student.location}
          />

          <InfoItem
            icon={User}
            label="Parent / Guardian"
            value={student.parent}
          />
        </div>

        {/* Address */}
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-amber-600" />

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Home Address
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {student.address}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
            Edit Student
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* Information Item */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-amber-600" />

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Edit Student Modal */

function EditStudentModal({
  student,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(student);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <p className="text-sm font-medium text-amber-600">
            Student Management
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Edit Student
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Student Name"
            value={form.name}
            onChange={(value) =>
              handleChange("name", value)
            }
          />

          <FormInput
            label="Student ID"
            value={form.studentId}
            onChange={(value) =>
              handleChange("studentId", value)
            }
          />

          <FormInput
            label="Email"
            value={form.email}
            onChange={(value) =>
              handleChange("email", value)
            }
          />

          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              handleChange("phone", value)
            }
          />

          <FormInput
            label="Class"
            value={form.className}
            onChange={(value) =>
              handleChange("className", value)
            }
          />

          <FormInput
            label="Section"
            value={form.section}
            onChange={(value) =>
              handleChange("section", value)
            }
          />

          <FormInput
            label="Gender"
            value={form.gender}
            onChange={(value) =>
              handleChange("gender", value)
            }
          />

          <FormInput
            label="Home Location"
            value={form.location}
            onChange={(value) =>
              handleChange("location", value)
            }
          />
        </div>

        <FormInput
          label="Home Address"
          value={form.address}
          onChange={(value) =>
            handleChange("address", value)
          }
        />

        <FormInput
          label="Parent / Guardian"
          value={form.parent}
          onChange={(value) =>
            handleChange("parent", value)
          }
        />

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Form Input */

function FormInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      />
    </div>
  );
}

/* Modal */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}