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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Annual-Return-2024-25.pdf",
  },
  {
    title: "Annual Return 2023-24",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Annual-Return-2023-24-2.pdf",
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

/** Real board meeting notice periods, mirrored from
 *  logicainfoway.com/notice-of-board-meeting. */
export const BOARD_MEETING_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027-3-4/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026-11" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/board-meeting-2/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/01-04-2023-to-31-03-2024-2/" },
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Revised-Financial-Results-For-Half-Year-And-Year-Ended-March-31-2025._compressed-2.pdf",
  },
  {
    title: "Unaudited Financial Result for the Half Year and Year Ended 30-09-2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Financial-Result-for-the-half-year-ended-30th-September-2024.pdf",
  },
  {
    title: "Financial Results for Half Year and Year Ended 31-03-2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/31-03-2024-Outcome-of-Board-Meeting-Dated-30-05-2024.pdf",
  },
  {
    title: "Unaudited Financial Results for the Half Year Ended 30-09-2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/12/HALF-YEARLY-RESULT-SEPTEMBER-2023.pdf",
  },
  {
    title: "Financial Results for the Half Year and Year Ended 31-03-2023",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/06/FR.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Revised-Related-Party-Policy-signed.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Annexure-E-Revised-Policy-on-Internal-Procedures-Conduct-for-Prevention-of-Insider-Trading-signed.pdf",
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
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/07/Shareholding-Pattern-for-FY-ended-31-03-2026-1.pdf",
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

/** Real corporate announcement periods, mirrored from logicainfoway.com/compliances. */
export const CORPORATE_ANNOUNCEMENT_PERIODS: FiscalYearFolder[] = [
  { label: "01-04-2026 to 31-03-2027", url: "https://www.logicainfoway.com/01-04-2026-to-31-03-2027/" },
  { label: "01-04-2025 to 31-03-2026", url: "https://www.logicainfoway.com/01-04-2025-to-31-03-2026-9/" },
  { label: "01-04-2024 to 31-03-2025", url: "https://www.logicainfoway.com/01-04-2024-to-31-03-2025/" },
  { label: "01-04-2023 to 31-03-2024", url: "https://www.logicainfoway.com/compliances-01-04-2023-to-31-03-2024/" },
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
