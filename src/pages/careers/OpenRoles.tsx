import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Mail } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Select from '../../components/careers/fields/Select';
import { jobPostings, HIRING_LOCATIONS } from '../../careers-data';

const PAGE_SIZE = 20;

// The section's own accent for .btn-liquid — green fill, white text once
// filled — rather than the black the rest of the site's buttons default to,
// matching the green "Our Vision" / "Why Work With Us" treatment already
// established on the Careers page.
const LIQUID_GREEN = { '--liquid': '#15803D', '--liquid-ink': '#ffffff' } as CSSProperties;

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OpenRoles() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
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
    rows.sort((a, b) =>
      sortDir === 'desc' ? b.postedOn.localeCompare(a.postedOn) : a.postedOn.localeCompare(b.postedOn),
    );
    return rows;
  }, [query, location, sortDir]);

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
    <div className="w-full bg-[#ECEDEC]">
      <Header />

      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-10 pt-10 pb-8">
        <h1
          className="font-dm-sans font-bold text-[#000000]"
          style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Open Roles
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pb-16 sm:pb-20">
        {/* Search + location filter, both built rather than the browser's
            own controls — the search field gets the section's green focus
            ring instead of a generic grey one, and the location filter is
            the custom Select rather than a native <select>, whose dropdown
            panel can't be styled at all in most browsers. */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search by role, department or location..."
              className="h-[52px] w-full rounded-xl border-2 border-[#000000]/10 bg-white pl-11 pr-4 text-sm text-[#000000] outline-none transition-colors placeholder:text-[#6b6b6b]/50 focus:border-[#15803D]"
            />
          </div>
          <Select
            value={location}
            onChange={updateLocation}
            options={locationOptions}
            className="sm:w-56"
          />
        </div>

        <p className="text-xs text-[#6b6b6b] mb-3">
          {filtered.length === 0
            ? 'Results 0 of 0'
            : `Results ${rangeStart}–${rangeEnd} of ${filtered.length}`}
        </p>

        {/* Results list. Title | Location | Date, the same three columns
            the reference board leads with; Date is the one sortable column,
            since it's the one a returning visitor actually re-sorts by. */}
        <div className="rounded-2xl border border-[#000000]/10 bg-white overflow-hidden shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]">
          <div className="hidden sm:grid grid-cols-[1fr_180px_160px] gap-4 px-6 py-3.5 border-b border-[#000000]/10 bg-[#ECEDEC]/60 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
            <span>Title</span>
            <span>Location</span>
            <button
              type="button"
              onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 text-left transition-colors hover:text-[#15803D]"
            >
              Date <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {pageRows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-[#6b6b6b]">
                {jobPostings.length === 0
                  ? "We don't have any open roles listed right now. Send your resume and we'll reach out when something opens up that fits."
                  : 'No roles match your search. Try a different keyword or clear the filters.'}
              </p>
              <Link
                to="/careers/apply"
                style={LIQUID_GREEN}
                className="btn-liquid inline-flex items-center gap-2 mt-6 border-2 border-[#15803D] text-[#15803D] text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                <Mail className="w-4 h-4" /> Email your resume
              </Link>
            </div>
          ) : (
            pageRows.map((job) => (
              <Link
                key={job.id}
                to={`/careers/open-roles/${job.id}`}
                className="block border-b border-[#000000]/10 last:border-0 grid grid-cols-1 sm:grid-cols-[1fr_180px_160px] gap-1 sm:gap-4 px-6 py-4 transition-colors hover:bg-[#15803D]/5"
              >
                <span className="text-sm font-semibold text-[#000000]">{job.title}</span>
                <span className="text-sm text-[#6b6b6b]">{job.location}</span>
                <span className="text-sm text-[#6b6b6b]">{formatDate(job.postedOn)}</span>
              </Link>
            ))
          )}
        </div>

        {/* Pagination — wired for real even though there's nothing to page
            through yet, so it doesn't need rebuilding once roles exist. */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#000000]/10 text-[#000000] disabled:opacity-30 transition-colors hover:border-[#15803D] hover:text-[#15803D]"
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
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#000000]/10 text-[#000000] disabled:opacity-30 transition-colors hover:border-[#15803D] hover:text-[#15803D]"
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
