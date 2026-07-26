/** Real media/newsroom content, mirrored from logicainfoway.com/media —
 *  awards, recognitions, and internal celebrations. Titles, dates, and
 *  photos are sourced directly from the live site; nothing here is
 *  invented. Images are hosted locally under /public/media. */

export interface MediaEntry {
  title: string;
  /** Human-readable month/year as shown on the source site. */
  date: string;
  /** Sort key, YYYY-MM. */
  sortDate: string;
  category: "award" | "event";
  images: string[];
}

export const MEDIA_ENTRIES: MediaEntry[] = [
  {
    title: "Holi Celebration 2026",
    date: "March 2026",
    sortDate: "2026-03",
    category: "event",
    images: ["/media/2026/004.jpg", "/media/2026/006.jpg"],
  },
  {
    title: "Diwali Celebrations 2025 at Kolkata and Delhi Offices",
    date: "October 2025",
    sortDate: "2025-10",
    category: "event",
    images: ["/media/2025/IMG_20251019_124046-scaled.jpg", "/media/2025/999.jpg"],
  },
  {
    title: "Awards Received from HP Growthon - 2025",
    date: "August 2025",
    sortDate: "2025-08",
    category: "award",
    images: ["/media/2025/GROWTHON.jpg"],
  },
  {
    title: "Industry Excellence Award — Sundeep Mishra",
    date: "August 2025",
    sortDate: "2025-08",
    category: "award",
    images: [
      "/media/2025/INDUSTRY-EXCELLENCE-AWARD--scaled.jpg",
      "/media/2025/PSP_6589.jpg",
      "/media/2025/100.jpg",
      "/media/2025/01.jpg",
      "/media/2025/10.jpg",
    ],
  },
  {
    title: "Distribution of the Year 2025 — CNB (Kolkata)",
    date: "August 2025",
    sortDate: "2025-08",
    category: "award",
    images: ["/media/2025/DISTRIBUTION-OF-THE-YEAR-2025-CNB-KOLKATA-scaled.jpg", "/media/2025/002-1.jpg"],
  },
  {
    title: "MBO of the Year — 2025 (Kolkata)",
    date: "August 2025",
    sortDate: "2025-08",
    category: "award",
    images: ["/media/2025/MBO-OF-THE-YEAR-2025-KOLKATA--scaled.jpg", "/media/2025/003.jpg"],
  },
  {
    title: "Holi Celebration - 2025",
    date: "March 2025",
    sortDate: "2025-03",
    category: "event",
    images: ["/media/2025/001-1.jpg", "/media/2025/008.jpg", "/media/2025/003.jpg"],
  },
  {
    title: "Women's Day Celebration - 2025",
    date: "March 2025",
    sortDate: "2025-03",
    category: "event",
    images: [
      "/media/2025/ad783c59-7928-4cec-a3e3-6a9730fe0616.jpg",
      "/media/2025/101.jpg",
      "/media/2025/100-1.jpg",
      "/media/2025/71540d44-9785-4de2-9257-fa3ca86d8b73.jpg",
    ],
  },
  {
    title: "Award from Samsung — H2-2024, Excellent Retail Performance",
    date: "February 2025",
    sortDate: "2025-02",
    category: "award",
    images: ["/media/2025/new-image.jpg"],
  },
  {
    title: "Republic Day Celebration - 2025",
    date: "January 2025",
    sortDate: "2025-01",
    category: "event",
    images: [
      "/media/2025/002-2-1170x787.jpg",
      "/media/2025/003-3-1170x787.jpg",
      "/media/2025/001-3-1170x787.jpg",
      "/media/2025/004-3-1170x787.jpg",
      "/media/2025/006-3-1170x787.jpg",
    ],
  },
  {
    title: "Diwali Celebrations at Kolkata & Delhi Offices",
    date: "November 2024",
    sortDate: "2024-11",
    category: "event",
    images: [
      "/media/2024/003-copy-copy.jpg",
      "/media/2024/11-copy.jpg",
      "/media/2024/004-copy-.jpg",
      "/media/2024/12-copy.jpg",
      "/media/2024/008.jpg",
      "/media/2024/10-copy.jpg",
    ],
  },
  {
    title: "Awards from HP — 2024",
    date: "October 2024",
    sortDate: "2024-10",
    category: "award",
    images: [
      "/media/2024/hp-award-002-1-scaled.jpg",
      "/media/2024/hp-award-001-1-scaled.jpg",
      "/media/2024/001-2.jpg",
      "/media/2024/002-1-scaled.jpg",
    ],
  },
  {
    title: "Award received for Flipkart — 2023, Highest Seller in Mobile Category",
    date: "October 2024",
    sortDate: "2024-10",
    category: "award",
    images: ["/media/2024/flipkart-003-1.jpg", "/media/2024/flipkart-002-1.jpg", "/media/2024/flipkart-001-1.jpg"],
  },
  {
    title: "28th Annual General Meeting",
    date: "August 2023",
    sortDate: "2023-08",
    category: "event",
    images: ["/media/2023/d-2.jpg", "/media/2023/325.jpg", "/media/2023/100-1.jpg"],
  },
  {
    title: "Listing Ceremony",
    date: "July 2023",
    sortDate: "2023-07",
    category: "event",
    images: ["/media/2023/52.jpg", "/media/2023/34.jpg"],
  },
  {
    title: "The Brand Sony — Award",
    date: "July 2023",
    sortDate: "2023-07",
    category: "award",
    images: ["/media/2023/Eastern-Logica-sony-Awards.png"],
  },
  {
    title: "The Brand Lenovo — Award",
    date: "July 2023",
    sortDate: "2023-07",
    category: "award",
    images: ["/media/2023/The-Lenovo-Awards.png"],
  },
  {
    title: "Samsung — Super Star Award",
    date: "July 2023",
    sortDate: "2023-07",
    category: "award",
    images: ["/media/2023/Super-Star-Samsung.png"],
  },
  {
    title: "Award With Chief Minister",
    date: "July 2023",
    sortDate: "2023-07",
    category: "award",
    images: ["/media/2023/Award-with-CM.png"],
  },
];

/** Standing brand-partner certifications (no specific date — evergreen archive). */
export const MEDIA_CERTIFICATES: { name: string; image: string }[] = [
  { name: "Vivo", image: "/media/certificates/VIVO-CERTIFICATE-1-300x300.jpg" },
  { name: "Samsung", image: "/media/certificates/SAMSUNG-SUPERSTAR-1-300x300.jpg" },
  { name: "OPPO Certificate of Appreciation", image: "/media/certificates/OPPO-CERTIFICATE-OF-APPRECIATION-1-300x300.jpg" },
  { name: "OPPO", image: "/media/certificates/OPPO-1-300x300.jpg" },
  { name: "Lenovo", image: "/media/certificates/LENOVO-CERTIFICATE-1-300x300.jpg" },
  { name: "Intel", image: "/media/certificates/INTEL-1-300x300.jpg" },
  { name: "HP Trophy", image: "/media/certificates/HP-TROPHY-1-300x300.jpg" },
  { name: "HP Certificate", image: "/media/certificates/HP-CERTIFICATE-1-300x300.jpg" },
  { name: "Flipkart Zonal Top Star", image: "/media/certificates/FLIPKART-ZONAL-TOP-STAR-2-300x300.jpg" },
  { name: "Flipkart", image: "/media/certificates/flipcart-300x300.jpg" },
  { name: "Dell", image: "/media/certificates/dell-1-300x300.jpg" },
];
