import { Outlet } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserRound,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Library,
  BookMarked,
  RotateCcw,
  Wallet,
  Newspaper,
} from "lucide-react";

import PortalShell from "./PortalShell";

const navigation = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { name: "School Blog", path: "/admin/blog", icon: Newspaper },
];

const groups = [
  {
    title: "Teacher Management",
    icon: Users,
    items: [
      { title: "Manage Teachers", path: "/admin/teachers", icon: Users },
      {
        title: "Teacher Attendance",
        path: "/admin/teacher-attendance",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Student Management",
    icon: GraduationCap,
    items: [
      {
        title: "Manage Students",
        path: "/admin/students",
        icon: GraduationCap,
      },
      {
        title: "Student Attendance",
        path: "/admin/attendance",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Library Management",
    icon: Library,
    items: [
      { title: "Manage Books", path: "/admin/library/books", icon: BookOpen },
      { title: "Issue Books", path: "/admin/library/issue", icon: BookMarked },
      { title: "Return Books", path: "/admin/library/return", icon: RotateCcw },
    ],
  },
  {
    title: "Result Management",
    icon: ClipboardCheck,
    items: [
      { title: "Subjects, Terms & Results", path: "/admin/results", icon: ClipboardCheck },
    ],
  },
  {
    title: "Fee Management",
    icon: Wallet,
    items: [{ title: "Fees & Payments", path: "/admin/fees", icon: Wallet }],
  },
  {
    title: "Users & Access",
    icon: ShieldCheck,
    items: [
      { title: "Manage Parents", path: "/admin/parents", icon: UserRound },
      { title: "Permissions", path: "/admin/permissions", icon: ShieldCheck },
      { title: "All Users", path: "/admin/users", icon: Users },
    ],
  },
];

export default function AdminLayout() {
  return (
    <PortalShell portal="Admin Portal" navigation={navigation} groups={groups}>
      <Outlet />
    </PortalShell>
  );
}
