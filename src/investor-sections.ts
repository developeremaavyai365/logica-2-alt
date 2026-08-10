import { TrendingUp, Users, Landmark, BarChart3, Building2, type LucideIcon } from 'lucide-react';
import {
  ANNUAL_REPORTS,
  ANNUAL_RETURNS,
  BOARD_MEETING_NOTICES,
  GENERAL_MEETING_PERIODS,
  FINANCIAL_RESULTS,
  SECRETARIAL_COMPLIANCE,
  NOTICE_DOC,
  SHAREHOLDER_BOARD_MEETING_PERIODS,
  SHAREHOLDER_GENERAL_MEETING_PERIODS,
  COMMITTEE_MEETING_PERIODS,
  POLICIES,
  MATERIAL_CREDITORS_DOC,
  SHAREHOLDING_PATTERN,
  FAMILIARIZATION_PROGRAM_DOC,
  FUND_RAISING_PERIODS,
  PROSPECTUS_DOC,
  COMPLIANCE_DISCLOSURES,
  GROUP_COMPANIES,
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
  { slug: 'notice-of-board-meeting', label: 'Board Meeting', category: 'Performance', kind: 'docs', items: BOARD_MEETING_NOTICES },
  { slug: 'general-meeting', label: 'General Meeting', category: 'Performance', kind: 'periods', items: GENERAL_MEETING_PERIODS },
  { slug: 'financial-results', label: 'Financial Results', category: 'Performance', kind: 'docs', items: FINANCIAL_RESULTS },
  { slug: 'secretarial-compliance', label: 'Secretarial Compliance', category: 'Performance', kind: 'docs', items: SECRETARIAL_COMPLIANCE },

  { slug: 'notice', label: 'Notice', category: 'Shareholder Information', kind: 'single', doc: NOTICE_DOC },
  { slug: 'board-meeting', label: 'Board Meeting', category: 'Shareholder Information', kind: 'periods', items: SHAREHOLDER_BOARD_MEETING_PERIODS },
  { slug: 'notice-of-general-meeting', label: 'General Meeting', category: 'Shareholder Information', kind: 'periods', items: SHAREHOLDER_GENERAL_MEETING_PERIODS },
  { slug: 'committee-meeting', label: 'Committee Meeting', category: 'Shareholder Information', kind: 'periods', items: COMMITTEE_MEETING_PERIODS },
  { slug: 'policies', label: 'Policies', category: 'Shareholder Information', kind: 'docs', items: POLICIES },
  { slug: 'material-creditors', label: 'Material Creditors', category: 'Shareholder Information', kind: 'single', doc: MATERIAL_CREDITORS_DOC },
  { slug: 'shareholding-pattern', label: 'Shareholding Pattern', category: 'Shareholder Information', kind: 'docs', items: SHAREHOLDING_PATTERN },
  { slug: 'familiarization-program', label: 'Familiarization Program', category: 'Shareholder Information', kind: 'single', doc: FAMILIARIZATION_PROGRAM_DOC },

  { slug: 'fund-raising', label: 'Fund Raising', category: 'Fund Raising', kind: 'periods', items: FUND_RAISING_PERIODS },
  { slug: 'prospectus', label: 'Prospectus', category: 'Fund Raising', kind: 'single', doc: PROSPECTUS_DOC },

  { slug: 'corporate-announcement', label: 'Corporate Announcement', category: 'Stock Exchange', kind: 'docs', items: COMPLIANCE_DISCLOSURES },

  { slug: 'group-companies', label: 'Group Companies', category: 'Group Companies', kind: 'names', items: GROUP_COMPANIES },
];

export const INVESTOR_CATEGORIES = ['Performance', 'Shareholder Information', 'Fund Raising', 'Stock Exchange', 'Group Companies'];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Performance: TrendingUp,
  'Shareholder Information': Users,
  'Fund Raising': Landmark,
  'Stock Exchange': BarChart3,
  'Group Companies': Building2,
};
