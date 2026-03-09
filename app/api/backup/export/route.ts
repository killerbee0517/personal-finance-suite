import dayjs from "dayjs";
import { buildBackupWorkbookBuffer } from "@/lib/backup";
import { ensureInitialized } from "@/lib/init";

export async function GET() {
  const ready = await ensureInitialized();
  if (!ready) {
    return new Response("DB not connected", { status: 503 });
  }

  const buffer = await buildBackupWorkbookBuffer();
  const bytes = new Uint8Array(buffer);
  const fileName = `personal-finance-suite-backup-${dayjs().format("YYYYMMDD-HHmmss")}.xlsx`;

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=\"${fileName}\"`,
      "Cache-Control": "no-store",
    },
  });
}
