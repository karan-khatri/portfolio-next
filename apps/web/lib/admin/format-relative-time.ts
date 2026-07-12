const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
];

export function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  for (const { unit, ms } of UNITS) {
    if (absMs >= ms) {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }
  return formatter.format(Math.round(diffMs / 1000), "second");
}
