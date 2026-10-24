import ChangePassword from "./ChangePassword";

export default function AccountSettings() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Account
        </p>

        <h1 className="mt-2 font-serif text-3xl font-medium">Settings</h1>

        <p className="mt-2 text-sm text-slate-500">
          Your password is the only thing here — the school office keeps the rest
          of your record.
        </p>
      </div>

      <ChangePassword />
    </div>
  );
}
