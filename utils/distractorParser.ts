export interface DistractorItem {
  letter: string;
  label: string;
  text: string;
}

/**
 * Parses raw distractor analysis text into structured individual option items.
 * Handles formats like:
 * - "A (100 ml/ cada hora): Corresponde a la dosis..."
 * - "A) Explicación del distractor..."
 * - "Opción B: Explicación..."
 * - "B. Explicación..."
 */
export function parseDistractorText(rawText: string): DistractorItem[] {
  if (!rawText || typeof rawText !== "string") return [];

  const clean = rawText.trim();
  if (!clean) return [];

  // The API may return all analyses in one paragraph, for example:
  // "A) ... B) ... C) ... D) ...". Do not require a newline before a
  // marker; a whitespace boundary is enough. Punctuation after the letter is
  // mandatory so ordinary words beginning with A-E are never split.
  const regex = /(?:^|\s+)(?:Opción\s+)?([A-Ea-e])\s*(?:[\(\[]([^\)\]]*?)[\)\]])?\s*[:\.\)]\s*/g;

  const matches = [...clean.matchAll(regex)];

  if (matches.length > 0) {
    const items: DistractorItem[] = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const letter = (match[1] || "").toUpperCase();
      const label = (match[2] || "").trim();
      const startIndex = (match.index || 0) + match[0].length;
      const endIndex = i + 1 < matches.length ? (matches[i + 1].index || clean.length) : clean.length;
      const body = clean.substring(startIndex, endIndex).trim();

      items.push({
        letter,
        label,
        text: body,
      });
    }

    return items;
  }

  // Fallback: If no A/B/C/D markers found, check if separated by newlines
  const paragraphs = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return paragraphs.map((p) => ({
      letter: "",
      label: "",
      text: p,
    }));
  }

  return [
    {
      letter: "",
      label: "",
      text: clean,
    },
  ];
}
