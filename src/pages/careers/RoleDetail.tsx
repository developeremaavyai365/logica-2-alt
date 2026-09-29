import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, MapPin, UserRound, Briefcase } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WavePanel, { CAREERS_BLUE, CAREERS_NAVY } from '../../components/careers/WavePanel';
import { jobPostings } from '../../careers-data';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2
        className="font-dm-sans font-bold"
        style={{ color: CAREERS_NAVY, fontSize: 'clamp(24px, 2.6vw, 36px)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
      <div className="mt-5 pl-1 sm:pl-5">{children}</div>
    </section>
  );
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="text-base leading-relaxed text-[#6B7280] sm:text-[17px]">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** One role at its own URL. A job id that doesn't match anything — a stale
 *  link, or a role taken down since — goes back to the list instead of a
 *  blank page. */
export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const job = jobPostings.find((j) => j.id === id);

  if (!job) return <Navigate to="/careers/open-roles" replace />;

  const applyHref = `/careers/apply?role=${encodeURIComponent(job.title)}`;

  const facts = [
    { icon: CalendarDays, text: job.employmentType },
    { icon: MapPin, text: job.location },
    { icon: Briefcase, text: job.department },
    ...(job.reportingTo ? [{ icon: UserRound, text: `Reports to ${job.reportingTo}` }] : []),
  ];

  return (
    <div className="w-full bg-[#F5F8FC]">
      <div className="bg-white">
        <Header />
      </div>

      {/* Hero */}
      <div className="bg-white px-4 pb-10 sm:px-6 md:px-5">
        <WavePanel className="mx-auto max-w-[1300px]">
          <div className="flex min-h-[360px] flex-col items-center px-6 pb-16 pt-10 text-center sm:min-h-[440px]">
            <Link
              to="/careers/open-roles"
              className="inline-flex items-center gap-1 text-lg text-white transition-opacity hover:opacity-80"
            >
              <ChevronLeft className="h-5 w-5" /> Careers
            </Link>
            <div className="flex flex-1 flex-col items-center justify-center">
              <h1
                className="font-dm-sans font-bold text-white"
                style={{ fontSize: 'clamp(36px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
              >
                {job.title}
              </h1>
              <p className="mt-4 text-base text-white/70 sm:text-lg">
                {job.department} · {job.location}
              </p>
            </div>
          </div>
        </WavePanel>
      </div>

      {/* Body + side card */}
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:gap-16 md:px-10">
        <div className="min-w-0">
          <Section title="Role Overview">
            <p className="text-base leading-relaxed text-[#6B7280] sm:text-[17px]">{job.summary}</p>
          </Section>

          {job.responsibilities.length > 0 && (
            <Section title="Key Responsibilities">
              <Lines items={job.responsibilities} />
            </Section>
          )}

          {job.requirements.length > 0 && (
            <Section title="Desired Candidate Profile">
              <Lines items={job.requirements} />
            </Section>
          )}

          {job.education && (
            <Section title="Education">
              <p className="text-base leading-relaxed text-[#6B7280] sm:text-[17px]">{job.education}</p>
            </Section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.15)]">
            <ul className="space-y-6">
              {facts.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-lg" style={{ color: CAREERS_NAVY }}>
                  <Icon className="h-5 w-5 shrink-0" style={{ color: CAREERS_BLUE }} />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              to={applyHref}
              className="mt-8 flex h-12 w-full items-center justify-center rounded-md text-base font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: CAREERS_BLUE }}
            >
              Apply now
            </Link>
          </div>
        </aside>
      </div>

      {/* Closing call-to-action */}
      <div className="px-4 pb-20 sm:px-6 md:px-10">
        <WavePanel className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
            <h2
              className="font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.02em' }}
            >
              Grow Your Career With Us
            </h2>
            <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">
              Think you&rsquo;re the right fit? Send us your application and our team will get in touch.
            </p>
            <Link
              to={applyHref}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md px-7 text-base font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: CAREERS_BLUE }}
            >
              Apply now
            </Link>
          </div>
        </WavePanel>
      </div>

      <Footer />
    </div>
  );
}
