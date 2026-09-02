/** Disclosure under Regulation 46 of the SEBI (Listing Obligations and
 *  Disclosure Requirements) Regulations, 2015.
 *
 *  Regulation 46(2) lists what a listed entity must publish on its website.
 *  This is the index of those items against where each one actually lives on
 *  this site.
 *
 *  Every `href` here points at a page or document that already exists and was
 *  checked to resolve. Where the company has nothing published against a
 *  clause, the row carries a `status` instead of a link rather than being
 *  pointed at something approximate — an index that quietly substitutes a
 *  near-enough document is worse than one that says plainly where the gap is.
 *  Rows marked `needsConfirmation` resolve to a real document, but which
 *  document satisfies the clause is a call for the Company Secretary. */
export interface Reg46Row {
  /** Clause letter as it appears in Regulation 46(2). */
  clause: string;
  particulars: string;
  /** Where the disclosure lives. Absent when nothing is published for it. */
  href?: string;
  /** Shown in place of a link — either plain text that is itself the
   *  disclosure, or a note that the item does not apply / is not published. */
  status?: string;
  /** True where the mapping is a judgement call for the Company Secretary
   *  rather than an exact match. Surfaced in the UI as a footnote marker. */
  needsConfirmation?: boolean;
}

const POLICY = 'https://www.logicainfoway.com/wp-content/uploads/';

export const REG_46_ROWS: Reg46Row[] = [
  {
    clause: '(a)',
    particulars: 'Details of business',
    href: '/about',
  },
  {
    clause: '(b)',
    particulars: 'Terms and conditions of appointment of Independent Directors',
    href: `${POLICY}2022/09/Policy-on-Terms-of-Appointment-of-Independent-Directors-1.pdf`,
  },
  {
    clause: '(c)',
    particulars: 'Composition of various committees of Board of Directors',
    href: '/about/composition-of-committees',
  },
  {
    clause: '(d)',
    particulars: 'Code of Conduct of Board of Directors and Senior Management Personnel',
    href: `${POLICY}2022/09/Code-of-Conduct-for-Directors-and-Senior-Management-1.pdf`,
  },
  {
    clause: '(e)',
    particulars: 'Details of establishment of vigil mechanism / Whistle Blower Policy',
    href: `${POLICY}2022/09/Vigil-Mechanism_Whistle-Blower-Policy-for-Directors-and-Employees-1.pdf`,
  },
  {
    clause: '(f)',
    particulars:
      'Criteria of making payments to Non-Executive Directors, if the same has not been disclosed in the Annual Report',
    href: `${POLICY}2022/09/Nomination-and-Remuneration-Policy-1.pdf`,
    needsConfirmation: true,
  },
  {
    clause: '(g)',
    particulars: 'Policy on dealing with Related Party Transactions',
    href: `${POLICY}2026/05/Revised-Related-Party-Policy-signed.pdf`,
  },
  {
    clause: '(h)',
    particulars: "Policy for determining 'material' subsidiaries",
    // The Materiality Policy on file identifies group companies, which is a
    // different test from the material-subsidiary test in Regulation 16(1)(c).
    href: `${POLICY}2022/09/Materiality-Policy-for-Identification-of-Group-Companies-1.pdf`,
    needsConfirmation: true,
  },
  {
    clause: '(i)',
    particulars: 'Details of familiarisation programmes imparted to Independent Directors',
    href: '/investor/familiarization-program',
  },
  {
    clause: '(j)',
    particulars:
      'Email address for grievance redressal and other relevant details',
    href: '/grievance-redressal',
  },
  {
    clause: '(k)',
    particulars:
      'Contact information of the designated officials responsible for assisting and handling investor grievances',
    href: '/grievance-redressal',
  },
  {
    clause: '(l)',
    particulars: 'Financial results',
    href: '/investor/financial-results',
  },
  {
    clause: '(m)',
    particulars: 'Complete copy of the Annual Report including Balance Sheet, Profit and Loss Account and Directors’ Report',
    href: '/investor/annual-report',
  },
  {
    clause: '(n)',
    particulars: 'Shareholding pattern',
    href: '/investor/shareholding-pattern',
  },
  {
    clause: '(o)',
    particulars:
      'Details of agreements entered into with media companies and/or their associates',
    status: 'The Company has not entered into any such agreement.',
    needsConfirmation: true,
  },
  {
    clause: '(p)',
    particulars:
      'Schedule of analyst or institutional investor meets and presentations made to them',
    status: 'Not published.',
    needsConfirmation: true,
  },
  {
    clause: '(q)',
    particulars:
      'New name and old name of the listed entity for a continuous period of one year from the date of the change',
    status:
      'Logica Infoway Limited (formerly Eastern Logica Infoway Limited), renamed 20 March 2024.',
  },
  {
    clause: '(r)',
    particulars: 'Advertisements as per Regulation 47(1)',
    href: '/advertisement',
  },
  {
    clause: '(s)',
    particulars: 'Credit ratings obtained by the entity for all its outstanding instruments',
    status: 'Not published.',
    needsConfirmation: true,
  },
  {
    clause: '(t)',
    particulars: 'Separate audited financial statements of each subsidiary',
    href: '/investor/subsidiary-audit-reports',
  },
  {
    clause: '(u)',
    particulars: 'Secretarial compliance report',
    href: '/investor/secretarial-compliance',
  },
  {
    clause: '(v)',
    particulars:
      'Disclosure of contact details of Key Managerial Personnel authorised for determining materiality of an event or information',
    href: '/authorized-person',
  },
  {
    clause: '(w)',
    particulars:
      'Statements of deviation(s) or variation(s) in the use of proceeds',
    href: '/investor/corporate-announcement',
  },
  {
    clause: '(x)',
    particulars: 'Dividend Distribution Policy',
    status:
      'Not applicable. Mandatory for the top 1,000 listed entities by market capitalisation.',
    needsConfirmation: true,
  },
];
