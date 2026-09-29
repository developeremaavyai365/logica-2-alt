/** A single open role. `id` is the URL slug for its detail page
 *  (/careers/open-roles/:id) — keep it stable, since a shared link to a
 *  role should keep working as long as the role is listed.
 *
 *  To add a real opening: add one object to `jobPostings` below. The open
 *  roles list, its search/filter, and the detail page all read from this
 *  array. Removing a role is the same in reverse: delete its object. */
export type JobPosting = {
  id: string;
  title: string;
  /** Team / function, e.g. "Channel Sales". */
  department: string;
  location: string;
  /** 'Full-time' | 'Internship' | 'Contract' — kept short, renders as a tag. */
  employmentType: string;
  /** ISO date (YYYY-MM-DD) the role was listed on the site. */
  postedOn: string;
  reportingTo?: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  education?: string;
};

export const jobPostings: JobPosting[] = [
  {
    id: 'area-sales-manager-delhi-ncr',
    title: 'Area Sales Manager',
    department: 'Channel Sales',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-09-29',
    reportingTo: 'Sales Head',
    summary:
      'Logica Infoway Ltd. is looking for a result-oriented Area Sales Manager to drive Samsung Laptop sales across Delhi & NCR. The role will focus on expanding the retail and channel network, onboarding new retailers, driving sell-out, maintaining product visibility and developing strong relationships with channel partners.',
    responsibilities: [
      'Manage and develop relationships with existing retailers, dealers and channel partners across the assigned territory.',
      'Identify, approach and onboard new retailers/channel partners for Samsung Laptop products.',
      'Drive sell-in and sell-out of laptops through the assigned retail network.',
      'Develop relationships with LFRs and key retail outlets and ensure effective product placement and sales.',
      'Present product features, pricing, schemes, promotions and commercial offers to retailers.',
      'Ensure adequate stock availability, product visibility and merchandising at retail outlets.',
      'Regularly visit retailers and monitor sales, stock movement, orders and market demand.',
      'Achieve assigned sales, revenue, distribution and retailer onboarding targets.',
      'Track competitor pricing, schemes, products and market activities and provide regular market feedback.',
      'Identify new business opportunities and expand the retailer/dealer network.',
      'Coordinate with the internal sales, distribution and operations teams for orders, stock availability, schemes and partner support.',
      'Ensure timely follow-up on outstanding orders, payments and other channel-related requirements.',
      'Maintain regular daily/weekly sales and market visit reports.',
    ],
    requirements: [
      '1–4 years of experience in channel sales, retail sales or distribution sales.',
      'Experience in laptops, IT hardware, consumer electronics or similar products preferred.',
      'Experience handling retailers, dealers, distributors, LFRs or channel partners.',
      'Good knowledge of the Delhi & NCR retail/channel market.',
    ],
    education: 'Graduate degree / MBA.',
  },
];

/** Cities offered in the location filter even before a posting exists
 *  there. OpenRoles.tsx merges this with the locations real postings carry. */
export const HIRING_LOCATIONS = ['Kolkata', 'Delhi & NCR'];
