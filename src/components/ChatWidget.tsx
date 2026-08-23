import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Phone, Bot } from 'lucide-react';
import { searchKB, classifyMatches, type KBEntry } from '../chatbot/retrieval';
import {
  classifySmallTalk,
  greetingResponse,
  greetingPrefix,
  farewellResponse,
  gratitudeResponse,
  identityResponse,
  jokeResponse,
  ambiguousResponse,
  frustrationResponse,
} from '../chatbot/smalltalk';

const SUPPORT_PHONE = '+91 7003999192';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  candidates?: KBEntry[];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function answerFor(entry: KBEntry): string {
  if (entry.confidence === 'needs_confirmation') {
    return `${entry.answer}\n\nThis detail is still being finalized on our end — for the exact answer right now, please reach our team directly.`;
  }
  return entry.answer;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasGreetedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  function pushBot(text: string, candidates?: KBEntry[]) {
    setMessages((prev) => [...prev, { id: uid(), role: 'bot', text, candidates }]);
  }

  /** Runs the KB retrieval pipeline for `text` and returns a bot reply
   *  (optionally prefixed, e.g. by a brief greeting for mixed messages). */
  function kbReply(text: string, prefix?: string): { text: string; candidates?: KBEntry[] } {
    const results = searchKB(text);
    const verdict = classifyMatches(results);
    const lead = prefix ? `${prefix} ` : '';

    if (verdict === 'none') {
      return {
        text: `${lead}I don't have an answer for that in my knowledge base yet. You can try rephrasing or talk to a human for anything I can't cover.`,
      };
    }
    if (verdict === 'clear') {
      return { text: `${lead}${answerFor(results[0].entry)}` };
    }
    return {
      text: `${lead}I found a few things that might match — which one did you mean?`,
      candidates: results.slice(0, 3).map((r) => r.entry),
    };
  }

  function handleQuery(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setInput('');

    const intent = classifySmallTalk(text);

    switch (intent.type) {
      case 'frustration': {
        pushBot(`${frustrationResponse()} For now, reach our team directly at ${SUPPORT_PHONE}.`);
        return;
      }
      case 'greeting_only': {
        pushBot(greetingResponse(hasGreetedRef.current));
        hasGreetedRef.current = true;
        return;
      }
      case 'greeting_plus_query': {
        const reply = kbReply(intent.remainder!, greetingPrefix(hasGreetedRef.current));
        hasGreetedRef.current = true;
        pushBot(reply.text, reply.candidates);
        return;
      }
      case 'farewell': {
        pushBot(farewellResponse(text));
        return;
      }
      case 'gratitude': {
        pushBot(gratitudeResponse());
        return;
      }
      case 'identity': {
        pushBot(identityResponse());
        return;
      }
      case 'joke': {
        pushBot(jokeResponse());
        return;
      }
      case 'ambiguous': {
        pushBot(ambiguousResponse());
        return;
      }
      case 'query': {
        const reply = kbReply(intent.remainder ?? text);
        pushBot(reply.text, reply.candidates);
        return;
      }
    }
  }

  function handleCandidateClick(entry: KBEntry) {
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: entry.question }]);
    pushBot(answerFor(entry));
  }

  function handleTalkToHuman() {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', text: 'Talk to a human' },
      {
        id: uid(),
        role: 'bot',
        text: `Live agent handoff isn't wired up yet — that's coming in a later phase. For now, reach our team directly at ${SUPPORT_PHONE}.`,
      },
    ]);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      <div
        className={`absolute bottom-full right-0 mb-3 flex h-[70vh] max-h-[560px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] transition-all duration-300 ${
          open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-black px-4 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Bot className="h-4 w-4" />
            </span>
            <div>
              <p className="font-dm-sans text-sm font-bold leading-tight">Logica Support</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleTalkToHuman}
              className="font-inter hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] font-medium hover:bg-white/20 transition-colors sm:flex"
            >
              <Phone className="h-3 w-3" />
              Talk to a human
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile-only human handoff row */}
        <button
          type="button"
          onClick={handleTalkToHuman}
          className="font-inter flex items-center justify-center gap-1.5 border-b border-black/10 bg-[#ECEDEC] py-2 text-xs font-medium text-black/70 sm:hidden"
        >
          <Phone className="h-3 w-3" />
          Talk to a human
        </button>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === 'user' ? 'bg-black text-white' : 'bg-[#ECEDEC] text-black'
                }`}
                style={{ letterSpacing: '-0.01em' }}
              >
                {m.text}
                {m.candidates && (
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {m.candidates.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCandidateClick(c)}
                        className="rounded-lg border border-black/15 bg-white px-2.5 py-2 text-left text-xs font-medium text-black transition-colors hover:border-black/30"
                      >
                        {c.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(input);
          }}
          className="flex items-center gap-2 border-t border-black/10 p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about orders, returns, warranty..."
            className="font-inter h-10 flex-1 rounded-full border border-black/10 bg-[#ECEDEC] px-4 text-sm text-black placeholder-black/30 outline-none focus:border-black/40 transition-colors"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Trigger bubble */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
