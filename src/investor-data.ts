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
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/Realligned-Annual-Report-2024-25.pdf",
  },
  {
    title: "Annual Report 2024-25",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/Annual-Report-FY-2024-25-1.pdf",
  },
  {
    title: "Annual Report 2023-24",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/07/ANNUAL-REPORT-2023-24.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Annual-Return-2024-25.pdf",
  },
  {
    title: "Annual Return 2023-24",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Annual-Return-2023-24.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Outcome-of-the-Board-Meeting-held-on-Friday-March-13-2026.pdf",
  },
  {
    title: "Board Meeting Notice — March 13, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Board-Meeting-Notice-13.03.2026.pdf",
  },
  {
    title: "Board Meeting Intimation — Audited Financial Results for Period Ended March 31, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Board-Meeting-Intimation-for-Approval-Of-Audited-Financial-Results-Of-The-Company-For-The-Period-Ended-March-31-2026-And-Other-Routine-Business-Matters.pdf",
  },
  {
    title: "Board Meeting Notice — May 12, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Board-Meeting-Notice-12-05-2026.pdf",
  },
  {
    title: "BM Notice — May 12, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/07/BM-Notice-12.05.2026.pdf",
  },
  {
    title: "BM Notice — November 14, 2025 (Signed)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/07/BM-Notice-14.11.2025-signed.pdf",
  },
  {
    title: "Board Meeting Notice — November 14, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Board-Meeting-Notice-14.11.2025.pdf",
  },
  {
    title: "Board Meeting Notice — August 29, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Board-Meeting-Notice-29.08.2025.pdf",
  },
  {
    title: "Board Meeting Notice — May 30, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Board-Meeting-Notice-30.05.2025.pdf",
  },
  {
    title: "BM Notice — April 30, 2025 (Revised)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/BM-Notice-30.04.2025-revised-sd.pdf",
  },
];

/** Real general meeting notices/outcomes, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const GENERAL_MEETING_NOTICES: AnnualReport[] = [
  {
    title: "Corrigendum to the Annual Report for FY 2024-25 and Notice of the 30th AGM",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/Corrigendum-Annual-Report-for-FY-2024-25-and-Notice-of-the-30th-Annual-General-Meeting-AGM.pdf",
  },
  {
    title: "Disclosure of Voting Results and Consolidated Scrutinizer's Report of the 30th AGM",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/Disclosure-of-Voting-Results-and-Consolidated-Scrutinizers-Report-of-the-30th-Annual-General-Meeting-AGM.pdf",
  },
  {
    title: "Outcome/Proceedings of the 30th Annual General Meeting for F.Y. 2024-25",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/OutcomeProceedings-of-30th-Annual-General-Meeting-for-F.Y.-2024-25.pdf",
  },
  {
    title: "Notice of the 30th Annual General Meeting",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/NOTICE-OF-30TH-ANNUAL-GENERAL-MEETING.pdf",
  },
  {
    title: "Intimation of Record Date of the 30th Annual General Meeting",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/Intimation-of-Record-date-of-30th-Annual-General-Meeting-of-the-Logica-Infoway-Limited.pdf",
  },
  {
    title: "Intimation of Date of the 30th Annual General Meeting",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Intimation-of-date-of-30th-Annual-General-Meeting-of-the-Logica-Infoway-Limited.pdf",
  },
  {
    title: "Board Meeting Intimation for Approval of Notice Convening the AGM and Other Incidental Matters",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Board-Meeting-Intimation-for-Approval-Of-Notice-Convening-Annual-General-Meeting-And-Other-Incidental-AGM-Matters-Along-With-Other-Business-Items.pdf",
  },
  {
    title: "28th AGM Transcript",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/08/28TH-AGM-Transcript.pdf",
  },
  {
    title: "Revised Proceedings of the First EGM 2024-25",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/Revised-Proceding-of-First-EGM-2024-25.pdf",
  },
  {
    title: "Postal Ballot — Outcome of EGM",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/Shareholder-Meeting-Postal-Ballot-Outcome-of-EGM.pdf",
  },
  {
    title: "Proceedings of the 1st Extra-Ordinary General Meeting (EGM) of 2024-25",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/proceedings-of-1st-Extra-Ordinary-General-Meeting-EGM-of-2024-25.pdf",
  },
  {
    title: "Corrigendum to EGM Notice — February 6, 2025",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/corrigendum-EGM-notice-06.02-2025.pdf",
  },
  {
    title: "EGM Notice — February 6, 2025",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/EGM-NOTICE-06-02-2025.pdf",
  },
  {
    title: "AGM Notice 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/07/AGM-NOTICE.pdf",
  },
  {
    title: "EGM Notice — July 8, 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/07/EGM-NOTICE-1.pdf",
  },
  {
    title: "Proceedings of EGM — February 13, 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/02/proceeding-of-EGM.pdf",
  },
  {
    title: "Regulation 44 Voting Result",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/02/reg-44-voting-result.pdf",
  },
  {
    title: "EGM Record Date — February 8, 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/02/record-date.pdf",
  },
  {
    title: "AGM Notice 2023",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/07/AGM-NOTICE-2023.pdf",
  },
];

/** Real financial results, mirrored from logicainfoway.com/financial-results. */
export const FINANCIAL_RESULTS: AnnualReport[] = [
  {
    title: "Board Meeting Outcome — Financial Results for Half Year and Year Ended 31-03-2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/1.-Board-Meeting-Outcome-for-Financial-Results-For-The-Half-Year-Ended-And-The-Year-Ended-March-31-2026.pdf",
  },
  {
    title: "Financial Results for Half Year and Financial Year Ended 31-03-2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/2.-Financial-Results-For-Half-Year-And-Financial-Year-Ended-March-31-2026.pdf",
  },
  {
    title: "Financial Result for the Half Year and Year Ended 30-09-2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Financial-Result-for-the-half-year-and-year-ended-14-09-2025.pdf",
  },
  {
    title: "Revised Financial Results for Half Year and Year Ended 31-03-2025",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Revised-Financial-Results-For-Half-Year-And-Year-Ended-March-31-2025._compressed.pdf",
  },
  {
    title: "Unaudited Financial Result for the Half Year and Year Ended 30-09-2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Financial-Result-for-the-half-year-ended-30th-September-2024.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/SECRETARIAL-AUDIT-REPORT-MR3-signed.pdf",
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

/** Real committee meeting notices, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const COMMITTEE_MEETING_NOTICES: AnnualReport[] = [
  {
    title: "Notice and Agenda — Audit Committee Meeting, November 14, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Notice-and-Agenda-Audit-Committee-Meeting-14.11.2024.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 5",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Audit-Committee-Meeting-Notice-5.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 4",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/11/Audit-Committee-Meeting-Notice-4.pdf",
  },
  {
    title: "Audit Committee Meeting Notice — 3",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/09/Audit-Committee-Meeting-Notice-3.pdf",
  },
  {
    title: "Notice of 1st Meeting, Financial Year 2023-24 of Audit Committee",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-1st-Meeting-Financial-Year-2023-24-of-Audit-Committee.pdf",
  },
  {
    title: "Independent Director Meeting Notice — 1",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Independent-Director-Meeting-Notice-1.pdf",
  },
  {
    title: "Nomination & Remuneration Committee Meeting Notice",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/NRC-1.pdf",
  },
];

/** Real corporate policy documents, mirrored from logicainfoway.com/policies. */
export const POLICIES: AnnualReport[] = [
  {
    title: "Related Party Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Related-Party-Policy.pdf",
  },
  {
    title: "CSR Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/08/CSR-POLICY.pdf",
  },
  {
    title: "CSR Projects",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/CSR-PROJECTS-_20250827_0002-1.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Familiarization-Program-for-Independent-Directors.pdf",
  },
  {
    title: "Internal Procedures and Conduct for Prevention of Insider Trading",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Annexure-E-Revised-Policy-on-Internal-Procedures-Conduct-for-Prevention-of-Insider-Trading-signed.pdf",
  },
  {
    title: "Materiality Policy for Identification of Group Companies",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Materiality-Policy-for-Identification-of-Group-Companies.pdf",
  },
  {
    title: "Nomination and Remuneration Policy",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Nomination-and-Remuneration-Policy.pdf",
  },
  {
    title: "Policy for Archival of Documents",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-for-Archival-of-Documents.pdf",
  },
  {
    title: "Policy on Disclosure of Material Events/Information",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/policy-on-disclosure-of-material-event.pdf",
  },
  {
    title: "Policy on Diversity on Board",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Diversity-on-Board.pdf",
  },
  {
    title: "Policy on Identification of Material Creditors and Material Litigations",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Identification-of-Material-Creditors-and-Material-Litigations.pdf",
  },
  {
    title: "Policy on Prevention of Sexual Harassment at Workplace",
    year: "",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Prevention-of-Sexual-Harrasment-at-Workplace.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/07/Shareholding-Pattern-for-FY-ended-31-03-2026.pdf",
  },
  {
    title: "Shareholding Pattern for HY ended 30-09-2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/Shareholding-Pattern-30.09.2025-signed.pdf",
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

/** Real fund raising disclosures, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const FUND_RAISING_NOTICES: AnnualReport[] = [
  {
    title: "Statement of Deviation or Variation in Utilization of Funds — Half Year Ended September 30, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Statement-Of-Deviation-Or-Variation-In-Utilization-Of-Funds-For-The-Half-Year-Ended-September-30-2025.pdf",
  },
  {
    title: "Statement of Deviation/Variation — Half Year Ended March 31, 2025 (Preferential Issue, March 1, 2025)",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Statement-of-DeviationVariation-for-half-year-ended-March-31-2025-pertaining-to-funds-raised-under-Preferential-Issue-on-March-01-2025.-investor.pdf",
  },
  {
    title: "Intimation Regarding Trading Approval Received for Equity Shares Issued on Preferential Basis",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Intimation-Regarding-Trading-Approval-Received-For-693600-Equity-Shares-Issued-On-Preferential-Basis-Disclosure-Of-Material-Updates-Under-Reg.-30.pdf",
  },
  {
    title: "Outcome of Board Meeting — Allotment of Equity Shares on Preferential Basis and Other Matters",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/03/Outcome-of-Board-Meeting-dated-01-03-2025.pdf",
  },
  {
    title: "In-Principle Approval Granted by Stock Exchange for Issuance of Preference Shares",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/04/IN-PRINCIPLE-APPROVAL-GRANTED-BY-STOCK-EXCHANGE-FOR-ISSUANCE-OF-PREFERENCE-SHARES.pdf",
  },
  {
    title: "Announcement under Regulation 30 (LODR) — Preferential Issue",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Announcement-under-Regulation-30-LODR-Preferential-Issue.pdf",
  },
  {
    title: "Increase in Authorised Capital of the Company",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Increase-In-Authorised-Capital-Of-The-Company.pdf",
  },
  {
    title: "Valuation Report",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/LIL-Valuation-Report-Signed.pdf",
  },
  {
    title: "ELIL Prospectus (Final)",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/12/ELIL-Prospectus-RA20221228-Final_compressed.pdf",
  },
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Submission-Of-Management-Discussion-Analysis-H2-FY26-FY26.pdf",
  },
  {
    title: "Non-Applicability of Annual Secretarial Compliance Report (Regulation 24A) — Year Ended March 31, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Non-applicability-of-Annual-Secretarial-Compliance-Report-under-Regulation-24A-of-the-SEBI-Listing-Obligations-and-Disclosure-Requirements-Regulations-2015-for-the-year-ended-March-31-2026.pdf",
  },
  {
    title: "Intimation of Non-Applicability of Large Corporate (LC) Disclosure — Year Ended March 31, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Intimation-for-Non-applicability-of-Large-Corporate-LC-disclosure-for-the-year-ended-March31-2026.pdf",
  },
  {
    title: "Certificate under Regulation 74(5) of SEBI (DP) Regulations — Quarter Ended March 31, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Certificate-under-Regulation-745-of-SEBI-Depositories-and-Participants-Regulations-2018-for-quarter-ended-March-31-2026.pdf",
  },
  {
    title: "Certificate under Regulation 74(5) of SEBI (DP) Regulations — Quarter Ended December 31, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/01/Certificate-under-Regulation-745-of-SEBI-DP-Regulations-2018-for-quarter-ended-31st-December-2025.pdf",
  },
  {
    title: "Compliance under Regulation 57(4) SEBI (LODR) — Quarter Ended December 30, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/01/Compliance-as-per-Regulation-574-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-ended-30th-December-2028.pdf",
  },
  {
    title: "Compliance under Regulation 57(5) SEBI (LODR) — Quarter Ended December 31, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/01/Compliance-as-per-Regulation-575-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-ended-December-31-2025.pdf",
  },
  {
    title: "Compliance under Regulation 57(5) SEBI (LODR) — Quarter Ended September 30, 2025 (Non-Applicability)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/Compliance-as-per-Regulation-575-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-ended-30th-September-2025-–-Non-Applicability.pdf",
  },
  {
    title: "Statement of Deviation or Variation in Utilization of Funds — Half Year Ended March 31, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/3.-Statement-Of-Deviation-Or-Variation-In-Utilization-Of-Funds-For-The-Half-Year-Ended-March-31-2026.pdf",
  },
  {
    title: "Clarification on Display of \"Rights Issue of Equity Shares with Warrants\" under Board Meetings Section",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/12/Clarification-On-Display-Of-Right-Issue-Of-Equity-Shares-With-Warrants-Under-The-Board-Meetings-Section.pdf",
  },
  {
    title: "Announcement under Regulation 30 (LODR) — Change in Management",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/4.-Announcement-under-Regulation-30-LODR-Change-in-Management.pdf",
  },
  {
    title: "Revised Intimation of Resignation — Chief Operating Officer (North) & KMP (Regulation 30)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Revised-Intimation-of-Resignation-of-Chief-Operating-Officer-North-and-Key-Managerial-Personnel-of-the-Company-pursuant-to-Regulation-30-of-SEBI-Listing-Obligations-and-Disclosure-Requir.pdf",
  },
  {
    title: "Outcome of Analyst/Institutional Investor Meeting (SEBI LODR Regulations, 2015)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Outcome-of-AnalystInstitutional-Investor-Meeting-under-the-SEBI-Listing-Obligations-and-Disclosure-Requirements-Regulations-2015.pdf",
  },
  {
    title: "Regulation 30 (LODR) — Participation in Arihant Capital Bharat Connect Virtual Conference, March 11, 2026",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Regulation-30-of-SEBI-LODR-Regulations-2015-Intimation-of-Participation-in-Arihant-Capital-Bharat-Connect-Virtual-Conference-Rising-Star-2026-March-11-2026.pdf",
  },
  {
    title: "Intimation Regarding Closure of Trading Window",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/01/closure-of-trading-window.pdf",
  },
  {
    title: "Trading Window Closure Notice",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Intimation-regarding-Closure-of-Trading-Window.pdf",
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
