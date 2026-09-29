import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Select from '../../components/form/fields/Select';
import { CAREERS_BLUE, CAREERS_NAVY } from '../../components/careers/WavePanel';
import { jobPostings, HIRING_LOCATIONS } from '../../careers-data';

const PAGE_SIZE = 20;

export default function OpenRoles() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [page, setPage] = useState(1);

  // HIRING_LOCATIONS keeps the filter populated before any posting exists;
  // merging in whatever locations real postings carry means a role added
  // somewhere not on that list still shows up without editing it.
  const locationOptions = useMemo(() => {
    const cities = Array.from(new Set([...HIRING_LOCATIONS, ...jobPostings.map((j) => j.location)])).sort();
    return [{ value: 'all', label: 'All locations' }, ...cities.map((c) => ({ value: c, label: c }))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = jobPostings
      .filter((j) => location === 'all' || j.location === location)
      .filter(
        (j) =>
          !q ||
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q),
      );
    rows.sort((a, b) => b.postedOn.localeCompare(a.postedOn));
    return rows;
  }, [query, location]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function updateQuery(next: string) {
    setQuery(next);
    setPage(1);
  }
  function updateLocation(next: string) {
    setLocation(next);
    setPage(1);
  }

  return (
    <div className="w-full bg-white">
      <Header />

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 md:px-10">
        <span className="text-sm font-medium uppercase tracking-wide" style={{ color: CAREERS_BLUE }}>
          Openings
        </span>
        <h1
          className="font-dm-sans mt-3 font-bold"
          style={{ color: CAREERS_NAVY, fontSize: 'clamp(32px, 4.5vw, 56px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Join Our Growing Team
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[#6B7280] sm:text-lg">
          We&rsquo;re building the teams behind three decades of retail, distribution and technology across India.
          Explore our open positions and find where you fit.
        </p>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20 md:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search by role, department or location..."
              className="h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-[#F5F8FC] pl-11 pr-4 text-sm text-[#000000] outline-none transition-colors placeholder:text-[#6b6b6b]/50 focus:border-[#3D4FE0]"
            />
          </div>
          <Select value={location} onChange={updateLocation} options={locationOptions} className="sm:w-56" accent={CAREERS_BLUE} />
        </div>

        <p className="mb-4 text-xs text-[#6b6b6b]">
          {filtered.length === 0 ? 'Results 0 of 0' : `Results ${rangeStart}–${rangeEnd} of ${filtered.length}`}
        </p>

        {pageRows.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F8FC] px-6 py-12 text-center">
            <p className="text-sm text-[#6b6b6b]">
              {jobPostings.length === 0
                ? "We don't have any open roles listed right now. Send your resume and we'll reach out when something opens up that fits."
                : 'No roles match your search. Try a different keyword or clear the filters.'}
            </p>
            <Link
              to="/careers/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: CAREERS_BLUE }}
            >
              <Mail className="h-4 w-4" /> Email your resume
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pageRows.map((job) => (
              <Link
                key={job.id}
                to={`/careers/open-roles/${job.id}`}
                className="grid grid-cols-1 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F8FC] px-6 py-6 transition-colors hover:border-[#3D4FE0]/40 sm:grid-cols-[1fr_200px_200px_auto] sm:gap-6 sm:px-9 sm:py-8"
              >
                <span className="font-dm-sans text-xl font-bold sm:text-2xl" style={{ color: CAREERS_NAVY }}>
                  {job.title}
                </span>
                <span className="text-base text-[#6B7280] sm:text-lg">{job.location}</span>
                <span className="text-base text-[#6B7280] sm:text-lg">{job.employmentType}</span>
                <span
                  className="inline-flex h-12 w-full items-center justify-center rounded-md px-7 text-base font-medium text-white sm:w-auto"
                  style={{ backgroundColor: CAREERS_BLUE }}
                >
                  Apply now
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination — wired for real even though there's nothing to page
            through yet, so it doesn't need rebuilding once roles exist. */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#000000]/10 text-[#000000] disabled:opacity-30 transition-colors hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-[#6b6b6b] px-2">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#000000]/10 text-[#000000] disabled:opacity-30 transition-colors hover:border-[#3D4FE0] hover:text-[#3D4FE0]"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
