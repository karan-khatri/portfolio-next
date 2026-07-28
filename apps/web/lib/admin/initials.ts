export function initialsFromEmail(email: string): string {
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[._-]/).filter(Boolean);
  const [first, second] = parts;
  const chars = first && second ? [first[0], second[0]] : [name.slice(0, 2)];
  return chars.join("").toUpperCase().slice(0, 2);
}
