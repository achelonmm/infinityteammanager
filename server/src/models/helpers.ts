export function buildUpdate(updates: Record<string, unknown>, allowedColumns: Set<string>): { fields: string[]; values: unknown[] } {
  const entries = Object.entries(updates).filter(
    ([key]) => key !== 'id' && key !== 'created_at' && allowedColumns.has(key)
  );
  return {
    fields: entries.map(([key]) => `${key} = ?`),
    values: entries.map(([, value]) => value),
  };
}
