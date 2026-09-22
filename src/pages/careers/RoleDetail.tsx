import { type CSSProperties } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobPostings } from '../../careers-data';

const LIQUID_GREEN = { '--liquid': '#15803D', '--liquid-ink': '#ffffff' } as CSSProperties;

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** One role, at its own URL rather than an expand-in-place panel — so a
 *  role can be linked to directly (shared, bookmarked, come back to) and so
 *  "Apply" has somewhere real to send the applicant with the role already
 *  attached, via the `role` query param the Apply form already reads.
 *
 *  A job.id that doesn't match anything — a stale link, or a role that's
 *  been taken down since — redirects to Open Roles rather than rendering a
 *  blank page; the list is exactly what's still current. */
export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const job = jobPostings.find((j) => j.id === id);

  if (!job) return <Navigate to="/careers/open-roles" replace />;

  const applyHref = `/careers/apply?role=${encodeURIComponent(job.title)}`;

  return (
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
        <Link
          to="/careers/open-roles"
          className="text-xs font-medium text-[#6b6b6b] hover:text-[#000000] transition-colors"
        >
          &larr; Open Roles
        </Link>

        <div className="mt-4 rounded-3xl border border-[#000000]/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)] sm:p-10">
          <h1
            className="font-dm-sans font-bold text-[#000000]"
            style={{ fontSize: 'clamp(24px, 3vw, 34px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            {job.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {job.department}
            </span>
            <span className="rounded-full bg-[#ECEDEC] px-2.5 py-1 text-xs font-medium text-[#000000]">
              {job.employmentType}
            </span>
            <span className="text-xs">Posted {formatDate(job.postedOn)}</span>
          </div>

          <p className="mt-6 text-sm text-[#6b6b6b] leading-relaxed sm:text-base">{job.summary}</p>

          {job.responsibilities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#000000]">What you'll do</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#6b6b6b] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[#000000]/40 sm:text-base"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#000000]">
                What we're looking for
              </h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#6b6b6b] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[#000000]/40 sm:text-base"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to={applyHref}
            style={LIQUID_GREEN}
            className="btn-liquid inline-flex items-center gap-2 mt-8 border-2 border-[#15803D] text-[#15803D] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors"
          >
            Apply for this role <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
