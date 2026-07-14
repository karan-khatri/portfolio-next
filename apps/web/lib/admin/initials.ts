// Derives a 1-2 letter avatar label from an email address (no photo-upload
// feature exists, so this is the real identity shown in the sidebar/topbar
// avatar and the Users table, not a placeholder).
export function initialsFromEmail(email: string): string {
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[._-]/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0]![0], parts[1]![0]] : [name.slice(0, 2)];
  return chars.join("").toUpperCase().slice(0, 2);
}
