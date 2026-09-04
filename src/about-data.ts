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

/* Board and KMP as set out in the company's own Board & KMP profiles
   document. Every line below is taken from there rather than paraphrased,
   which corrected three things the site had carried until now: Mr Gaurav
   Goel graduated in 1995, not 1992; Mr Rakesh Kumar Goel has over 61 years'
   experience, not 58; and Mr Sundeep Mishra has been Chief Operating Officer
   since July 1, 2022, where the site had May 6, 2022. */
export const BOARD_MEMBERS: BoardMember[] = [
  {
    name: 'Mr. Gaurav Goel',
    designation: 'Chairman cum Managing Director',
    photo: '/about/board/gaurav-goel.png',
    details: [
      'Chairman cum Managing Director and Promoter of the Company',
      "Bachelor's in Electronics and Communications Engineering, Manipal Institute of Technology, Karnataka, 1995",
      'With the Company since December 2, 2002; re-designated Managing Director on July 1, 2024',
      'Over 30 years of experience in the industry',
    ],
  },
  {
    name: 'Mrs. Shweta Goel',
    designation: 'Whole-Time Director',
    photo: '/about/board/shweta-goel.png',
    details: [
      'Whole-time Director and Promoter of the Company',
      'B.A. (Honours) in English, Loreto College, Kolkata, 1995',
      'Postgraduate qualification in Guidance and Counselling',
      'With the Company since December 2, 2002; re-designated Whole-time Director on April 1, 2017',
    ],
  },
  {
    name: 'Mr. Rakesh Kumar Goel',
    designation: 'Non-Executive Director',
    photo: '/about/board/rakesh-kumar-goel.png',
    details: [
      "Bachelor's in Mechanical Engineering, Jabalpur University, 1965",
      'Over 61 years of professional experience',
      'Has held positions with Texmaco, Titagarh Wagons Limited, Paharpur Cooling Towers Limited and HEI Limited',
      'With the Company since July 14, 2014',
    ],
  },
  {
    name: 'Mr. Dinesh Arya',
    designation: 'Independent Director',
    photo: '/about/board/dinesh-arya.png',
    details: [
      'B.Com, Ravishankar University, Raipur; PGDBA in Finance, Symbiosis Centre for Distance Learning, Pune',
      'Fellow Member of the Institute of Company Secretaries of India',
      'Over 34 years of experience in corporate governance, regulatory matters and general management',
      'Formerly Company Secretary & Compliance Officer and Head (Legal), Titagarh Wagons Limited',
      'With the Company since July 1, 2022',
    ],
  },
  {
    name: 'Mr. Nil Kamal Samanta',
    designation: 'Independent Director',
    photo: '/about/board/nil-kamal-samanta.png',
    details: [
      "Bachelor's degrees in Physics and Law, Calcutta University; CAIIB",
      'Over 39 years of banking experience, with expertise in branch banking and administrative operations',
      'Formerly Assistant General Manager and Deputy Zonal Manager, Bank of India',
      'With the Company since August 26, 2022, appointed for a five-year term',
    ],
  },
  {
    name: 'Mrs. Vinita Saraf',
    designation: 'Independent Director',
    photo: '/about/board/vinita-saraf.png',
    details: [
      "Bachelor's degree in Commerce (Honours); NISM Series VIII certified",
      'Over 6 years of experience in company law, corporate governance, regulatory matters, corporate communication and investor relations',
      'With the Company since August 29, 2022, appointed for an eight-year term',
    ],
  },
  {
    name: 'Mr. Sundeep Mishra',
    designation: 'Chief Operating Officer',
    photo: '/about/board/sundeep-mishra.png',
    details: [
      'Bachelor of Commerce, Calcutta University',
      'Around 49 years of experience in sales, marketing and business development',
      'Chief Operating Officer since July 1, 2022, overseeing sales and business development',
    ],
  },
  {
    name: 'Mr. Deepak Kumar Jha',
    designation: 'Chief Financial Officer',
    photo: '/about/board/deepak-kumar-jha.png',
    details: [
      'Bachelor of Commerce, University of Calcutta',
      'Around 22 years of experience in Accounts and Finance',
      'With the Company since January 2, 2012; Chief Financial Officer since July 1, 2022',
    ],
  },
  {
    name: 'Ms. Priyanka Gera',
    designation: 'Company Secretary & Compliance Officer',
    photo: '/about/board/priyanka-gera.png',
    details: [
      'Associate Member of the Institute of Company Secretaries of India',
      "Master's degree in Commerce, IGNOU; Bachelor's degree in Law, Rajasthan University",
      'Over 7 years of experience across public and private sector companies',
      'Expertise in secretarial compliances, Board matters, corporate governance, securities law and due diligence',
      'Appointed on September 24, 2024',
    ],
  },
  {
    name: 'Mr. Kshitij Goel',
    designation: 'Chief Information Officer',
    photo: '/about/board/kshitij-goel.png',
    details: [
      'Degrees in Mechanical Engineering and Business, Boston University, USA',
      'Experience in logistics automation and optimisation as an Engineering Project Manager with Amazon Logistics, USA',
      'Practical experience in consumer IT and telecom hardware distribution and retail',
      'Appointed Chief Information Officer on May 1, 2025',
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
