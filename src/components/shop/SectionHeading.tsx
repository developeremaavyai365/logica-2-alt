/** A shop section's title, in the same large, tight DM Sans as "Top 5 this
 *  week". */
export default function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-dm-sans font-bold text-shop-ink ${className}`}
      style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', letterSpacing: '-0.035em', lineHeight: 1.05 }}
    >
      {children}
    </h2>
  );
}
