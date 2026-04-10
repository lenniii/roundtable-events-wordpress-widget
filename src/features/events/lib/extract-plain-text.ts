export function extractPlainText(html: string | null): string | null {
  if (!html) {
    return null;
  }

  const documentFragment = new DOMParser().parseFromString(html, "text/html");
  const text = documentFragment.body.textContent?.replace(/\s+/g, " ").trim();

  return text ? text : null;
}
