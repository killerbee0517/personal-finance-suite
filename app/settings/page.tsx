import Link from "next/link";
import {
  applyBackupPreviewAction,
  createBackupPreviewAction,
  rejectBackupPreviewAction,
  resetDataAction,
} from "@/app/actions/data";
import { loadBackupImportPreview } from "@/lib/backup";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; import?: string }>;
}) {
  const params = await searchParams;
  const previewId = params?.preview;
  const importStatus = params?.import;
  const preview = previewId ? await loadBackupImportPreview(previewId) : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {importStatus === "applied" ? (
        <div className="ta-card border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Backup import applied successfully.
        </div>
      ) : null}

      {importStatus === "rejected" ? (
        <div className="ta-card border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Backup import rejected.
        </div>
      ) : null}

      <div className="ta-card p-4">
        <h2 className="font-semibold">Notification Settings</h2>
        <p className="mt-1 text-sm text-slate-600">Desktop reminder integration placeholder.</p>
      </div>

      <div className="ta-card p-4">
        <h2 className="font-semibold">Alert Threshold</h2>
        <p className="mt-1 text-sm text-slate-600">Maturity threshold: 30 days (configurable later).</p>
      </div>

      <div className="ta-card p-4">
        <h2 className="mb-2 font-semibold">Seed / Reset Sample Data</h2>
        <form action={resetDataAction}>
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
            Reset & Reseed
          </button>
        </form>
      </div>

      <div className="ta-card space-y-3 p-4">
        <h2 className="font-semibold">Backup / Restore (Excel)</h2>
        <p className="text-sm text-slate-600">
          Export an Excel backup from desktop, edit if required, then upload to compare changes before applying.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/api/backup/export" className="ta-btn">
            Export Backup (.xlsx)
          </Link>
        </div>

        <form action={createBackupPreviewAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input type="file" name="backup_file" accept=".xlsx,.xls" className="ta-input" required />
          <button type="submit" className="ta-btn">
            Upload & Compare
          </button>
        </form>
      </div>

      {preview ? (
        <div className="space-y-3">
          <div className="ta-card p-4">
            <h2 className="font-semibold">Import Preview</h2>
            <p className="mt-1 text-sm text-slate-600">
              File: {preview.sourceFileName} | Created: {preview.createdAt}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">Tables: <span className="font-semibold">{preview.summary.tables}</span></div>
              <div className="rounded-lg bg-emerald-50 p-3 text-sm">Added: <span className="font-semibold">{preview.summary.added}</span></div>
              <div className="rounded-lg bg-amber-50 p-3 text-sm">Updated: <span className="font-semibold">{preview.summary.updated}</span></div>
              <div className="rounded-lg bg-rose-50 p-3 text-sm">Deleted: <span className="font-semibold">{preview.summary.deleted}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <form action={applyBackupPreviewAction}>
                <input type="hidden" name="preview_id" value={preview.id} />
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  Apply Changes
                </button>
              </form>
              <form action={rejectBackupPreviewAction}>
                <input type="hidden" name="preview_id" value={preview.id} />
                <button type="submit" className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  Reject
                </button>
              </form>
            </div>
          </div>

          {preview.tables.map((table) => (
            <div key={table.table} className="ta-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{table.sheet}</h3>
                <p className="text-xs text-slate-500">
                  Current: {table.totalCurrent} | Incoming: {table.totalIncoming} | +{table.added} / ~{table.updated} / -{table.deleted}
                </p>
              </div>

              {table.rows.length === 0 ? (
                <p className="text-sm text-slate-500">No changes</p>
              ) : (
                <div className="space-y-2">
                  {table.rows.slice(0, 50).map((row) => (
                    <div key={`${table.table}-${row.type}-${row.id}`} className="rounded-lg border border-slate-200 p-2 text-sm">
                      <p className="font-semibold text-slate-800">
                        {row.type.toUpperCase()} | id={row.id}
                      </p>
                      {row.fields.length > 0 ? (
                        <div className="mt-1 space-y-1 text-xs text-slate-600">
                          {row.fields.map((field) => (
                            <p key={`${row.id}-${field.field}`}>
                              {field.field}: "{field.oldValue}" -&gt; "{field.newValue}"
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {table.rows.length > 50 ? (
                    <p className="text-xs text-slate-500">Showing first 50 changes.</p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
