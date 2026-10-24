import AttendanceSheet from "../../components/AttendanceSheet";

export default function AdminTeacherAttendance() {
  return (
    <AttendanceSheet
      kind="teacher"
      title="Teacher Attendance"
      subtitle="The staff register for the day — marked by the office."
    />
  );
}
