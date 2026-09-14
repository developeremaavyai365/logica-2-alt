/* Closes the careers film with what the company says it is for.

   The statement is the one the Annual Report sets out as the Company's
   purpose, carried here word for word as its philosophy. Labelled the same
   way as the vision section higher up the page, a small green line above the
   statement, so the two read as a pair.

   Plain text, no scroll fill — the same treatment as the vision section. The
   one accent is Digital Technology, matching the single accent the vision
   statement carries. */
export default function PhilosophySection() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p
          className="font-inter font-semibold uppercase text-[#15803D]"
          style={{ fontSize: 'clamp(11px, 0.95vw, 13px)', letterSpacing: '0.2em' }}
        >
          Our Philosophy
        </p>

        <h2
          className="font-dm-sans mt-5 font-bold text-[#111111] sm:mt-6"
          style={{ fontSize: 'clamp(20px, 2.6vw, 34px)', letterSpacing: '-0.025em', lineHeight: 1.3, textWrap: 'balance' }}
        >
          Empowerment through <span className="text-[#15803D]">Digital Technology</span> to make it
          more accessible, relevant and meaningful in everyday life.
        </h2>
      </div>
    </section>
  );
}
