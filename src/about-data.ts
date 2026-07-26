export const NAME_HISTORY = [
  { name: 'Oswal Infotech Private Limited', event: 'Original incorporation', date: 'July 28, 1995' },
  { name: 'Eastern Infoway Private Limited', event: 'Renamed', date: 'December 5, 2000' },
  { name: 'Eastern Infoway Limited', event: 'Converted to a public company', date: 'January 2, 2001' },
  { name: 'Eastern Logica Infoway Limited', event: 'Renamed', date: 'February 3, 2003' },
  { name: 'Logica Infoway Limited', event: 'Renamed', date: 'March 20, 2024' },
];

export const OVERVIEW_SCALE = {
  asOf: 'March 31, 2025',
  offices: 6,
  retailStores: 52,
  distributionCentres: 5,
  cities: 11,
};

export const OVERVIEW_FINANCIALS = {
  year: '2021',
  profitBeforeTax: '₹314.20 lakhs',
  priorYear: '2020',
  priorYearProfitBeforeTax: '₹255.86 lakhs',
};

export const MISSION_STATEMENT =
  'To provide high quality products that combine performance with value pricing while establishing a successful relationship with our customer and suppliers.';

export const BUSINESS_DESCRIPTION =
  'Multi-brand retail & retail selling as well as distribution of branded smartphones, IT hardware, software and allied accessories — alongside networking and security solutions for our consumers.';

export const REGISTERED_OFFICE = {
  address: '2, Saklat Place, 1st Floor, Kolkata-700072, West Bengal, India',
  relocatedNote: 'The registered office most recently relocated with effect from November 1, 2012.',
};

export interface BoardMember {
  name: string;
  designation: string;
  photo: string;
  details: string[];
}

export const BOARD_MEMBERS: BoardMember[] = [
  {
    name: 'Mr. Gaurav Goel',
    designation: 'Chairman cum Managing Director',
    photo: '/about/board/gaurav-goel.png',
    details: [
      'Appointed to the Board on December 2, 2002',
      'Re-designated as Managing Director on July 1, 2024',
      '1992 graduate in Electronics & Communications Engineering',
    ],
  },
  {
    name: 'Mrs. Shweta Goel',
    designation: 'Whole-Time Director',
    photo: '/about/board/shweta-goel.png',
    details: [
      'Originally appointed December 2, 2002',
      'Re-designated April 1, 2017',
      'Graduate in English; postgraduate in Guidance & Counselling',
    ],
  },
  {
    name: 'Mr. Rakesh Kumar Goel',
    designation: 'Non-Executive Director',
    photo: '/about/board/rakesh-kumar-goel.png',
    details: ['Mechanical Engineer with 58 years of experience'],
  },
  {
    name: 'Mr. Dinesh Arya',
    designation: 'Independent Director',
    photo: '/about/board/dinesh-arya.png',
    details: [
      'Appointed July 1, 2022, for a 5-year term',
      'Fellow, Company Secretaries of India',
      'PGDBA in Finance',
    ],
  },
  {
    name: 'Mr. Nil Kamal Samanta',
    designation: 'Independent Director',
    photo: '/about/board/nil-kamal-samanta.png',
    details: [
      'Appointed August 26, 2022, for a 5-year term',
      '39 years in banking; retired as Deputy Zonal Manager, Bank of India',
    ],
  },
  {
    name: 'Ms. Vinita Saraf',
    designation: 'Independent Director',
    photo: '/about/board/vinita-saraf.png',
    details: [
      'Appointed August 29, 2022, for an 8-year term',
      'Bachelor in Commerce (Honours); NISM VIII certified',
    ],
  },
  {
    name: 'Mr. Sundeep Mishra',
    designation: 'Chief Operating Officer',
    photo: '/about/board/sundeep-mishra.png',
    details: ['Appointed May 6, 2022', '~49 years in marketing, sales, and business development'],
  },
  {
    name: 'Mr. Deepak Kumar Jha',
    designation: 'Chief Financial Officer',
    photo: '/about/board/deepak-kumar-jha.png',
    details: ['Appointed July 1, 2022', '~22 years in Accounts & Finance; associated with the company since January 2012'],
  },
  {
    name: 'Ms. Priyanka Gera',
    designation: 'Company Secretary & Compliance Officer',
    photo: '/about/board/priyanka-gera.jpg',
    details: ['Appointed September 24, 2024', 'Associate ICSI; Master\'s in Commerce; Bachelor in Law'],
  },
  {
    name: 'Mr. Ankur Bhutani',
    designation: 'Chief Operating Officer (North)',
    photo: '/about/board/ankur-bhutani.png',
    details: ['Appointed July 18, 2023', '22+ years with major MNCs including HP, Dell, and Samsung'],
  },
  {
    name: 'Mr. Kshitij Goel',
    designation: 'Chief Information Officer',
    photo: '/about/board/kshitij-goel.jpg',
    details: [
      'Appointed May 1, 2025',
      'Mechanical Engineering & Business graduate, Boston University',
      'Prior experience at Amazon Logistics',
    ],
  },
];

export interface Committee {
  name: string;
  members: { name: string; role: string }[];
}

export const COMMITTEES: Committee[] = [
  {
    name: 'Audit Committee',
    members: [
      { name: 'Dinesh Arya', role: 'Chairman' },
      { name: 'Nil Kamal Samanta', role: 'Member' },
      { name: 'Gaurav Goel', role: 'Member' },
      { name: 'Vinita Saraf', role: 'Member' },
    ],
  },
  {
    name: 'Nomination & Remuneration Committee',
    members: [
      { name: 'Vinita Saraf', role: 'Chairman' },
      { name: 'Dinesh Arya', role: 'Member' },
      { name: 'Rakesh Kumar Goel', role: 'Member' },
    ],
  },
  {
    name: 'Stake Holders Relationship Committee',
    members: [
      { name: 'Nil Kamal Samanta', role: 'Chairman' },
      { name: 'Gaurav Goel', role: 'Member' },
      { name: 'Shweta Goel', role: 'Member' },
    ],
  },
  {
    name: 'Internal Complaints Committee',
    members: [
      { name: 'Paromita Samanta', role: 'Presiding Officer' },
      { name: 'Priyanka Baid', role: 'External Member' },
      { name: 'Deepak Kumar Jha', role: 'Member' },
      { name: 'Ranveer Sharma', role: 'Member' },
    ],
  },
  {
    name: 'CSR Committee',
    members: [
      { name: 'Shweta Goel', role: 'Chairperson' },
      { name: 'Rakesh Kumar Goel', role: 'Member' },
      { name: 'Dinesh Arya', role: 'Member' },
    ],
  },
];
