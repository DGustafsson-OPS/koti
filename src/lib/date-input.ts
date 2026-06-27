export function timestampToDateInput(ts: number | null | undefined) {
  if (!ts) return undefined;
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export function dateInputToTimestamp(value: string) {
  return Math.floor(new Date(value).getTime() / 1000);
}
