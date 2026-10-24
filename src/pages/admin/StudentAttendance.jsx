import AttendanceSheet from "../../components/AttendanceSheet";

export default function AdminStudentAttendance() {
  return (
    <AttendanceSheet
      kind="student"
      title="Student Attendance"
      subtitle="Open the class, tick the exceptions, save the whole sheet."
    />
  );
}
