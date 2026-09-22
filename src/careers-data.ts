/** A single open role. `id` is used as the React key and as the expand
 *  target on the open roles page — keep it stable (a slug like
 *  `retail-associate-kolkata`) rather than regenerating it, since a link to
 *  a specific role should keep working as long as the role is still listed.
 *
 *  To add a real opening: add one object to `jobPostings` below. Nothing
 *  else needs to change — the search box, the location filter, the sort and
 *  the pagination on /careers/open-roles all read from this array. Removing
 *  a role is the same in reverse: delete its object. */
export type JobPosting = {
  id: string;
  title: string;
  /** Which of the four verticals or a support function. */
  department: string;
  location: string;
  /** 'Full-time' | 'Internship' | 'Contract' — free text, kept short since
   *  it renders as a small tag. */
  employmentType: string;
  /** ISO date (YYYY-MM-DD) the role was posted. */
  postedOn: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

/** No roles are open right now — this is the honest current state, not a
 *  placeholder waiting to be filled with fabricated postings. The open
 *  roles page still renders its search bar and table with this empty, and
 *  shows a plain "no roles match" row rather than hiding the page. */
export const jobPostings: JobPosting[] = [];

/** Cities to offer in the location filter regardless of whether a posting
 *  exists there yet — otherwise the dropdown has nothing to show while
 *  `jobPostings` is empty, since it would have nowhere else to read a
 *  location from. OpenRoles.tsx merges this with whatever locations show up
 *  in real postings, so a future role in a city not listed here still gets
 *  picked up automatically rather than needing this list kept in sync. */
export const HIRING_LOCATIONS = ['Kolkata', 'Delhi'];
