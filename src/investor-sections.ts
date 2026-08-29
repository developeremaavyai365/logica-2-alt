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
  type FiscalYearFolder,
} from './investor-data';

export type InvestorSection =
  | { slug: string; label: string; category: string; kind: 'docs'; items: AnnualReport[] }
  | { slug: string; label: string; category: string; kind: 'periods'; items: FiscalYearFolder[] }
  | { slug: string; label: string; category: string; kind: 'single'; doc: AnnualReport }
  | { slug: string; label: string; category: string; kind: 'names'; items: string[] };

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

  { slug: 'notice', label: 'Notice', category: 'Shareholder Information', kind: 'single', doc: NOTICE_DOC },
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

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Performance: TrendingUp,
  'Shareholder Information': Users,
  'Fund Raising': Landmark,
  'Stock Exchange': BarChart3,
  'Group Companies': Building2,
};
