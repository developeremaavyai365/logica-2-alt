import { TrendingUp, Users, Landmark, BarChart3, Building2, type LucideIcon } from 'lucide-react';
import {
  ANNUAL_REPORTS,
  ANNUAL_RETURNS,
  BOARD_MEETING_NOTICES,
  GENERAL_MEETING_NOTICES,
  FINANCIAL_RESULTS,
  SECRETARIAL_COMPLIANCE,
  NOTICE_DOC,
  COMMITTEE_MEETING_NOTICES,
  POLICIES,
  MATERIAL_CREDITORS_DOC,
  SHAREHOLDING_PATTERN,
  FAMILIARIZATION_PROGRAM_DOC,
  FUND_RAISING_NOTICES,
  PROSPECTUS_DOC,
  COMPLIANCE_DISCLOSURES,
  GROUP_COMPANIES,
  SUBSIDIARY_AUDIT_REPORTS,
  type AnnualReport,
} from './investor-data';

export interface DocGroup {
  label: string;
  items: AnnualReport[];
}

export type InvestorSection =
  | { slug: string; label: string; category: string; kind: 'docs'; items: AnnualReport[] }
  | { slug: string; label: string; category: string; kind: 'groups'; groups: DocGroup[] }
  | { slug: string; label: string; category: string; kind: 'single'; doc: AnnualReport }
  | { slug: string; label: string; category: string; kind: 'names'; items: string[] };

/** A convening notice rather than what the meeting decided. Board and general
 *  meeting records hold both, and the Notice page is meant to gather only the
 *  notices. */
const isNotice = (d: AnnualReport) =>
  /\bnotice\b|\bintimation\b/i.test(d.title) && !/outcome|proceeding|voting result|scrutinizer|transcript/i.test(d.title);

export const INVESTOR_SECTIONS: InvestorSection[] = [
  { slug: 'annual-report', label: 'Annual Report', category: 'Performance', kind: 'docs', items: ANNUAL_REPORTS },
  { slug: 'annual-return', label: 'Annual Return', category: 'Performance', kind: 'docs', items: ANNUAL_RETURNS },
  // Board/General Meeting live under Shareholder Information alongside
  // Committee Meeting. They previously appeared here too, as separate slugs
  // backed by the *same* arrays, so the menu offered two "Board Meeting"
  // entries leading to two URLs with identical content. The old slugs
  // (notice-of-board-meeting / notice-of-general-meeting) are redirected in
  // vercel.json so existing links keep working.
  { slug: 'financial-results', label: 'Financial Results', category: 'Performance', kind: 'docs', items: FINANCIAL_RESULTS },
  { slug: 'secretarial-compliance', label: 'Secretarial Compliance', category: 'Performance', kind: 'docs', items: SECRETARIAL_COMPLIANCE },

  // Notice gathers the convening notices for both kinds of meeting, kept in
  // separate groups on the one page. The documents themselves stay listed in
  // Board Meeting and General Meeting alongside their outcomes.
  {
    slug: 'notice',
    label: 'Notice',
    category: 'Shareholder Information',
    kind: 'groups',
    groups: [
      { label: 'Board Meeting Notices', items: BOARD_MEETING_NOTICES.filter(isNotice) },
      {
        label: 'Shareholder Meeting Notices',
        items: [NOTICE_DOC, ...GENERAL_MEETING_NOTICES.filter(isNotice)],
      },
    ],
  },
  { slug: 'board-meeting', label: 'Board Meeting', category: 'Shareholder Information', kind: 'docs', items: BOARD_MEETING_NOTICES },
  { slug: 'general-meeting', label: 'General Meeting', category: 'Shareholder Information', kind: 'docs', items: GENERAL_MEETING_NOTICES },
  { slug: 'committee-meeting', label: 'Committee Meeting', category: 'Shareholder Information', kind: 'docs', items: COMMITTEE_MEETING_NOTICES },
  { slug: 'policies', label: 'Policies', category: 'Shareholder Information', kind: 'docs', items: POLICIES },
  { slug: 'material-creditors', label: 'Material Creditors', category: 'Shareholder Information', kind: 'single', doc: MATERIAL_CREDITORS_DOC },
  { slug: 'shareholding-pattern', label: 'Shareholding Pattern', category: 'Shareholder Information', kind: 'docs', items: SHAREHOLDING_PATTERN },
  { slug: 'familiarization-program', label: 'Familiarization Program', category: 'Shareholder Information', kind: 'single', doc: FAMILIARIZATION_PROGRAM_DOC },

  { slug: 'fund-raising', label: 'Fund Raising', category: 'Fund Raising', kind: 'docs', items: FUND_RAISING_NOTICES },
  { slug: 'prospectus', label: 'Prospectus', category: 'Fund Raising', kind: 'single', doc: PROSPECTUS_DOC },

  { slug: 'corporate-announcement', label: 'Corporate Announcement', category: 'Stock Exchange', kind: 'docs', items: COMPLIANCE_DISCLOSURES },

  { slug: 'group-companies', label: 'Group Companies', category: 'Group Companies', kind: 'names', items: GROUP_COMPANIES },
  { slug: 'subsidiary-audit-reports', label: 'Subsidiary Audit Reports', category: 'Group Companies', kind: 'docs', items: SUBSIDIARY_AUDIT_REPORTS },
];

export const INVESTOR_CATEGORIES = ['Performance', 'Shareholder Information', 'Fund Raising', 'Stock Exchange', 'Group Companies'];

/** Investor pages that live outside INVESTOR_SECTIONS because they are not
 *  document lists. They used to be reachable only from the header dropdown,
 *  so they are carried into the tab bar explicitly — without this they would
 *  have no route into them at all once the dropdown went. */
const STANDALONE_PAGES: { label: string; href: string; category: string }[] = [
  { label: 'Advertisement', href: '/advertisement', category: 'Shareholder Information' },
  { label: 'Basis of Allotment', href: '/basis-of-allotment', category: 'Shareholder Information' },
  { label: 'Reg 46', href: '/investor/reg-46', category: 'Stock Exchange' },
  { label: 'Authorized Person', href: '/authorized-person', category: 'Stock Exchange' },
  { label: 'Grievance Redressal', href: '/grievance-redressal', category: 'Stock Exchange' },
];

export interface InvestorTab {
  label: string;
  href: string;
  /** Section slug when this tab is a document list, absent for the
   *  standalone pages, which are matched on href instead. */
  slug?: string;
}

/** The two-level tab model the investor pages navigate by: a category row,
 *  and the pages inside whichever category is active. Replaces the header
 *  dropdown, so it has to cover everything that dropdown reached. */
export const INVESTOR_TABS: { category: string; items: InvestorTab[] }[] =
  INVESTOR_CATEGORIES.map((category) => ({
    category,
    items: [
      ...INVESTOR_SECTIONS.filter((s) => s.category === category).map((s) => ({
        label: s.label,
        href: `/investor/${s.slug}`,
        slug: s.slug,
      })),
      ...STANDALONE_PAGES.filter((p) => p.category === category).map((p) => ({
        label: p.label,
        href: p.href,
      })),
    ],
  }));

/** Which category a given pathname sits in, for highlighting the tab bar. */
export function categoryForPath(pathname: string): string | null {
  for (const group of INVESTOR_TABS) {
    if (group.items.some((i) => i.href === pathname)) return group.category;
  }
  return null;
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Performance: TrendingUp,
  'Shareholder Information': Users,
  'Fund Raising': Landmark,
  'Stock Exchange': BarChart3,
  'Group Companies': Building2,
};
