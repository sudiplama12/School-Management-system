import AttendanceSheet from "../../components/AttendanceSheet";

// The class register: opens on the teacher's own class with everyone present,
// and only the day's exceptions need clicking.
export default function TeacherAttendance() {
  return (
    <AttendanceSheet
      kind="student"
      title="Attendance"
      subtitle="Mark your class for the day."
    />
  );
}
