/** Lightweight small-talk intent layer — runs before the KB/FAQ retrieval
 *  pipeline so greetings, thanks, jokes, etc. never trigger an awkward
 *  "I don't understand" fallback or a pointless keyword search. */

export type SmallTalkType =
  | 'frustration'
  | 'greeting_only'
  | 'greeting_plus_query'
  | 'farewell'
  | 'gratitude'
  | 'identity'
  | 'joke'
  | 'ambiguous'
  | 'query';

export interface SmallTalkResult {
  type: SmallTalkType;
  /** For greeting_plus_query / query: the remaining text to hand to KB search. */
  remainder?: string;
}

const FRUSTRATION_RE =
  /\b(useless|not helping|not helpful|isn'?t helping|real person|talk to (a )?(human|person|agent)|speak to (a )?(human|person|agent)|waste of time|frustrat\w*|annoying|stupid bot|this (isn'?t|is not|ain'?t) working|worst (bot|support)|give up)\b/i;

const FAREWELL_RE = /\b(bye|goodbye|see ya|see you|gtg|got to go|that'?s all|talk later|catch you later)\b/i;

const GRATITUDE_RE = /\b(thanks|thank you|thx|ty|appreciate it|much appreciated|cheers)\b/i;

const GREETING_RE = /^\s*(hi+|hello+|hey+|yo+|sup|good\s?morning|good\s?afternoon|good\s?evening|greetings)\b[.,!]*\s*/i;

const IDENTITY_RE =
  /\b(are you (a )?(bot|real|human|chatgpt|gpt|ai)|who are you|what are you|how are you|how'?s it going|what can you do|are you (chatgpt|gpt))\b/i;

const JOKE_RE = /\b(joke|funny|make me laugh|are you chatgpt|are you gpt|sing|dance)\b/i;

const FILLER_PREFIX_RE = /^(there|quick question[,:]?|question[,:]?|so[,:]?|just wondering[,:]?)\s*/i;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'does', 'did', 'i', 'my', 'you', 'your',
  'can', 'how', 'what', 'when', 'where', 'why', 'will', 'to', 'for', 'of', 'on',
  'in', 'it', 'this', 'that', 'and', 'or', 'be', 'have', 'has', 'if', 'me', 'about',
]);

function meaningfulTokenCount(text: string): number {
  return text
    .toLowerCase()
    .replace(/'/g, '') // keep contractions as one token: "where's" -> "wheres"
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w)).length;
}

/** Classifies a raw user message. For mixed greeting+query messages,
 *  returns the stripped remainder so the caller can still run KB search. */
export function classifySmallTalk(raw: string): SmallTalkResult {
  const text = raw.trim();

  if (FRUSTRATION_RE.test(text)) return { type: 'frustration' };

  const greetingMatch = text.match(GREETING_RE);
  if (greetingMatch) {
    let remainder = text.slice(greetingMatch[0].length).replace(/^[,.!\s]+/, '');
    remainder = remainder.replace(FILLER_PREFIX_RE, '').trim();
    if (meaningfulTokenCount(remainder) <= 1) {
      return { type: 'greeting_only' };
    }
    return { type: 'greeting_plus_query', remainder };
  }

  if (FAREWELL_RE.test(text)) return { type: 'farewell' };
  if (GRATITUDE_RE.test(text)) return { type: 'gratitude' };
  if (IDENTITY_RE.test(text)) return { type: 'identity' };
  if (JOKE_RE.test(text)) return { type: 'joke' };

  if (meaningfulTokenCount(text) <= 1) return { type: 'ambiguous' };

  return { type: 'query', remainder: text };
}

const JOKES = [
  "Why did the computer go to therapy? Too many unresolved issues.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "I'd tell you a UDP joke, but you might not get it.",
];

export function greetingResponse(hasGreeted: boolean): string {
  return hasGreeted ? "Hey again — what can I help with?" : "Hi! Welcome to Logica Infoway. How can I help you today?";
}

export function greetingPrefix(hasGreeted: boolean): string {
  return hasGreeted ? 'Hey!' : 'Hi there!';
}

export function farewellResponse(text: string): string {
  if (GRATITUDE_RE.test(text)) {
    return "You're welcome! Feel free to reach out anytime you need help. Have a great day!";
  }
  return 'Take care! Reach out anytime you need help.';
}

export function gratitudeResponse(): string {
  const options = ["You're welcome!", 'Anytime!', 'Happy to help!'];
  return options[Math.floor(Math.random() * options.length)];
}

export function identityResponse(): string {
  return "I'm Logica Infoway's virtual assistant, not a real person — I can help with orders, products, returns, and warranty questions. Ask away, or tap \"Talk to a human\" for a real agent.";
}

export function jokeResponse(): string {
  const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
  return `${joke} 😄\n\nIs there something about your order or our products I can help with?`;
}

export function ambiguousResponse(): string {
  return 'Could you tell me a bit more about what you need — are you looking to buy something, or is this about an existing order?';
}

export function frustrationResponse(): string {
  return "I'm sorry this hasn't helped — let me connect you with a support agent right away.";
}
