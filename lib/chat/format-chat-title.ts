/**
 * Sentence case: only the first character is capitalized; the rest is lowercased.
 */
export function formatChatTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const first = trimmed.charAt(0).toLocaleUpperCase();
  const rest = trimmed.slice(1).toLocaleLowerCase();
  return first + rest;
}
