import { useState } from "react";
import {
  MapPin,
  Navigation,
  Home,
  Save,
  LocateFixed,
} from "lucide-react";

export default function HomeLocation() {
  const [location, setLocation] = useState({
    address: "Main Road",
    city: "Biratnagar",
    province: "Koshi Province",
    postalCode: "56613",
  });

  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setLocation({
      ...location,
      [field]: value,
    });

    setSaved(false);
  };

  const saveLocation = () => {
    localStorage.setItem(
      "student_home_location",
      JSON.stringify(location)
    );

    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Student Information
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium">
          Home Location
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Keep your residential information up to date.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Location card */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Home className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h2 className="font-semibold">Residential Address</h2>
              <p className="mt-1 text-xs text-slate-400">
                Your current home address
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <Input
              label="Address"
              value={location.address}
              onChange={(v) => update("address", v)}
            />

            <Input
              label="City"
              value={location.city}
              onChange={(v) => update("city", v)}
            />

            <Input
              label="Province"
              value={location.province}
              onChange={(v) => update("province", v)}
            />

            <Input
              label="Postal Code"
              value={location.postalCode}
              onChange={(v) => update("postalCode", v)}
            />
          </div>

          <button
            onClick={saveLocation}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save Location
          </button>

          {saved && (
            <p className="mt-3 text-center text-xs font-medium text-emerald-600">
              Location saved successfully.
            </p>
          )}
        </div>

        {/* Map placeholder */}
        <div className="relative min-h-[450px] overflow-hidden rounded-2xl border bg-slate-200">
          {/* Fake map background */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-1/4 top-0 h-full w-20 rotate-12 bg-white" />
            <div className="absolute left-1/2 top-0 h-full w-12 -rotate-45 bg-white" />
            <div className="absolute left-0 top-1/3 h-10 w-full rotate-6 bg-white" />
            <div className="absolute left-0 top-2/3 h-14 w-full -rotate-12 bg-white" />
            <div className="absolute left-1/3 top-1/4 h-20 w-20 rounded-full bg-emerald-100" />
            <div className="absolute right-1/4 bottom-1/4 h-28 w-28 rounded-full bg-emerald-100" />
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-xl shadow-amber-900/20">
              <MapPin className="h-7 w-7 text-slate-950" />
            </div>

            <div className="mt-3 rounded-xl bg-white px-4 py-2 text-center shadow-lg">
              <p className="text-xs font-bold text-slate-900">
                Your Home
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {location.city}, Nepal
              </p>
            </div>
          </div>

          <button
            className="absolute right-5 top-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-lg"
          >
            <LocateFixed className="h-4 w-4" />
            Use my location
          </button>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-lg">
            <Navigation className="h-4 w-4 text-amber-600" />
            {location.address}, {location.city}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white"
      />
    </div>
  );
}