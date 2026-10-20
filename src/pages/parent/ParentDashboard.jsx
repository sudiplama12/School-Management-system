import { Outlet } from "react-router-dom";

import {
  LayoutDashboard,
  User,
  MapPin,
  Navigation,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  Bell,
  Wallet,
  Settings,
  FileText,
} from "lucide-react";

import PortalShell from "../../components/PortalShell";

const navigation = [
  {
    name: "Dashboard",
    path: "/parent",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "My Child",
    path: "/parent/student",
    icon: User,
  },
  {
    name: "My Location",
    path: "/parent/student-location",
    icon: Navigation,
  },
  {
    name: "Location Requests",
    path: "/parent/location-requests",
    icon: MapPin,
  },
  {
    name: "Visit Requests",
    path: "/parent/visit-requests",
    icon: CalendarClock,
  },
  {
    name: "Visit History",
    path: "/parent/visits",
    icon: FileText,
  },
  {
    name: "Attendance",
    path: "/parent/attendance",
    icon: CalendarCheck,
  },
  {
    name: "Assignments",
    path: "/parent/assignments",
    icon: ClipboardList,
  },
  {
    name: "Notices",
    path: "/parent/notices",
    icon: Bell,
  },
  {
    name: "Fees",
    path: "/parent/fees",
    icon: Wallet,
  },
  {
    name: "Queries",
    path: "/parent/queries",
    icon: User,
  },
  {
    name: "Settings",
    path: "/parent/settings",
    icon: Settings,
  },
];

export default function ParentDashboard() {
  return (
    <PortalShell portal="Parent Portal" navigation={navigation}>
      <Outlet />
    </PortalShell>
  );
}
