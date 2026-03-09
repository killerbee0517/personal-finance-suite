export function DbRequired() {
  return (
    <div className="ta-card p-6">
      <h2 className="text-lg font-semibold text-amber-700">Database Not Connected</h2>
      <p className="mt-2 text-sm text-slate-600">
        MySQL is not reachable. Start MySQL and configure <code>.env.local</code> with DB credentials, then refresh.
      </p>
    </div>
  );
}
