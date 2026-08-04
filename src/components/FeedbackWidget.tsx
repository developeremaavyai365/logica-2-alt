import { useState, type FormEvent } from 'react';
import { MessageCircleMore, X } from 'lucide-react';

// Same key used by ContactFormSection — get a free one at https://web3forms.com/
const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

type Status = 'idle' | 'sending' | 'success' | 'error';

/** Site-wide floating "Feedback" popover — a compact version of the same
 *  Web3Forms submission flow as the homepage contact form, always
 *  reachable from a tab pinned to the right edge of the viewport. */
export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setStatus('sending');
    setMessage('Please wait...');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.status === 200) {
        setStatus('success');
        setMessage(json.message);
        form.reset();
      } else {
        setStatus('error');
        setMessage(json.message);
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong!');
    }
  }

  return (
    <div className="fixed bottom-28 right-0 z-40 sm:bottom-32">
      {/* Popover panel */}
      <div
        className={`absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] transition-all duration-300 ${
          open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-dm-sans text-lg font-bold text-black" style={{ letterSpacing: '-0.03em' }}>
            Quick Feedback
          </h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close feedback"
            className="flex h-7 w-7 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="font-inter mt-1 text-sm text-black/50" style={{ letterSpacing: '-0.02em' }}>
          Tell us what you think — takes 10 seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
          <input type="hidden" name="subject" value="Quick feedback from logicainfoway.com" />
          <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <input
            type="email"
            name="email"
            placeholder="Your email (optional)"
            className="font-inter h-11 w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
          />
          <textarea
            name="message"
            rows={3}
            required
            placeholder="Your feedback..."
            className="font-inter w-full rounded-md border border-black/10 bg-[#FEFDF9] px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/40"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-liquid font-inter flex h-11 w-full items-center justify-center rounded-md border-2 border-[#000000] text-sm font-medium text-[#000000] transition-colors disabled:opacity-60"
            style={{ letterSpacing: '-0.02em' }}
          >
            {status === 'sending' ? 'Sending…' : 'Send Feedback'}
          </button>
          {message && (
            <p
              className={`font-inter text-center text-xs ${
                status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-black/50'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Vertical tab trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close feedback widget' : 'Open feedback widget'}
        className="flex items-center gap-2 rounded-l-full bg-black py-3 pl-4 pr-3 text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <MessageCircleMore className="h-4 w-4" />
        <span className="font-inter text-sm font-medium" style={{ letterSpacing: '-0.02em' }}>
          Feedback
        </span>
      </button>
    </div>
  );
}
