import { Settings, Bell, MapPin } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">

      <h1 className="text-2xl font-bold text-slate-800">
        Settings
      </h1>

      <div className="mt-6 space-y-4">

        <Setting
          icon={Bell}
          title="Notifications"
          description="Receive important school notifications."
        />

        <Setting
          icon={MapPin}
          title="Location Requests"
          description="Allow teachers to request your child's home location."
        />

        <Setting
          icon={Settings}
          title="Account Settings"
          description="Manage your parent account."
        />

      </div>

    </div>
  );
}

function Setting({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>

      <div>
        <h2 className="font-semibold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}