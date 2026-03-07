import { AlertItem } from "@/types/models";
import { allAsync, runAsync } from "../helpers";

export const alertRepository = {
  list: () => allAsync<AlertItem>("SELECT * FROM alerts ORDER BY due_date ASC"),
  clearAll: () => runAsync("DELETE FROM alerts"),
  upsert: async (alert: AlertItem) => {
    if (alert.id) {
      await runAsync(
        `UPDATE alerts SET alert_type=?, title=?, message=?, related_entity_type=?, related_entity_id=?, due_date=?, status=?, created_at=? WHERE id=?`,
        [alert.alert_type, alert.title, alert.message, alert.related_entity_type, alert.related_entity_id, alert.due_date, alert.status, alert.created_at, alert.id],
      );
      return alert.id;
    }
    return runAsync(
      `INSERT INTO alerts (alert_type, title, message, related_entity_type, related_entity_id, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [alert.alert_type, alert.title, alert.message, alert.related_entity_type, alert.related_entity_id, alert.due_date, alert.status, alert.created_at],
    );
  },
};
