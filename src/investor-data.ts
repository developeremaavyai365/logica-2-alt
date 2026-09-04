/** Real annual reports, mirrored from logicainfoway.com/annual-report.
 *  PDFs are linked to the source site directly rather than re-hosted. */

export interface AnnualReport {
  title: string;
  year: string;
  url: string;
  /** false for the handful of documents confirmed absent from the source
   *  site's full backup/database — rendered as "Document unavailable"
   *  instead of a dead link. Omitted (defaults to available) everywhere else. */
  available?: boolean;
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
    // Supplied by the company from its own records. FY2021-22 predates the
    // December 2022 listing, so this was never filed with BSE and is not in
    // the cPanel backup; it previously pointed at the Prospectus as the only
    // published source of these figures. Contents verified: independent
    // auditor's report plus balance sheet, profit and loss, and notes for the
    // year ended 31 March 2022.
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
  {
    title: "30th AGM Notice with Annual Report FY 2024-25",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/30TH-AGM-NOTICE-ANNUAL-REPORT-FY-202425.pdf",
  },
  {
    title: "Corrigendum to the Annual Report FY 2024-25 (with Material Update)",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/09/Corrigendum-To-The-Annual-Report-For-FY-2024-25-And-Notice-Of-The-30Th-Annual-General-Meeting-AGM-Material-Update.pdf",
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
    // Regulation 30 outcome of the 01.09.2026 meeting: took note of the
    // Secretarial Audit Report for FY26, reappointment of Mrs. Shweta Goel as
    // Whole-time Director, revised remuneration for the MD and WTD, CSR
    // implementing agency, renewal of material RPT limits, the MDA report and
    // Directors' Report for FY26, and convening the 31st AGM for 30.09.2026.
    // The AGM notice itself is a separate filing "in due course" per this
    // document, so it is not listed as a General Meeting notice yet.
    title: "Outcome of Board Meeting — September 1, 2026",
    year: "2026-27",
    url: "/investor/board-meetings/outcome-of-board-meeting-01-09-2026.pdf",
  },
  {
    // Original outcome of the 14.01.2025 meeting; only the later revised
    // filing was listed.
    title: "Outcome of Board Meeting — January 14, 2025",
    year: "2024-25",
    url: "/investor/board-meetings/outcome-of-board-meeting-14-01-2025.pdf",
  },
  {
    title: "Outcome of Board Meeting — November 14, 2025",
    year: "2025-26",
    url: "/investor/board-meetings/outcome-of-board-meeting-14-11-2025.pdf",
  },
  // Board meeting outcomes that were only listed in the section matching
  // their subject. Cross-listed here so the Board Meeting page shows an
  // outcome against every meeting, as an investor would expect.
  {
    title: "Outcome of Board Meeting — November 14, 2023",
    year: "2023-24",
    url: "/investor/financial-results/approval-of-half-yearly-result-as-on-30th-september-2023.pdf",
  },
  {
    // 5th meeting of FY2023-24. The outcome was already on the server, but
    // only under Corporate Announcements as "reg-30.pdf" — the same file byte
    // for byte. It states the Board "in its meeting held on 13th December
    // 2023" approved the change of name. Cross-listed, not re-uploaded.
    title: "Outcome of Board Meeting — 5th Meeting (FY 2023-24), December 13, 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/12/reg-30.pdf",
  },
  {
    // 6th meeting of FY2023-24. Recovered from the company's own BSE filing
    // of 17.01.2024, category "Board Meeting / Outcome of Board Meeting".
    // Header: "Outcome of Board Meeting ... -17th January 2024"; the body
    // records the name change, the increase in authorised capital and the
    // 5:1 bonus issue. Was not published on the site at all.
    title: "Outcome of Board Meeting — 6th Meeting (FY 2023-24), January 17, 2024",
    year: "2023-24",
    url: "/investor/board-meetings/outcome-of-board-meeting-17-01-2024.pdf",
  },
  {
    title: "Outcome of Board Meeting — March 1, 2025 (Allotment on Preferential Basis)",
    year: "2024-25",
    url: "/investor/fund-raising/outcome-board-meeting-allotment-preferential-basis-01-03-2025.pdf",
  },
  {
    title: "Outcome of Board Meeting — May 30, 2025",
    year: "2025-26",
    url: "/investor/financial-results/outcome-of-board-meeting-held-on-30-05-2025-for-approval-of-f-s-for-half-year-f-y-ended-march-31-2025.pdf",
  },
  {
    title: "Outcome of Board Meeting — May 12, 2026",
    year: "2026-27",
    url: "/investor/financial-results/board-meeting-outcome-financial-results-31-03-2026.pdf",
  },
  {
    title: "Prior Intimation of Board Meeting — January 14, 2025 (Regulation 29(1)(d))",
    year: "2024-25",
    url: "/investor/board-meetings/prior-intimation-board-meeting-14-01-2025.pdf",
  },
  {
    title: "Outcome of Board Meeting — July 18, 2023",
    year: "2023-24",
    url: "/investor/board-meetings/outcome-of-board-meeting-18-07-2023.pdf",
  },
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
    year: "2026-27",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Board-Meeting-Notice-12-05-2026.pdf",
  },
  {
    title: "Board Meeting Notice — May 12, 2026 (Agenda)",
    year: "2026-27",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/07/BM-Notice-12.05.2026.pdf",
  },
  {
    title: "Board Meeting Notice — November 14, 2025 (Agenda)",
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
    title: "Board Meeting Notice — April 30, 2025 (Revised Shorter Notice)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/BM-Notice-30.04.2025-revised-sd.pdf",
  },
  {
    title: "Outcome of Board Meeting — May 30, 2024 (Results for Year Ended March 31, 2024)",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/31-03-2024-Outcome-of-Board-Meeting-Dated-30-05-2024.pdf",
  },
  {
    title: "Board Meeting Notice — 1st Meeting (FY 2023-24)",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/BM-1.pdf",
  },
  {
    // Date read off the notice itself, which sets the meeting for "Friday
    // 16th June, 2023" — matching the 4th to 7th, which already carry dates.
    title: "Board Meeting Notice — 2nd Meeting (FY 2023-24), June 16, 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/06/BM-2.pdf",
  },
  {
    title: "Board Meeting Notice — 3rd Meeting (FY 2023-24)",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/BM-3.pdf",
  },
  {
    title: "Board Meeting Notice — 5th Meeting (FY 2023-24), December 13, 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/12/BM-5.pdf",
  },
  {
    title: "Board Meeting Notice — 6th Meeting (FY 2023-24), January 17, 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/01/BM-6.pdf",
  },
  {
    title: "Board Meeting Notice — March 1, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/BM-Notice-01.03.2025.pdf",
  },
  {
    title: "Board Meeting Notice — January 14, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/BM-Notice-14.01.2025.pdf",
  },
  {
    title: "Board Meeting Notice — August 29, 2025 (Agenda)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/BM-Notice-29.08.2025.pdf",
  },
  {
    title: "Board Meeting Notice — April 30, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/03/Board-Meeting-Notice-30.04.2025.pdf",
  },
  {
    title: "Board Meeting Notice — 4th Meeting (FY 2023-24), November 6, 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/11/Board-Meeting-Notice-4.pdf",
  },
  {
    title: "Board Meeting Notice — November 14, 2024 (Agenda)",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Notice-and-Agenda-Board-Meeting-14.11.2024.pdf",
  },
  {
    title: "Board Meeting Notice — 7th Meeting (FY 2023-24), February 20, 2024",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/08/Notice-for-Board-Meeting-7.pdf",
  },
  {
    title: "Board Meeting Notice — 2nd Meeting (FY 2024-25), July 15, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Notice-of-Board-Meeting-dated-15-07-2024.pdf",
  },
  {
    title: "Board Meeting Notice — 3rd Meeting (FY 2024-25), September 21, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Notice-of-Board-Meeting-dated-21-09-2024.pdf",
  },
  {
    title: "Board Meeting Notice — May 30, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-Board-Meeting-dated-30-05-2024.pdf",
  },
  {
    title: "Outcome of Board Meeting — July 15, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/NOTICE-OF-THE-BOARD-MEETING-DATED-15-07-2024.pdf",
  },
  {
    title: "Outcome of Board Meeting — September 21, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/NOTICE-OF-THE-BOARD-MEETING-DATED-21-09-2024.pdf",
  },
  {
    title: "Outcome of Board Meeting — November 14, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Outcome-of-Board-Meeting-dated-14-11-2024-1.pdf",
  },
  {
    title: "Outcome of Board Meeting — February 27, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/06/Outcome-of-Board-Meeting-Dated-27-02-2024.pdf",
  },
  {
    title: "Outcome of Board Meeting — April 30, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Outcome-of-Board-Meeting-of-Logica-Infoway-Limited-held-on-April-30-2025.pdf",
  },
  {
    // Subject line: "Outcome of Board Meeting of Eastern Logica Infoway
    // Limited - 30th May 2023". It was listed with no date at all.
    title: "Outcome of Board Meeting — May 30, 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/OUTCOME-OF-MEETING.pdf",
  },
  {
    title: "Outcome of Board Meeting — August 29, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Outcome-of-the-Board-Meeting-held-on-Friday-August-29-2025-1.pdf",
  },
  {
    title: "Revised Outcome of Board Meeting — January 14, 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Revised-Outcome-Of-Board-Meeting-Held-On-14.01.2025.pdf",
  },
  {
    title: "Appointment of Internal Auditor for FY 2025-26 and Secretarial Auditor for FY 2025-26 to 2029-30",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Appointment-of-Internal-Auditor-for-FY-2025-26-Secretarial-Auditor-for-FY-2025-26-to-2029-30.pdf",
  },
];

/** Real general meeting notices/outcomes, newest first — replaces the old
 *  dead-link "period folder" list now that we have the actual filed
 *  documents. */
export const GENERAL_MEETING_NOTICES: AnnualReport[] = [
  {
    // Regulation 34(1) submission carrying the 29th AGM notice and the
    // FY2023-24 annual report.
    title: "Notice of the 29th Annual General Meeting with Annual Report FY 2023-24",
    year: "2024-25",
    url: "/investor/general-meetings/agm-notice-29th-2024.pdf",
  },
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
    title: "Voting Result (Regulation 44)",
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
  {
    title: "29th AGM Transcript",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/29th-AGM-Transcript.pdf",
  },
  {
    title: "AGM Notice 2021 22 General Notice",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/AGM-Notice-2021-22-General-Notice.pdf",
  },
  {
    title: "Notice of Extraordinary General Meeting (FY 2023-24)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/01/EGM-NOTICE.pdf",
  },
  {
    title: "General Meeting",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/01/General-Meeting.pdf",
  },
  {
    title: "Scrutinizer Report",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/09/SCRUTINIZER-REPORT.pdf",
  },
  {
    title: "Scrutinizers Report of 29th AGM",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Scrutinizers-Report-of-29th-AGM.pdf",
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
    // The audited results for the year ended 31-03-2024 are enclosed in the
    // 30-05-2024 board outcome, which is the document BSE holds for this
    // filing (verified byte-identical to the BSE attachment). Same
    // cross-listing as the 14-11-2024 outcome below.
    title: "Financial Results for Half Year and Year Ended 31-03-2024",
    year: "2023-24",
    url: "/investor/board-meetings/31-03-2024-outcome-of-board-meeting-dated-30-05-2024.pdf",
  },
  {
    title: "Financial Results for the Half Year and Year Ended 31-03-2023",
    year: "2022-23",
    url: "/investor/financial-results/financial-results-31-03-2023.pdf",
  },
  {
    title: "Approval of Half Yearly Result as on 30th September 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/11/Approval-of-Half-yearly-result-as-on-30th-September-2023.pdf",
  },
  {
    title: "Board Meeting Financial Result 2021 22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/Board-Meeting-Financial-Result-2021-22.pdf",
  },
  {
    title: "Financial Result",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/Financial-Result.pdf",
  },
  {
    title: "Financial Results for Half Year FY Ended March 31 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Financial-Results-for-half-year-F.Y.-ended-March-31-2025.pdf",
  },
  {
    title: "Half Yearly Result September 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/12/HALF-YEARLY-RESULT-SEPTEMBER-2023.pdf",
  },
  {
    title: "Integrated Governance Report Quarter Ended Dec 31 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Integrated-Governance-Report-Quarter-Ended-Dec-31-2024.pdf",
  },
  {
    title: "Investor Presentation for Fr 3009 2024 Compressed",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/Investor-Presentation-for-FR-30092024_compressed.pdf",
  },
  {
    title: "Outcome of Board Meeting Held on 30.05.2025 for Approval of FS for Half Year FY Ended March 31 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Outcome-of-Board-Meeting-held-on-30.05.2025-for-approval-of-F.S.-for-half-year-F.Y.-ended-March-31-2025.pdf",
  },
  {
    title: "Revised Financial Results for Half Year and Year Ended March 31 2025. Compressed 2",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Revised-Financial-Results-For-Half-Year-And-Year-Ended-March-31-2025._compressed-2.pdf",
  },
  {
    title: "Submission of Management Discussion Analysis Report on Unaudited Financial Results for Half Year Ended September 30 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Submission-Of-Management-Discussion-Analysis-Report-On-Unaudited-Financial-Results-For-Half-Year-Ended-September-30-2025.pdf",
  },
  {
    title: "Audit Report FY 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/AUDIT-REPORT-ELIL_MERGED-FY-2021-22.pdf",
  },
  {
    title: "Report of the Directors FY 2019-20",
    year: "2019-20",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/REPORT-OF-THE-DIRECTORS-FOR-THE-FINANCIAL-YEAR-2019-20.pdf",
  },
  {
    title: "Report of the Directors FY 2020-21",
    year: "2020-21",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/08/REPORT-OF-THE-DIRECTORS-FOR-THE-FINANCIAL-YEAR-2020-21.pdf",
  },
];

/** Real secretarial audit reports, mirrored from
 *  logicainfoway.com/secretarial-compliance. */
export const SECRETARIAL_COMPLIANCE: AnnualReport[] = [
  {
    title: "Non-Applicability of Annual Secretarial Compliance Report (Regulation 24A) — Year Ended March 31, 2025",
    year: "2024-25",
    url: "/investor/compliance-disclosures/non-applicability-of-annual-secretarial-compliance-report-under-regulation-24a-of-the-sebi-listing-obligations-and-disclosure-requirements-regulations-2015-for-the-year-ended-31st-march-2025.pdf",
  },
  {
    title: "Non-Applicability of Annual Secretarial Compliance Report (Regulation 24A) — Year Ended March 31, 2026",
    year: "2025-26",
    url: "/investor/compliance/reg-24a-secretarial-compliance-non-applicability-fy26.pdf",
  },
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
  {
    title: "AC Meeting Notice 03.03.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/AC-Meeting-Notice-03.03.2025.pdf",
  },
  {
    title: "AC Meeting Notice 29.08.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/AC-Meeting-Notice-29.08.2025.pdf",
  },
  {
    title: "Audit Committee Meeting Notice 02.08.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Audit-Committee-Meeting-Notice-02.08.2025.pdf",
  },
  {
    title: "Audit Committee Meeting Notice 1",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Audit-committee-meeting-notice-1.pdf",
  },
  {
    title: "Audit Committee Meeting Notice 30.04.2025 Sd",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Audit-Committee-Meeting-Notice-30.04.2025-sd.pdf",
  },
  {
    title: "Audit Committee Meeting Notice 30.05.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Audit-Committee-Meeting-Notice-30.05.2025.pdf",
  },
  {
    title: "CSR Meeting Notice 29.08.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/CSR-Meeting-Notice-29.08.2025.pdf",
  },
  {
    title: "ID Meeting Notice 27.03.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/ID-Meeting-Notice-27.03.2025.pdf",
  },
  {
    title: "Notice of 2nd Meeting Financial Year 2023 24 of Audit Committee",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-2nd-Meeting-Financial-Year-2023-24-of-Audit-Committee.pdf",
  },
  {
    title: "Notice of Audit Committee Meeting Dated 21 09 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-Audit-Committee-Meeting-dated-21-09-2024.pdf",
  },
  {
    title: "Notice of CSR Committee Meeting Dated 15 07 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-CSR-Committee-Meeting-dated-15-07-2024.pdf",
  },
  {
    title: "Notice of NRC Meeting Dated 15 07 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-NRC-Meeting-dated-15-07-2024.pdf",
  },
  {
    title: "Notice of NRC Meeting Dated 21 09 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Notice-of-NRC-Meeting-dated-21-09-2024.pdf",
  },
  {
    title: "NRC Committee Meeting Notice 30.04.2025 Revised Sd",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/NRC-Committee-Meeting-Notice-30.04.2025-revised-sd.pdf",
  },
  {
    title: "NRC Meeting Notice 28.03.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/NRC-Meeting-Notice-28.03.2025.pdf",
  },
  {
    title: "NRC Meeting Notice 29.08.2025s",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/NRC-Meeting-Notice-29.08.2025s.pdf",
  },
  {
    title: "SRC Meeting Notice 24.12.2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/SRC-Meeting-Notice-24.12.2024.pdf",
  },
  {
    title: "SRC Meeting Notice Stakeholder Relationship Committee30.05.2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/SRC-Meeting-Notice-Stakeholder-Relationship-Committee30.05.2025.pdf",
  },
];

/** Real corporate policy documents, mirrored from logicainfoway.com/policies. */
export const POLICIES: AnnualReport[] = [
  // Both files already lived in public/investor/policies/ but were listed
  // under Corporate Announcement. Contents verified: "POLICY FOR
  // DETERMINATION OF MATERIAL EVENT AND DISCLOSURE", framed under Regulation
  // 30 — a policy, so it belongs here. The first is the clean text copy, the
  // second the scanned copy on company letterhead.
  {
    title: "Policy for Determination of Material Event and Disclosure",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-for-Determination-of-Material-Events-and-Disclosure.pdf",
  },
  {
    title: "Policy for Determination of Material Event and Disclosure (Signed Copy)",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-for-Determination-of-Material-Events-and-Disclosure-1.pdf",
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
    title: "Code of Internal Procedures and Conduct for Prevention of Insider Trading (Revised 2026)",
    year: "2026",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/04/Annexure-E-Revised-Policy-on-Internal-Procedures-Conduct-for-Prevention-of-Insider-Trading-signed.pdf",
  },
  {
    // The pre-revision code, in the backup's uploads but not linked from the
    // old site's Policies page. Dated in both titles so it is clear which one
    // is in force.
    title: "Code of Internal Procedures and Conduct for Prevention of Insider Trading (2022)",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Internal-Procedures-and-Conduct-for-Prevention-of-Insider-Trading.pdf",
  },
  // Two copies of the same policy, identical on their first and last pages.
  // The 9-page one carries a text layer throughout, so it is searchable and
  // listed first; the 12-page copy the company published on its own Policies
  // page is a scan whose middle pages hold no selectable text, and is kept
  // alongside it rather than dropped.
  {
    title: "Policy on Disclosure of Material Events/Information",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/Policy-on-Disclosure-of-Material-EventsInformation.pdf",
  },
  {
    title: "Policy on Disclosure of Material Events/Information (Scanned Copy)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/policy-on-disclosure-of-material-event.pdf",
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
  {
    title: "Familiarization Program for Independent Directors",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Familiarization-Program-for-Independent-Directors-1.pdf",
  },
  {
    title: "Familiarization Program",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/Familiarization-Program.pdf",
  },
  {
    title: "Materiality Policy for Identification of Group Companies",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Materiality-Policy-for-Identification-of-Group-Companies-1.pdf",
  },
  {
    title: "Nomination and Remuneration Policy",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Nomination-and-Remuneration-Policy-1.pdf",
  },
  {
    title: "Policy for Archival of Documents",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-for-Archival-of-Documents-1.pdf",
  },
  {
    title: "Policy on Diversity on Board",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Diversity-on-Board-1.pdf",
  },
  {
    title: "Policy on Identification of Material Creditors and Material Litigation",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/09/Policy-on-Identification-of-Material-Creditors-and-Material-Litigation.pdf",
  },
  {
    title: "Related Party Policy (Revised)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/05/Revised-Related-Party-Policy-signed.pdf",
  },
  {
    title: "Identification of Material Creditors and Material Litigation",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/01/Identification-of-Material-Creditors-and-Material-litigation.pdf",
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
  {
    title: "Post Bonus Issue Shareholding Pattern",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Post-Bonus-Issue-Shareholding-Pattern.pdf",
  },
  {
    title: "Post Issue Sh Pattern",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/03/POST-ISSUE-SH-PATTERN.pdf",
  },
  {
    title: "Pre Bonus Issue Shareholding Pattern",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Pre-Bonus-Issue-Shareholding-Pattern.pdf",
  },
  {
    title: "Shareholding Pattern as on 30 09 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Shareholding-Pattern-as-on-30-09-2023.pdf",
  },
  {
    title: "Shareholding Pattern for HY Ended 30 September 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/Shareholding-pattern-for-HY-ended-30-September-2024.pdf",
  },
  {
    title: "Shareholding Pattern",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/SHAREHOLDING-PATTERN.pdf",
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
    title: "In-Principle Approval from BSE for Issue of Bonus Shares — Regulation 28(1)",
    year: "2023-24",
    url: "/investor/fund-raising/in-principle-approval-bonus-issue-2024.pdf",
  },
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
    title: "Final ELIL Draft Prospectus",
    year: "2022",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/Final-ELIL-Draft-Prospectus.pdf",
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
    // Regulation 44 intimation, filed 04.09.2026. The date is carried in the
    // title because that is what the section sorts on — without it this would
    // fall back to mid-financial-year and sit below the 01-09-2026 outcome
    // instead of above it.
    title: "Intimation Regarding Revision in the Cut-Off Date for the 31st Annual General Meeting — September 4, 2026",
    year: "2026-27",
    url: "/investor/compliance-disclosures/intimation-revision-in-cut-off-date-31st-agm-04-09-2026.pdf",
  },
  {
    // Same Regulation 30 filing cross-listed from Board Meeting — see the
    // note there for what it covers. Cross-listed rather than re-uploaded,
    // same file.
    title: "Outcome of Board Meeting — September 1, 2026",
    year: "2026-27",
    url: "/investor/board-meetings/outcome-of-board-meeting-01-09-2026.pdf",
  },
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
    url: "/investor/compliance/reg-57-5-compliance-q-sep-2025.pdf",
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
    title: "Participation in Arihant Capital Bharat Connect Virtual Conference — March 11, 2026 (Regulation 30)",
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
  {
    title: "Intimation of Closure of Trading Window — Half Year Ended September 30, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/1.-Intimation-of-Closure-of-trading-window-for-HY-ended-30-September-2024.pdf",
  },
  {
    title: "Non-Applicability Declaration (Regulation 57(4))",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/2.-Compliance-under-Reg.-574-Non-Applicability.pdf",
  },
  {
    title: "Non-Applicability Declaration (Regulation 57(5))",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/3.-Reg-575-Non-Applicability.pdf",
  },
  {
    title: "Disclosure under the Depositories and Participants Regulations (Regulation 74(5))",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/4.-Disclosure-under-Reg-745-of-the-DP.pdf",
  },
  {
    title: "Structured Digital Database Compliance Certificate — Quarter Ended September 30, 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/5.-SDD-Compliance-Certificate-for-quarter-ended-30-September-2024.pdf",
  },
  {
    title: "Non-Applicability of Related Party Transaction Disclosure (Regulation 23(9))",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/6.-Reg-239-Non-Applicability-of-RPT-Disclosure.pdf",
  },
  {
    title: "Intimation Regarding Change in Website Link (Regulation 46)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/7.-Reg-46-Intimation-regarding-change-in-Website-link.pdf",
  },
  {
    title: "Non-Applicability of Corporate Governance Report (Regulation 27)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/8.-Reg-27-Non-applicability-of-CG.pdf",
  },
  {
    title: "Intimation of Allotment under Regulation 30 — February 27, 2024",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/02/ALLOTMENT-REG-30.pdf",
  },
  {
    title: "Annexure Iv PCS Certificate for Compliance",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Annexure-IV-PCS-certificate-for-Compliance.pdf",
  },
  {
    title: "Annexure V Certificate for Pricing",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Annexure-V-Certificate-for-pricing.pdf",
  },
  {
    title: "Announcement Regarding Submission of PCS Certificate under REG 163(2) of SEBI ICDR Regulations 2018 to Be Ratify in the Ensuing AGM",
    year: "2018-19",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Announcement-regarding-submission-of-PCS-Certificate-under-Reg.-1632-Of-SEBI-ICDR-Regulations-2018-to-be-ratify-in-the-ensuing-AGM.pdf",
  },
  {
    title: "Announcement under Regulation 30 Disclosure of Material Updates",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/04/Announcement-Under-Regulation-30-Disclosure-Of-Material-Updates.pdf",
  },
  {
    title: "Announcement under Regulation 30 LODR Amendments to Memorandum Articles of Association Corporate",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/Announcement-under-Regulation-30-LODR-Amendments-to-Memorandum-Articles-of-Association-corporate.pdf",
  },
  {
    title: "Announcement under Regulation 30 LODR Investor Presentation",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Announcement-under-Regulation-30-LODR-Investor-Presentation.pdf",
  },
  {
    title: "BM Intimation for Approval of Half Year FS 30 Sept 24 Signed",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/11/BM-Intimation-for-approval-of-half-year-FS-30-Sept-24-signed.pdf",
  },
  {
    title: "Board Meeting Intimation for Approval of Financial Statement for the Year Ended 31 03 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Board-Meeting-intimation-for-approval-of-Financial-Statement-for-the-Year-ended-31-03-2025.pdf",
  },
  {
    title: "Board Meeting Intimation for Approval of Half Yearly FS to Be Held on Friday November 14 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/11/Board-Meeting-Intimation-for-Approval-of-Half-yearly-FS-to-be-held-on-Friday-November-14-2025.pdf",
  },
  {
    title: "Certificate From the Statutory Auditors under Regulation 169(4) & 169(5) of SEBI ICDR Regulations 2018",
    year: "2018-19",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Certificate-from-the-statutory-auditors-under-Reg.-1694-1695-of-SEBI-ICDR-Regulations-2018-1.pdf",
  },
  {
    title: "Certificate under Regulation 74(5) of SEBI Depositories and Participants Regulations 2018 for Quarter and Year Ended 31st March 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Certificate-under-Regulation-745-of-SEBI-Depositories-and-Participants-Regulations-2018-for-quarter-and-year-ended-31st-March-2025.pdf",
  },
  {
    title: "Compliance Certificate (January 2025)",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/certificate.pdf",
  },
  {
    title: "Compliance 57 4 Prior Intimation to the Beginning of the Quarter",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/07/Compliance-57-4-Prior-intimation-to-the-beginning-of-the-quarter.pdf",
  },
  {
    title: "Compliance 57 5 Intimation After the End of Quarter",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/07/Compliance-57-5-intimation-after-the-end-of-quarter.pdf",
  },
  {
    title: "Compliance as per Regulation 57 4",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/compliance-as-per-regulation-57-4.pdf",
  },
  {
    title: "Compliance as per Regulation 57(4) of SEBI Listing Obligation and Disclosure Requirements Regulations 2015 for the Half Year Ended September 30 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/09/Compliance-as-per-Regulation-574-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-Half-Year-ended-September-30-2023.pdf",
  },
  {
    title: "Compliance as per Regulation 57(4) of SEBI Listing Obligation and",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Compliance-as-per-Regulation-574-of-SEBI-Listing-Obligation-and.pdf",
  },
  {
    title: "Compliance as per Regulation 57(5) of SEBI Listing Obligation and Disclosure Requirements Regulations 2015 for the Quarter and Year Ended 31st March 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Compliance-as-per-Regulation-575-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-and-year-ended-31st-March-2025.pdf",
  },
  {
    title: "Compliance as per Regulation 57(5) of SEBI Listing Obligation and Disclosure Requirements Regulations 2015 for the Quarter Ended March 31 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Compliance-as-per-Regulation-575-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-ended-March-31-2024.pdf",
  },
  {
    title: "Compliance as per Regulation 57(5) of SEBI Listing Obligation and Disclosure Requirements Regulations 2015 for the Quarter Ended September 30 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Compliance-as-per-Regulation-575-of-SEBI-Listing-Obligation-and-Disclosure-Requirements-Regulations-2015-for-the-quarter-ended-September-30-2023.pdf",
  },
  {
    title: "Compliances Certificate under REG 74 5 of SEBI DP Regulations 2018",
    year: "2018-19",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Compliances-Certificate-under-Reg.-74-5-of-SEBI-DP-Regulations-2018.pdf",
  },
  {
    title: "Declaration Regarding Non Applicability of Submission of Disclosure Related Party Transaction under Regulation 23(9) of the SEBI Listing Obligations and Disclosure Requirements Regulat",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Declaration-regarding-Non-applicability-of-submission-of-Disclosure-Related-Party-Transaction-under-Regulation-239-of-the-SEBI-Listing-Obligations-and-Disclosure-Requirements-Regulat.pdf",
  },
  {
    title: "Declaration Regarding Non Applicability of Submission of Disclosure Related Party Transaction under Regulation 23(9) of the SEBI Listing Obligations and Disclosure Requirements Regulations",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Declaration-regarding-Non-applicability-of-submission-of-Disclosure-Related-Party-Transaction-under-Regulation-239-of-the-SEBI-Listing-Obligations-and-Disclosure-Requirements-Regulations.pdf",
  },
  {
    title: "Declaration with Respect to Non Applicability of Annual Secretarial Compliance Report",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Declaration-with-respect-to-Non-Applicability-of-Annual-Secretarial-Compliance-Report.pdf",
  },
  {
    title: "Voting Results and Scrutinizer's Report — 30th AGM (Regulation 44)",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/10/Disclosure-of-Voting-Results-and-Consolidated-Scrutinizers-Report-of-the-30th-Annual-General-Meeting-AGM-for-F.Y.-2024-25-held-on-Thursday-September-25-2025-at-1230-p.m.-through-Video-Conferencing-VC.pdf",
  },
  {
    title: "Disclosure under Regulation 30 Read with Para a of Part a of Schedule Iii of SEBI LODR Regulations 2015 Regarding BSE Warning Letter No. Dcsnctswl1372024 2025 Issued on February 01 2025",
    year: "2024-2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/Disclosure-Under-Regulation-30-Read-With-Para-A-Of-Part-A-Of-Schedule-III-Of-SEBI-LODR-Regulations-2015-Regarding-BSE-Warning-Letter-No.-DCSNCTSWL1372024-2025-Issued-On-February-01-2025.pdf",
  },
  {
    title: "Disclosure under Regulation 31(4) of SEBI Substantial Acquisition of Shares and Takeovers Regulation 2011",
    year: "2011-12",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Disclosure-under-Regulation-314-of-SEBI-Substantial-Acquisition-of-Shares-and-Takeovers-Regulation-2011.pdf",
  },
  {
    // Subject line reads "Regulation 10(6) … read with Regulation 10(1)(a)(i)";
    // the source filename had lost the brackets, giving "106" and "101AI".
    title: "Intimation to Stock Exchanges on Acquisition of Shares — SEBI Takeover Regulations 10(6) and 10(1)(a)(i)",
    year: "2011-12",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/01/Disclosures-Under-Regulation-106-Of-SEBI-Substantial-Acquisition-Of-Shares-And-Takeovers-Regulations-2011-Intimation-To-Stock-Exchanges-In-Respect-Of-Acquisition-Under-Regulation-101AI.pdf",
  },
  {
    title: "Filing of Certificate Consequent to Change of Name (Regulation 45(3))",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/02/Filing-Of-Certificate-Under-Regulation-453-Consequent-To-Requirement-Under-Name-Change.pdf",
  },
  {
    title: "Intimation for Non Applicability of Large Corporate LC Disclosure for the Year Ended 31st March 2025",
    year: "2025-26",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Intimation-for-Non-applicability-of-Large-Corporate-LC-disclosure-for-the-year-ended-31st-March-2025.pdf",
  },
  {
    title: "Intimation for Receiving Listing Approval for Bonus Shares From BSE Ltd",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Intimation-for-receiving-Listing-approval-for-Bonus-Shares-from-BSE-Ltd.pdf",
  },
  {
    title: "Intimation for Receiving Trading Approval for Bonus Shares From BSE Ltd",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/03/Intimation-for-receiving-Trading-approval-for-Bonus-Shares-from-BSE-Ltd.pdf",
  },
  {
    title: "Intimation of Appointment of Mr. Kshitij Goel as Chief Information Officer CIO",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/05/Intimation-of-Appointment-of-Mr.-Kshitij-Goel-as-Chief-Information-Officer-CIO.pdf",
  },
  {
    title: "Intimation of Closure of Trading Window",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/03/intimation-of-closure-of-trading-window.pdf",
  },
  {
    title: "Intimation of Date of the 30th AGM — Regulation 30",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/08/Intimation-of-date-of-30th-Annual-General-Meeting-of-the-Logica-Infoway-Limited-1.pdf",
  },
  {
    title: "Intimation of Resignation of Chief Operating Officer North and Key Managerial Personnel of the Company Pursuant to Regulation 30 of SEBI Listing Obligations and Disclosure Requirements",
    year: "2026",
    url: "https://www.logicainfoway.com/wp-content/uploads/2026/02/Intimation-of-resignation-of-Chief-Operating-Officer-North-and-Key-Managerial-Personnel-of-the-Company-pursuant-to-Regulation-30-of-SEBI-Listing-Obligations-and-Disclosure-Requirements.pdf",
  },
  {
    title: "Intimation Regarding Closure of Trading Window",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Intimation-regarding-Closure-of-Trading-Window-.pdf",
  },
  {
    title: "Intimation Transmission Completion Lt Yk Nathany to Swati Choukhany",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/12/Intimation-Transmission-Completion-Lt-YK-Nathany-to-Swati-Choukhany.pdf",
  },
  {
    title: "Intimation under Regulation 29 — Consideration of Audited Standalone Financial Results",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/INTIMATION-UNDER-REG-29.pdf",
  },
  {
    title: "Intimation under REG 30 Regarding Appointment of Additional Market Maker",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/07/Intimation-Under-Reg.-30-Regarding-Appointment-Of-Additional-Market-Maker.pdf",
  },
  {
    title: "Non Applicability of Annual Secretarial Compliance Report",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/04/Non-Applicability-Of-Annual-Secretarial-Compliance-Report.pdf",
  },
  {
    title: "Non-Applicability of Corporate Governance Report as per Regulation 27(2) of SEBI LODR Regulations 2015 (Revised)",
    year: "2015-16",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/Non-Applicability-of-Corporate-Governance-Report-as-per-Regulation-272-of-SEBI-LODR-Regulation-2015-1.pdf",
  },
  {
    title: "Non Applicability of Corporate Governance Report as per Regulation 27(2) of SEBI LODR Regulation 2015",
    year: "2015-16",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Non-Applicability-of-Corporate-Governance-Report-as-per-Regulation-272-of-SEBI-LODR-Regulation-2015.pdf",
  },
  {
    title: "PCA Certificate Regarding Non Applicability of Corporate Governance Provision as per SEBI LODR Regulation 2015",
    year: "2015-16",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/PCA-Certificate-regarding-Non-Applicability-of-Corporate-Governance-Provision-as-per-SEBI-LODR-Regulation-2015.pdf",
  },
  {
    title: "Reconciliation of Share Capital Audit Report Pursuant to Regulation 76 of SEBI Depositories and Participants Regulations 2018 for the Quarter Ended September 30th 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Reconciliation-of-Share-Capital-Audit-Report-pursuant-to-Regulation-76-of-SEBI-Depositories-and-Participants-Regulations-2018-for-the-quarter-ended-September-30th-2023.pdf",
  },
  {
    title: "Disclosure under Regulation 13(3)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/REG-133.pdf",
  },
  {
    title: "Declaration of Non-Applicability of Related Party Transaction Disclosure — Regulation 23(9)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/REG-23.pdf",
  },
  {
    title: "Non-Applicability of Annual Secretarial Compliance Report (Regulation 24A)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/REG-24A-NON-APPLICABILITY.pdf",
  },
  {
    title: "Intimation of Death of Promoter Y. K. Nathany (Regulations 30 and 31A)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/12/Reg-30-and-31A-Intimation-of-death-of-promoter-YK-Nathany.pdf",
  },
  {
    title: "Appointment of Chief Operating Officer — August 18, 2023 (Regulation 30)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/07/REG-30-NEW.pdf",
  },
  {
    title: "Disclosure under Regulation 30 — Outcome of Board Approval for Change of Name",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/12/reg-30.pdf",
  },
  {
    title: "Disclosure under Regulation 31(1) & 31(2) — Substantial Acquisition of Shares and Takeovers",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/REG-311-312.pdf",
  },
  {
    title: "Sub-division, Consolidation, Transmission and Transposition of Securities — Regulation 40(9) & 40(10)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/Reg-409-4010.pdf",
  },
  {
    title: "Voting Results and Scrutinizer's Report — 29th AGM (Regulation 44)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/08/REG-44-Voting-Results-Scrutinizers-Report-of-29TH-Annual-General-Meeting.pdf",
  },
  {
    title: "Compliance under Regulation 57(4)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/01/REG-574.pdf",
  },
  {
    title: "Compliance under Regulation 57(5)",
    year: "2024",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/01/REG-575.pdf",
  },
  {
    // Scanned; read from the page image. Subject line: reconciliation of
    // share capital audit report pursuant to Regulation 76 of the SEBI
    // (Depositories and Participants) Regulations 2018 - a whole regulation
    // number, not a stripped 7(6) - for the half year ended March 2023.
    title: "Reconciliation of Share Capital Audit Report — Half Year Ended March 31, 2023",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/REG-76.pdf",
  },
  {
    title: "Non-Applicability of Corporate Governance Report — Regulation 27(2)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/Regulation-272.pdf",
  },
  {
    title: "Disclosure under Regulation 31(4) — Substantial Acquisition of Shares and Takeovers",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/Regulation-314.pdf",
  },
  {
    title: "Compliance under Regulation 57(5) (FY 2022-23)",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/Regulation-575.pdf",
  },
  {
    // Scanned; read from the page image. Subject line: certificate under
    // Regulation 7(3) of SEBI LODR for the year ended 31 March 2023,
    // certifying that share transfer activities were maintained by the RTA,
    // KFin Technologies Limited.
    title: "Share Transfer Facility Compliance Certificate — Year Ended March 31, 2023",
    year: "2022-23",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/Regulation-73.pdf",
  },
  {
    title: "SDD Compliance Certificate for the Quarter Ended March 31st 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/04/SDD-Compliance-Certificate-for-the-Quarter-ended-March-31st-2024.pdf",
  },
  {
    title: "SDD Compliance Certificate for the Quarter Ended September 30th 2023",
    year: "2023-24",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/SDD-Compliance-Certificate-for-the-Quarter-ended-September-30th-2023.pdf",
  },
  {
    title: "SDD Compliance Certificate",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/05/SDD-COMPLIANCE-CERTIFICATE.pdf",
  },
  {
    title: "Shareholding Pattern as per Regulation 31",
    year: "2023",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/04/Shareholding-Pattern-as-per-Regulation-31.pdf",
  },
  {
    title: "Statement of Investor Complaints as per Regulation 13(3) of the Securities and Exchange Board of India Listing Obligations and Disclosure Requirements Regulations 2015 for the Quarter Ended",
    year: "2015-16",
    url: "https://www.logicainfoway.com/wp-content/uploads/2023/10/Statement-of-Investor-Complaints-as-per-Regulation-133-of-the-Securities-and-Exchange-Board-of-India-Listing-Obligations-and-Disclosure-Requirements-Regulations-2015-for-the-Quarter-ended.pdf",
  },
  {
    title: "Statutory Auditors' Certificate on Consideration Received for Preferential Issue of Shares (SEBI ICDR Regulations 169(4) & 169(5))",
    year: "2025",
    url: "https://www.logicainfoway.com/wp-content/uploads/2025/06/Submission-Of-Certificate-From-The-Statutory-Auditors-Regarding-Consideration-Received-For-Issuance-Of-Shares-On-Preferential-Basis-Reg.-1694-1695-Of-SEBI-Issue-Of-Capital-And-Discl.pdf",
  },
  {
    title: "Intimation of In-Principle Approval for Preferential Issue — Regulation 28(1)",
    year: "2025-26",
    url: "/investor/compliance-disclosures/compliance-regulation-281-non-applicability-april-7-2025.pdf",
  },
  {
    title: "Compliance as per Regulation 57(4) - Non Applicability (Quarter Ended March 31, 2025)",
    year: "2024-25",
    url: "/investor/compliance-disclosures/compliance-regulation-574-non-applicability-march-31-2025.pdf",
  },
  {
    title: "Compliance as per Regulation 74(5) - Non Applicability (Quarter Ended June 30, 2025)",
    year: "2025-26",
    url: "/investor/compliance-disclosures/compliance-regulation-745-non-applicability-june-30-2025.pdf",
  },
  {
    title: "Compliance as per Regulation 74(5) - Non Applicability (Quarter Ended September 30, 2025)",
    year: "2025-26",
    url: "/investor/compliance-disclosures/compliance-regulation-745-non-applicability-september-30-2025.pdf",
  },
  {
    title: "Reconciliation of Share Capital Audit Report Pursuant to Regulation 76 of SEBI Depositories and Participants Regulations 2018 for the Quarter Ended September 2024",
    year: "2024-25",
    url: "https://www.logicainfoway.com/wp-content/uploads/2024/10/9.-Recon-of-Sh.-Cap.-Audit-Report-under-Reg.76-for-Sept.-2024.pdf",
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

/** Real audited financials for each group (subsidiary) company, extracted
 *  from the site's own backup — self-hosted since these were never on the
 *  live investor pages before. */
export const SUBSIDIARY_AUDIT_REPORTS: AnnualReport[] = [
  { title: "Himadri Dealcom Private Ltd. — Audit Report FY 2018-19", year: "2018-19", url: "/investor/subsidiary-audit-reports/hdpl-audit-report-fy-2018-19.pdf" },
  { title: "Himadri Dealcom Private Ltd. — Audit Report FY 2019-20", year: "2019-20", url: "/investor/subsidiary-audit-reports/hdpl-audit-report-fy-2019-20.pdf" },
  { title: "Himadri Dealcom Private Ltd. — Audit Report FY 2020-21", year: "2020-21", url: "/investor/subsidiary-audit-reports/hdpl-audit-report-fy-2020-21.pdf" },
  { title: "Himadri Dealcom Private Ltd. — Audit Report FY 2021-22", year: "2021-22", url: "/investor/subsidiary-audit-reports/hdpl-audit-report-fy-2021-22.pdf" },
  { title: "Himadri Dealcom Private Ltd. — Audit Report FY 2022-23", year: "2022-23", url: "/investor/subsidiary-audit-reports/hdpl-audit-report-fy-2022-23.pdf" },

  { title: "Kalpaturu Tradevin Private Ltd. — Audit Report FY 2018-19", year: "2018-19", url: "/investor/subsidiary-audit-reports/ktpl-audit-report-fy-2018-19.pdf" },
  { title: "Kalpaturu Tradevin Private Ltd. — Audit Report FY 2019-20", year: "2019-20", url: "/investor/subsidiary-audit-reports/ktpl-audit-report-fy-2019-20.pdf" },
  { title: "Kalpaturu Tradevin Private Ltd. — Audit Report FY 2020-21", year: "2020-21", url: "/investor/subsidiary-audit-reports/ktpl-audit-report-fy-2020-21.pdf" },
  { title: "Kalpaturu Tradevin Private Ltd. — Audit Report FY 2022-23", year: "2022-23", url: "/investor/subsidiary-audit-reports/ktpl-audit-report-fy-2022-23.pdf" },

  { title: "Logica Systems & Peripherals Private Ltd. — Audit Report FY 2018-19", year: "2018-19", url: "/investor/subsidiary-audit-reports/lsppl-audit-report-fy-2018-19.pdf" },
  { title: "Logica Systems & Peripherals Private Ltd. — Audit Report FY 2019-20", year: "2019-20", url: "/investor/subsidiary-audit-reports/lsppl-audit-report-fy-2019-20.pdf" },
  { title: "Logica Systems & Peripherals Private Ltd. — Audit Report FY 2020-21", year: "2020-21", url: "/investor/subsidiary-audit-reports/lsppl-audit-report-fy-2020-21.pdf" },
  { title: "Logica Systems & Peripherals Private Ltd. — Audit Report FY 2021-22", year: "2021-22", url: "/investor/subsidiary-audit-reports/lsppl-audit-report-fy-2021-22.pdf" },
  { title: "Logica Systems & Peripherals Private Ltd. — Audit Report FY 2022-23", year: "2022-23", url: "/investor/subsidiary-audit-reports/lsppl-audit-report-fy-2022-23.pdf" },

  { title: "Nirwan Logica Private Ltd. — Audit Report FY 2018-19", year: "2018-19", url: "/investor/subsidiary-audit-reports/nlpl-audit-report-fy-2018-19.pdf" },
  { title: "Nirwan Logica Private Ltd. — Audit Report FY 2019-20", year: "2019-20", url: "/investor/subsidiary-audit-reports/nlpl-audit-report-fy-2019-20.pdf" },
  { title: "Nirwan Logica Private Ltd. — Audit Report FY 2020-21", year: "2020-21", url: "/investor/subsidiary-audit-reports/nlpl-audit-report-fy-2020-21.pdf" },
  { title: "Nirwan Logica Private Ltd. — Audit Report FY 2021-22", year: "2021-22", url: "/investor/subsidiary-audit-reports/nlpl-audit-report-fy-2021-22.pdf" },
  { title: "Nirwan Logica Private Ltd. — Audit Report FY 2022-23", year: "2022-23", url: "/investor/subsidiary-audit-reports/nlpl-audit-report-fy-2022-23.pdf" },

  { title: "Sonartari Tradelink Private Ltd. — Audit Report FY 2018-19", year: "2018-19", url: "/investor/subsidiary-audit-reports/stpl-audit-report-fy-2018-19.pdf" },
  { title: "Sonartari Tradelink Private Ltd. — Audit Report FY 2019-20", year: "2019-20", url: "/investor/subsidiary-audit-reports/stpl-audit-report-fy-2019-20.pdf" },
  { title: "Sonartari Tradelink Private Ltd. — Audit Report FY 2020-21", year: "2020-21", url: "/investor/subsidiary-audit-reports/stpl-audit-report-fy-2020-21.pdf" },
  { title: "Sonartari Tradelink Private Ltd. — Audit Report FY 2022-23", year: "2022-23", url: "/investor/subsidiary-audit-reports/stpl-audit-report-fy-2022-23.pdf" },
  {
    title: "Sonartari Tradelink Private Ltd. — Audit Report FY 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/AUDIT-REPORT-SONARTARI-TRADELINK-PVT-LTD-FY-2021-22-1.pdf",
  },
  {
    title: "Kalpaturu Tradevin Private Ltd. — Audit Report FY 2021-22",
    year: "2021-22",
    url: "https://www.logicainfoway.com/wp-content/uploads/2022/10/AUDIT-REPORT-KALPATURU-TRADEVIN-PRIVATE-LTD.pdf",
  },
];
