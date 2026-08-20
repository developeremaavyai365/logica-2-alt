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
    url: "/investor/annual-reports/annual-report-2023-24.pdf",
  },
  {
    title: "Annual Report 2022-23",
    year: "2022-23",
    url: "/investor/annual-reports/annual-report-2022-23.pdf",
  },
  {
    title: "Annual Report 2021-22",
    year: "2021-22",
    url: "/investor/annual-reports/annual-report-2021-22.pdf",
  },
  {
    title: "Annual Report 2020-21",
    year: "2020-21",
    url: "/investor/annual-reports/annual-report-2020-21.pdf",
  },
  {
    title: "Annual Report 2019-20",
    year: "2019-20",
    url: "/investor/annual-reports/annual-report-2019-20.pdf",
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
    url: "/investor/annual-returns/annual-return-2022-23.pdf",
  },
  {
    title: "Annual Return 2021-22",
    year: "2021-22",
    url: "/investor/annual-returns/annual-return-2021-22.pdf",
  },
  {
    title: "Annual Return 2020-21",
    year: "2020-21",
    url: "/investor/annual-returns/annual-return-2020-21.pdf",
  },
  {
    title: "Annual Return 2019-20",
    year: "2019-20",
    url: "/investor/annual-returns/annual-return-2019-20.pdf",
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

/** Real general meeting notices/outcomes, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const GENERAL_MEETING_NOTICES: AnnualReport[] = [
  {
    title: "Corrigendum to the Annual Report for FY 2024-25 and Notice of the 30th AGM",
    year: "2025-26",
    url: "/investor/general-meeting/corrigendum-annual-report-notice-30th-agm.pdf",
  },
  {
    title: "Disclosure of Voting Results and Consolidated Scrutinizer's Report of the 30th AGM",
    year: "2025-26",
    url: "/investor/general-meeting/voting-results-scrutinizer-report-30th-agm.pdf",
  },
  {
    title: "Outcome/Proceedings of the 30th Annual General Meeting for F.Y. 2024-25",
    year: "2025-26",
    url: "/investor/general-meeting/outcome-proceedings-30th-agm-fy2024-25.pdf",
  },
  {
    title: "Notice of the 30th Annual General Meeting",
    year: "2025-26",
    url: "/investor/general-meeting/notice-30th-agm.pdf",
  },
  {
    title: "Intimation of Record Date of the 30th Annual General Meeting",
    year: "2025-26",
    url: "/investor/general-meeting/intimation-record-date-30th-agm.pdf",
  },
  {
    title: "Intimation of Date of the 30th Annual General Meeting",
    year: "2025-26",
    url: "/investor/general-meeting/intimation-date-30th-agm.pdf",
  },
  {
    title: "Board Meeting Intimation for Approval of Notice Convening the AGM and Other Incidental Matters",
    year: "2025-26",
    url: "/investor/general-meeting/board-meeting-intimation-notice-convening-agm.pdf",
  },
  {
    title: "28th AGM Transcript",
    year: "2023-24",
    url: "/investor/general-meeting/28th-agm-transcript.pdf",
  },
  {
    title: "Revised Proceedings of the First EGM 2024-25",
    year: "2024-25",
    url: "/investor/general-meeting/revised-proceedings-first-egm-2024-25.pdf",
  },
  {
    title: "Postal Ballot — Outcome of EGM",
    year: "2024-25",
    url: "/investor/general-meeting/postal-ballot-outcome-of-egm.pdf",
  },
  {
    title: "Proceedings of the 1st Extra-Ordinary General Meeting (EGM) of 2024-25",
    year: "2024-25",
    url: "/investor/general-meeting/proceedings-1st-egm-2024-25.pdf",
  },
  {
    title: "Corrigendum to EGM Notice — February 6, 2025",
    year: "2024-25",
    url: "/investor/general-meeting/corrigendum-egm-notice-06-02-2025.pdf",
  },
  {
    title: "EGM Notice — February 6, 2025",
    year: "2024-25",
    url: "/investor/general-meeting/egm-notice-06-02-2025.pdf",
  },
  {
    title: "AGM Notice 2024",
    year: "2023-24",
    url: "/investor/general-meeting/agm-notice-2024.pdf",
  },
  {
    title: "EGM Notice — July 8, 2024",
    year: "2023-24",
    url: "/investor/general-meeting/egm-notice-08-07-2024.pdf",
  },
  {
    title: "Proceedings of EGM — February 13, 2024",
    year: "2023-24",
    url: "/investor/general-meeting/proceedings-egm-13-02-2024.pdf",
  },
  {
    title: "Regulation 44 Voting Result",
    year: "2023-24",
    url: "/investor/general-meeting/reg-44-voting-result-13-02-2024.pdf",
  },
  {
    title: "EGM Record Date — February 8, 2024",
    year: "2023-24",
    url: "/investor/general-meeting/egm-record-date-08-02-2024.pdf",
  },
  {
    title: "AGM Notice 2023",
    year: "2022-23",
    url: "/investor/general-meeting/agm-notice-2023.pdf",
  },
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
    url: "/investor/secretarial-compliance/secretarial-audit-report-2023-24.pdf",
  },
  {
    title: "Secretarial Audit Report 2022-23",
    year: "2022-23",
    url: "/investor/secretarial-compliance/secretarial-audit-report-2022-23.pdf",
  },
  {
    title: "Secretarial Audit Report 2021-22",
    year: "2021-22",
    url: "/investor/secretarial-compliance/secretarial-audit-report-2021-22.pdf",
  },
];

/** Real notice, mirrored from logicainfoway.com/notice. */
export const NOTICE_DOC: AnnualReport = {
  title: "Notice",
  year: "",
  url: "/investor/notice/notice.pdf",
};

/** Real committee meeting notices, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const COMMITTEE_MEETING_NOTICES: AnnualReport[] = [
  {
    title: "Notice and Agenda — Audit Committee Meeting, November 14, 2024",
    year: "2024-25",
    url: "/investor/committee-meeting/audit-committee-meeting-notice-agenda-14-11-2024.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 5",
    year: "2023-24",
    url: "/investor/committee-meeting/audit-committee-meeting-notice-5.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 4",
    year: "2023-24",
    url: "/investor/committee-meeting/audit-committee-meeting-notice-4.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 3",
    year: "2023-24",
    url: "/investor/committee-meeting/audit-committee-meeting-notice-3.pdf",
  },
  {
    title: "Notice of 1st Meeting, Financial Year 2023-24 of Audit Committee",
    year: "2023-24",
    url: "/investor/committee-meeting/audit-committee-meeting-notice-1st-fy2023-24.pdf",
  },
  {
    title: "Independent Director Meeting Notice — 1",
    year: "2023-24",
    url: "/investor/committee-meeting/independent-director-meeting-notice-1.pdf",
  },
  {
    title: "Nomination & Remuneration Committee Meeting Notice",
    year: "2023-24",
    url: "/investor/committee-meeting/nomination-and-remuneration-committee-meeting-notice.pdf",
  },
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
    url: "/investor/policies/csr-policy.pdf",
  },
  {
    title: "Forex Exchange Risk Management Policy",
    year: "",
    url: "/investor/policies/forex-exchange-risk-management-policy.pdf",
  },
  {
    title: "Code of Conduct for Directors and Senior Management",
    year: "",
    url: "/investor/policies/code-of-conduct-directors-senior-management.pdf",
  },
  {
    title: "Familiarization Program for Independent Directors",
    year: "",
    url: "/investor/policies/familiarization-program-for-independent-directors.pdf",
  },
  {
    title: "Internal Procedures and Conduct for Prevention of Insider Trading",
    year: "",
    url: "/investor/policies/insider-trading-policy-revised.pdf",
  },
  {
    title: "Materiality Policy for Identification of Group Companies",
    year: "",
    url: "/investor/policies/materiality-policy-identification-of-group-companies.pdf",
  },
  {
    title: "Nomination and Remuneration Policy",
    year: "",
    url: "/investor/policies/nomination-and-remuneration-policy.pdf",
  },
  {
    title: "Policy for Archival of Documents",
    year: "",
    url: "/investor/policies/policy-for-archival-of-documents.pdf",
  },
  {
    title: "Policy on Disclosure of Material Events/Information",
    year: "",
    url: "/investor/policies/policy-on-disclosure-of-material-event.pdf",
  },
  {
    title: "Policy on Diversity on Board",
    year: "",
    url: "/investor/policies/policy-on-diversity-on-board.pdf",
  },
  {
    title: "Policy on Identification of Material Creditors and Material Litigations",
    year: "",
    url: "/investor/policies/policy-on-identification-of-material-creditors-and-material-litigations.pdf",
  },
  {
    title: "Policy on Prevention of Sexual Harassment at Workplace",
    year: "",
    url: "/investor/policies/policy-prevention-sexual-harassment-workplace.pdf",
  },
  {
    title: "Policy on Terms of Appointment of Independent Directors",
    year: "",
    url: "/investor/policies/policy-on-terms-of-appointment-of-independent-directors.pdf",
  },
  {
    title: "Vigil Mechanism Whistle Blower Policy for Directors and Employees",
    year: "",
    url: "/investor/policies/vigil-mechanism-whistle-blower-policy.pdf",
  },
];

/** Real material creditors filing, mirrored from logicainfoway.com/material-creditors. */
export const MATERIAL_CREDITORS_DOC: AnnualReport = {
  title: "Material Creditors",
  year: "",
  url: "/investor/material-creditors/material-creditors.pdf",
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
    url: "/investor/shareholding-pattern/shareholding-pattern-30-09-2025.pdf",
  },
  {
    title: "Shareholding Pattern for Year Ended 31-03-2025",
    year: "2024-25",
    url: "/investor/shareholding-pattern/shareholding-pattern-31-03-2025.pdf",
  },
  {
    title: "Shareholding Pattern for HY Ended 30-09-2024",
    year: "2024-25",
    url: "/investor/shareholding-pattern/shareholding-pattern-hy-30-09-2024.pdf",
  },
  {
    title: "Shareholding Pattern as on 31-03-2024",
    year: "2023-24",
    url: "/investor/shareholding-pattern/shareholding-pattern-31-03-2024.pdf",
  },
];

/** Real familiarization program filing, mirrored from
 *  logicainfoway.com/familiarization-program. */
export const FAMILIARIZATION_PROGRAM_DOC: AnnualReport = {
  title: "Familiarization Program (under Regulation 46)",
  year: "",
  url: "/investor/policies/familiarization-program-regulation-46.pdf",
};

/** Real fund raising disclosures, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const FUND_RAISING_NOTICES: AnnualReport[] = [
  {
    title: "Statement of Deviation or Variation in Utilization of Funds — Half Year Ended September 30, 2025",
    year: "2025-26",
    url: "/investor/fund-raising/statement-of-deviation-half-year-ended-30-09-2025.pdf",
  },
  {
    title: "Statement of Deviation/Variation — Half Year Ended March 31, 2025 (Preferential Issue, March 1, 2025)",
    year: "2024-25",
    url: "/investor/fund-raising/statement-of-deviation-half-year-ended-31-03-2025.pdf",
  },
  {
    title: "Intimation Regarding Trading Approval Received for Equity Shares Issued on Preferential Basis",
    year: "2024-25",
    url: "/investor/fund-raising/intimation-trading-approval-preferential-shares.pdf",
  },
  {
    title: "Outcome of Board Meeting — Allotment of Equity Shares on Preferential Basis and Other Matters",
    year: "2024-25",
    url: "/investor/fund-raising/outcome-board-meeting-allotment-preferential-basis-01-03-2025.pdf",
  },
  {
    title: "In-Principle Approval Granted by Stock Exchange for Issuance of Preference Shares",
    year: "2024-25",
    url: "/investor/fund-raising/in-principle-approval-issuance-of-preference-shares.pdf",
  },
  {
    title: "Announcement under Regulation 30 (LODR) — Preferential Issue",
    year: "2024-25",
    url: "/investor/fund-raising/announcement-regulation-30-preferential-issue.pdf",
  },
  {
    title: "Increase in Authorised Capital of the Company",
    year: "2024-25",
    url: "/investor/fund-raising/increase-in-authorised-capital.pdf",
  },
  {
    title: "Valuation Report",
    year: "2024-25",
    url: "/investor/fund-raising/lil-valuation-report-signed.pdf",
  },
  {
    title: "ELIL Prospectus (Final)",
    year: "2022-23",
    url: "/investor/fund-raising/elil-prospectus-final.pdf",
  },
];

/** Real prospectus filing, mirrored from logicainfoway.com/prospectus. */
export const PROSPECTUS_DOC: AnnualReport = {
  title: "Prospectus",
  year: "",
  url: "/investor/fund-raising/elil-prospectus-final.pdf",
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
