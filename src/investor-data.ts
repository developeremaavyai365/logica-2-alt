/** Real annual reports, mirrored from logicainfoway.com/annual-report.
 *  PDFs are linked to the source site directly rather than re-hosted. */

export interface AnnualReport {
  title: string;
  year: string;
  url: string;
}

export const ANNUAL_REPORTS: AnnualReport[] = [
  {
    title: "Realigned Annual Report 2024-25",
    year: "2024-25",
    url: "/investor/annual-reports/realigned-annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024-25",
    year: "2024-25",
    url: "/investor/annual-reports/annual-report-2024-25.pdf",
  },
  {
    title: "Annual Report 2023-24",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/07/ANNUAL-REPORT-2023-24.pdf",
  },
  {
    title: "Annual Report 2022-23",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/ANNUAL-REPORT-Eastern-Logica.pdf",
  },
  {
    title: "Annual Report 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/AUDIT-REPORT-ELIL_MERGED-FY-2021-22.pdf",
  },
  {
    title: "Annual Report 2020-21",
    year: "2020-21",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/Annual-Report-F-Y-2020-2021.pdf",
  },
  {
    title: "Annual Report 2019-20",
    year: "2019-20",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/Annual-Report-F-Y-2019-20.pdf",
  },
];

/** Real annual returns (MGT forms), mirrored from logicainfoway.com/annual-return. */
export const ANNUAL_RETURNS: AnnualReport[] = [
  {
    title: "Annual Return 2024-25",
    year: "2024-25",
    url: "/investor/annual-returns/annual-return-2024-25.pdf",
  },
  {
    title: "Annual Return 2023-24",
    year: "2023-24",
    url: "/investor/annual-returns/annual-return-2023-24.pdf",
  },
  {
    title: "Annual Return 2022-23",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Annual-Return-2022-23.pdf",
  },
  {
    title: "Annual Return 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/01/ANNUAL-RETURN-21-22.pdf",
  },
  {
    title: "Annual Return 2020-21",
    year: "2020-21",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/ELIL-MGT-F-Y-2020-21.pdf",
  },
  {
    title: "Annual Return 2019-20",
    year: "2019-20",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/ELIL-MGT-2019-20.pdf",
  },
];

/** Fiscal-year folder, used by Board Meeting / General Meeting — each real
 *  period links out to the source site's own listing page (the documents
 *  within each folder are nested a level deeper than is worth mirroring). */
export interface FiscalYearFolder {
  label: string;
  url: string;
}

/** Real individual board meeting notices/outcomes for FY 2025-26, newest
 *  first — replaces the old dead-link "period folder" list now that we
 *  have the actual filed documents. */
export const BOARD_MEETING_NOTICES: AnnualReport[] = [
  {
    title: "Outcome of the Board Meeting held on Friday, March 13, 2026",
    year: "2025-26",
    url: "/investor/board-meetings/outcome-board-meeting-13-03-2026.pdf",
  },
  {
    title: "Board Meeting Notice — March 13, 2026",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-notice-13-03-2026.pdf",
  },
  {
    title: "Board Meeting Intimation — Audited Financial Results for Period Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-intimation-audited-fy26.pdf",
  },
  {
    title: "Board Meeting Notice — May 12, 2026",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-notice-12-05-2026.pdf",
  },
  {
    title: "BM Notice — May 12, 2026",
    year: "2025-26",
    url: "/investor/board-meetings/bm-notice-12-05-2026.pdf",
  },
  {
    title: "BM Notice — November 14, 2025 (Signed)",
    year: "2025-26",
    url: "/investor/board-meetings/bm-notice-14-11-2025-signed.pdf",
  },
  {
    title: "Board Meeting Notice — November 14, 2025",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-notice-14-11-2025.pdf",
  },
  {
    title: "Board Meeting Notice — August 29, 2025",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-notice-29-08-2025.pdf",
  },
  {
    title: "Board Meeting Notice — May 30, 2025",
    year: "2025-26",
    url: "/investor/board-meetings/board-meeting-notice-30-05-2025.pdf",
  },
  {
    title: "BM Notice — April 30, 2025 (Revised)",
    year: "2025-26",
    url: "/investor/board-meetings/bm-notice-30-04-2025-revised.pdf",
  },
];

/** Real general meeting notice periods, mirrored from
 *  logicainfoway.com/general-meeting. */
export const GENERAL_MEETING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027-3-5/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026-9-2/" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-4/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-7/" },
];

/** Real financial results, mirrored from logicainfoway.com/financial-results. */
export const FINANCIAL_RESULTS: AnnualReport[] = [
  {
    title: "Board Meeting Outcome — Financial Results for Half Year and Year Ended 31-03-2026",
    year: "2025-26",
    url: "/investor/financial-results/board-meeting-outcome-financial-results-31-03-2026.pdf",
  },
  {
    title: "Financial Results for Half Year and Financial Year Ended 31-03-2026",
    year: "2025-26",
    url: "/investor/financial-results/financial-results-fy-2025-26.pdf",
  },
  {
    title: "Financial Result for the Half Year and Year Ended 30-09-2025",
    year: "2025-26",
    url: "/investor/financial-results/financial-result-hy-30-09-2025.pdf",
  },
  {
    title: "Revised Financial Results for Half Year and Year Ended 31-03-2025",
    year: "2024-25",
    url: "/investor/financial-results/revised-financial-results-31-03-2025.pdf",
  },
  {
    title: "Unaudited Financial Result for the Half Year and Year Ended 30-09-2024",
    year: "2024-25",
    url: "/investor/financial-results/unaudited-financial-result-30-09-2024.pdf",
  },
  {
    title: "Financial Results for Half Year and Year Ended 31-03-2024",
    year: "2023-24",
    url: "/investor/financial-results/financial-results-31-03-2024.pdf",
  },
  {
    title: "Unaudited Financial Results for the Half Year Ended 30-09-2023",
    year: "2023-24",
    url: "/investor/financial-results/unaudited-financial-results-30-09-2023.pdf",
  },
  {
    title: "Financial Results for the Half Year and Year Ended 31-03-2023",
    year: "2022-23",
    url: "/investor/financial-results/financial-results-31-03-2023.pdf",
  },
];

/** Real secretarial audit reports, mirrored from
 *  logicainfoway.com/secretarial-compliance. */
export const SECRETARIAL_COMPLIANCE: AnnualReport[] = [
  {
    title: "Secretarial Audit Report 2023-24",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/SECRETARIAL-AUDIT-REPORT-MR3-signed-1.pdf",
  },
  {
    title: "Secretarial Audit Report 2022-23",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/SEC-REPORT.pdf",
  },
  {
    title: "Secretarial Audit Report 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/Secretarial-Audit-report-2021-22.pdf",
  },
];

/** Real notice, mirrored from logicainfoway.com/notice. */
export const NOTICE_DOC: AnnualReport = {
  title: "Notice",
  year: "",
  url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/NOTICE.pdf",
};

/** Real board meeting periods under Shareholder Information, mirrored from
 *  logicainfoway.com/board-meeting (distinct from the Performance category's
 *  notice-of-board-meeting page — the source site lists both separately). */
export const SHAREHOLDER_BOARD_MEETING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027-3/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026-12/" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2024-to-31-03-2025-7/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-2/" },
  { label: "Prior to Listing", url: "https://www.logicainfoway.com/prior-to-listening/" },
];

/** Real general meeting periods under Shareholder Information, mirrored from
 *  logicainfoway.com/notice-of-general-meeting. */
export const SHAREHOLDER_GENERAL_MEETING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027-3-2/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026-2/" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2024-to-31-03-2025-6/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024/" },
  { label: "Prior to Listing", url: "https://www.logicainfoway.com/committee-meeting-01-04-2023-to-31-03-2024/" },
];

/** Real committee meeting periods, mirrored from logicainfoway.com/committee-meeting. */
export const COMMITTEE_MEETING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027-3-3/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026/" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2024-to-31-03-2025-4/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/committee-meeting-01-04-2023-to-31-03-2024/" },
];

/** Real corporate policy documents, mirrored from logicainfoway.com/policies. */
export const POLICIES: AnnualReport[] = [
  {
    title: "Related Party Policy",
    year: "",
    url: "/investor/policies/related-party-policy-revised.pdf",
  },
  {
    title: "CSR Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/08/CSR-POLICY.pdf",
  },
  {
    title: "Forex Exchange Risk Management Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/08/APPROVED-FOREX-EXCHANGE-RISK-MANAGEMENT-POLICY.pdf",
  },
  {
    title: "Code of Conduct for Directors and Senior Management",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Code-of-Conduct-for-Directors-and-Senior-Management-1.pdf",
  },
  {
    title: "Familiarization Program for Independent Directors",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Familiarization-Program-for-Independent-Directors-1.pdf",
  },
  {
    title: "Internal Procedures and Conduct for Prevention of Insider Trading",
    year: "",
    url: "/investor/policies/insider-trading-policy-revised.pdf",
  },
  {
    title: "Materiality Policy for Identification of Group Companies",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Materiality-Policy-for-Identification-of-Group-Companies-1.pdf",
  },
  {
    title: "Nomination and Remuneration Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Nomination-and-Remuneration-Policy-1.pdf",
  },
  {
    title: "Policy for Archival of Documents",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-for-Archival-of-Documents-1.pdf",
  },
  {
    title: "Policy on Disclosure of Material Events/Information",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/policy-on-disclosure-of-material-event.pdf",
  },
  {
    title: "Policy on Diversity on Board",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Diversity-on-Board-1.pdf",
  },
  {
    title: "Policy on Identification of Material Creditors and Material Litigations",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Identification-of-Material-Creditors-and-Material-Litigation.pdf",
  },
  {
    title: "Policy on Prevention of Sexual Harassment at Workplace",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Prevention-of-Sexual-Harrasment-at-Workplace-1.pdf",
  },
  {
    title: "Policy on Terms of Appointment of Independent Directors",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Terms-of-Appointment-of-Independent-Directors-1.pdf",
  },
  {
    title: "Vigil Mechanism Whistle Blower Policy for Directors and Employees",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Vigil-Mechanism_Whistle-Blower-Policy-for-Directors-and-Employees-1.pdf",
  },
];

/** Real material creditors filing, mirrored from logicainfoway.com/material-creditors. */
export const MATERIAL_CREDITORS_DOC: AnnualReport = {
  title: "Material Creditors",
  year: "",
  url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/Material-Creditors.pdf",
};

/** Real shareholding pattern filings, mirrored from logicainfoway.com/shareholding-pattern. */
export const SHAREHOLDING_PATTERN: AnnualReport[] = [
  {
    title: "Shareholding Pattern for FY ended 31-03-2026",
    year: "2025-26",
    url: "/investor/shareholding-pattern/shareholding-pattern-31-03-2026.pdf",
  },
  {
    title: "Shareholding Pattern for HY ended 30-09-2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/Shareholding-Pattern-30.09.2025-signed-2.pdf",
  },
  {
    title: "Shareholding Pattern for Year Ended 31-03-2025",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/04/Shareholding-Pattern-31.03.2025-signed.pdf",
  },
  {
    title: "Shareholding Pattern for HY Ended 30-09-2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Shareholding-pattern-for-HY-ended-30-September-2024-2.pdf",
  },
  {
    title: "Shareholding Pattern as on 31-03-2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Shareholding-Pattern-as-on-31-03-2024.pdf",
  },
];

/** Real familiarization program filing, mirrored from
 *  logicainfoway.com/familiarization-program. */
export const FAMILIARIZATION_PROGRAM_DOC: AnnualReport = {
  title: "Familiarization Program (under Regulation 46)",
  year: "",
  url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Familarisation-Programme-under-Regulation-46.pdf",
};

/** Real fund raising periods, mirrored from logicainfoway.com/fund-raising. */
export const FUND_RAISING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2024-to-31-03-2025-8/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-6/" },
  { label: "01-04-2022 to 31-03-2023", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-8" },
];

/** Real prospectus filing, mirrored from logicainfoway.com/prospectus. */
export const PROSPECTUS_DOC: AnnualReport = {
  title: "Prospectus",
  year: "",
  url: "https://www.logicainfoway.com/wp-content/uploads/2022/12/ELIL-Prospectus-RA20221228-Final_compressed.pdf",
};

/** Real corporate announcements / SEBI compliance filings, replacing the
 *  old dead-link "period folder" list now that we have the actual filed
 *  documents (Regulation 30/57/74 disclosures, trading-window closures,
 *  MD&A submissions, etc.), newest first. */
export const COMPLIANCE_DISCLOSURES: AnnualReport[] = [
  {
    title: "Submission of Management Discussion & Analysis — H2 FY26 & FY26",
    year: "2025-26",
    url: "/investor/compliance/management-discussion-analysis-h2-fy26.pdf",
  },
  {
    title: "Non-Applicability of Annual Secretarial Compliance Report (Regulation 24A) — Year Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/compliance/reg-24a-secretarial-compliance-non-applicability-fy26.pdf",
  },
  {
    title: "Intimation of Non-Applicability of Large Corporate (LC) Disclosure — Year Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/compliance/large-corporate-disclosure-non-applicability-fy26.pdf",
  },
  {
    title: "Certificate under Regulation 74(5) of SEBI (DP) Regulations — Quarter Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/compliance/reg-74-5-certificate-q-mar-2026.pdf",
  },
  {
    title: "Certificate under Regulation 74(5) of SEBI (DP) Regulations — Quarter Ended December 31, 2025",
    year: "2025-26",
    url: "/investor/compliance/reg-74-5-certificate-q-dec-2025.pdf",
  },
  {
    title: "Compliance under Regulation 57(4) SEBI (LODR) — Quarter Ended December 30, 2025",
    year: "2025-26",
    url: "/investor/compliance/reg-57-4-compliance-q-dec-2025.pdf",
  },
  {
    title: "Compliance under Regulation 57(5) SEBI (LODR) — Quarter Ended December 31, 2025",
    year: "2025-26",
    url: "/investor/compliance/reg-57-5-compliance-q-dec-2025.pdf",
  },
  {
    title: "Compliance under Regulation 57(5) SEBI (LODR) — Quarter Ended September 30, 2025 (Non-Applicability)",
    year: "2025-26",
    url: "/investor/compliance/reg-57-5-compliance-q-sep-2025.pdf",
  },
  {
    title: "Statement of Deviation or Variation in Utilization of Funds — Half Year Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/compliance/statement-deviation-utilization-of-funds-hy-mar-2026.pdf",
  },
  {
    title: "Clarification on Display of \"Rights Issue of Equity Shares with Warrants\" under Board Meetings Section",
    year: "2025-26",
    url: "/investor/compliance/clarification-rights-issue-display.pdf",
  },
  {
    title: "Announcement under Regulation 30 (LODR) — Change in Management",
    year: "2025-26",
    url: "/investor/compliance/reg-30-change-in-management.pdf",
  },
  {
    title: "Revised Intimation of Resignation — Chief Operating Officer (North) & KMP (Regulation 30)",
    year: "2025-26",
    url: "/investor/compliance/reg-30-resignation-coo-north.pdf",
  },
  {
    title: "Outcome of Analyst/Institutional Investor Meeting (SEBI LODR Regulations, 2015)",
    year: "2025-26",
    url: "/investor/compliance/outcome-analyst-institutional-investor-meeting.pdf",
  },
  {
    title: "Regulation 30 (LODR) — Participation in Arihant Capital Bharat Connect Virtual Conference, March 11, 2026",
    year: "2025-26",
    url: "/investor/compliance/reg-30-arihant-capital-conference-participation.pdf",
  },
  {
    title: "Intimation Regarding Closure of Trading Window",
    year: "2025-26",
    url: "/investor/compliance/closure-of-trading-window.pdf",
  },
  {
    title: "Trading Window Closure Notice",
    year: "2025-26",
    url: "/investor/compliance/trading-window-closure-notice.pdf",
  },
];

/** Real group (subsidiary) companies, mirrored from logicainfoway.com/group-companies —
 *  named entities only; the source page doesn't expose individual report URLs. */
export const GROUP_COMPANIES = [
  "Himadri Dealcom Private Ltd.",
  "Sonartari Tradelink Private Ltd.",
  "Logica Systems & Peripherals Private Ltd.",
  "Kalpaturu Tradevin Private Ltd.",
  "Nirwan Logica Private Ltd.",
];
