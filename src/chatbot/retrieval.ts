import kb from './knowledge-base.json';

export interface KBEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  last_updated: string;
  confidence: 'confirmed' | 'needs_confirmation';
}

export const KB_ENTRIES = kb.entries as KBEntry[];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'did', 'i', 'my', 'you', 'your',
  'can', 'how', 'what', 'when', 'where', 'why', 'will', 'to', 'for', 'of', 'on',
  'in', 'it', 'this', 'that', 'and', 'or', 'be', 'have', 'has', 'if', 'me', 'about',
]);

/** Very small suffix stripper — not a real stemmer, just enough to connect
 *  "track"/"tracking"/"tracked" or "return"/"returns"/"returning" so exact-
 *  token matching doesn't miss obvious variants. */
function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/'/g, '') // keep contractions as one token: "where's" -> "wheres"
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

export interface MatchResult {
  entry: KBEntry;
  score: number;
}

/** Lightweight keyword-overlap retrieval — no LLM/network call, everything
 *  runs client-side against the seed KB. Tag matches score higher than
 *  plain question-text matches since tags are curated intent signals. */
export function searchKB(query: string, limit = 5): MatchResult[] {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return [];

  const scored = KB_ENTRIES.map((entry) => {
    let score = 0;
    const questionTokens = tokenize(entry.question);
    for (const t of questionTokens) if (qTokens.has(t)) score += 1;
    for (const tag of entry.tags) {
      const tagTokens = tokenize(tag);
      const tagHit = tagTokens.every((t) => qTokens.has(t)) && tagTokens.length > 0;
      if (tagHit) score += 3;
      else if (tagTokens.some((t) => qTokens.has(t))) score += 1.5;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Decide how confident we are in the top match: a clear single winner vs
 *  an ambiguous tie the bot should ask a clarifying question about. */
export function classifyMatches(results: MatchResult[]): 'none' | 'clear' | 'ambiguous' {
  if (results.length === 0) return 'none';
  if (results.length === 1) return 'clear';
  const [top, second] = results;
  if (top.score >= second.score * 1.6 && top.score >= 2) return 'clear';
  return 'ambiguous';
}

export const CATEGORIES = Array.from(new Set(KB_ENTRIES.map((e) => e.category)));
