/** A single open role. `id` is the URL slug for its detail page
 *  (/careers/open-roles/:id) — keep it stable, since a shared link to a
 *  role should keep working as long as the role is listed.
 *
 *  To add a real opening: add one object to `jobPostings` below. The open
 *  roles list, its search/filter, and the detail page all read from this
 *  array. Removing a role is the same in reverse: delete its object. */
export type JobPosting = {
  id: string;
  title: string;
  /** Team / function, e.g. "Channel Sales". */
  department: string;
  location: string;
  /** 'Full-time' | 'Internship' | 'Contract' — kept short, renders as a tag. */
  employmentType: string;
  /** ISO date (YYYY-MM-DD) the role was listed on the site. */
  postedOn: string;
  reportingTo?: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  education?: string;
};

export const jobPostings: JobPosting[] = [
  {
    id: 'e-commerce-senior-executive-marketplace-sales',
    title: 'E-Commerce Senior Executive – Marketplace Sales',
    department: 'E-Commerce',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-10-19',
    reportingTo: 'E-Commerce Head / Business Head',
    summary:
      'We are looking for a hands-on E-Commerce Executive to manage marketplace sales and day-to-day seller account operations for mobiles, tablets and accessories on Flipkart and Amazon. The role will focus on fulfilment operations, product listings, catalogue health, pricing, sales tracking and marketplace settlements to support smooth operations and profitable growth. The position requires practical knowledge of Flipkart Seller Hub and Amazon Seller Central, strong attention to detail, and ownership of marketplace operational tasks.',
    responsibilities: [
      'Manage Flipkart FBF (Fulfilment by Flipkart) and Amazon FBA (Fulfilment by Amazon) operations, including coordination of stock, fulfilment and order-related issues.',
      'Create, update and maintain product listings with accurate pricing and other catalogue details.',
      'Monitor catalogue health, listing status, product visibility and marketplace account performance; resolve errors and suppressed or inactive listings.',
      'Track sales, inventory availability, pricing, returns, cancellations and other key marketplace performance metrics.',
      'Analyse marketplace fees, commissions, logistics charges, settlements, payouts and product-level profitability; highlight discrepancies for resolution.',
      'Coordinate with internal sales, warehouse, inventory and finance teams to ensure stock availability, timely operations and accurate reconciliation.',
      'Monitor competitor pricing and marketplace promotions, and recommend pricing or listing updates in line with business requirements.',
      'Maintain regular reports and trackers for sales, inventory, returns, fees, payouts and profitability.',
    ],
    requirements: [
      'Minimum 1 year of hands-on experience managing marketplace seller accounts, preferably on Flipkart and Amazon.',
      'Working knowledge of Flipkart Seller Hub and Amazon Seller Central.',
      'Good understanding of FBF, FBA, product listings, catalogue management and marketplace operations.',
      'Basic understanding of marketplace fee structures, settlements, payouts and profitability calculations.',
      'Good working knowledge of MS Excel and the ability to maintain accurate reports and trackers.',
      'Strong coordination, analytical and problem-solving skills with attention to detail.',
      'Experience in mobiles, tablets, accessories, consumer electronics or IT products will be preferred.',
    ],
    education: 'Graduate in any discipline. Relevant marketplace experience will be given preference.',
  },
  {
    id: 'am-retail-expansion',
    title: 'AM – Retail Expansion',
    department: 'Retail Expansion & Property Acquisition',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-10-19',
    reportingTo: 'Retail Head / Business Head',
    summary:
      'We are looking for a commercially driven professional to lead retail site acquisition and expansion across Delhi-NCR, Uttar Pradesh, Uttarakhand and Rajasthan. The role will identify viable locations, evaluate catchments, benchmark rentals, negotiate commercial terms, and coordinate LOI and lease deed finalisation, providing timely business insights to the Sales Head and Management. The position requires a strong landlord/broker network, sound commercial judgement, and ownership of the site-to-lease process.',
    responsibilities: [
      'Identify, visit and shortlist retail sites based on visibility, frontage, accessibility, footfall and business potential.',
      'Conduct catchment analysis, competitor mapping and market research to recommend expansion locations.',
      'Benchmark rentals and evaluate deposits, escalation clauses, maintenance charges, lock-in periods and other lease costs.',
      'Negotiate commercial terms with landlords and property consultants to secure cost-effective locations.',
      'Coordinate LOIs, lease deeds and property documentation with Legal, Finance, Retail Operations and Management.',
      'Build and maintain a property pipeline and landlord/broker network, including existing consultant partnerships.',
      'Prepare site comparison and feasibility reports; track approved sites through lease execution and store handover.',
    ],
    requirements: [
      '6–10 years of experience in retail expansion, commercial real estate, site acquisition or leasing.',
      'Experience in organised retail, mobile/electronics retail, telecom or consumer durables preferred.',
      'Strong knowledge of rental benchmarking, commercial negotiations, catchment analysis and lease terms.',
      'Established landlord, broker or property consultant network across Delhi-NCR, Uttar Pradesh, Uttarakhand and Rajasthan.',
      'Strong coordination, analytical, communication and deal-closing skills; willingness to travel extensively.',
    ],
    education: 'Graduate in any discipline; an MBA or a qualification in Real Estate/Business Management is an advantage.',
  },
  {
    id: 'marketing-manager-retail-digital',
    title: 'Marketing Manager – Retail & Digital Marketing',
    department: 'Marketing',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-10-19',
    reportingTo: 'Business Head / Senior Management',
    summary:
      'Logica Infoway Ltd. is seeking a strategic and results-driven Marketing Manager to strengthen brand positioning and drive business growth across its retail and digital channels. The role will focus on developing integrated marketing strategies, driving customer acquisition, enhancing store footfall, building strategic partnerships, and executing impactful digital and brand campaigns. The ideal candidate should combine strategic planning with hands-on execution, using market insights, creativity and data-driven decisions to deliver measurable business results.',
    responsibilities: [
      'Develop and execute integrated marketing plans aligned with business goals, brand positioning, customer segments and sales priorities.',
      'Plan and implement retail marketing activities across stores, including in-store branding, local activations, promotional offers, vouchers and customer engagement initiatives.',
      'Manage digital marketing campaigns across Meta, Instagram, LinkedIn, YouTube, WhatsApp and other relevant platforms to generate leads and improve customer reach.',
      'Coordinate social media content, campaign calendars, creative briefs, copy and promotional communication in line with brand guidelines.',
      'Build and manage partnerships with local businesses, residential welfare associations, colleges, gyms, theatres, brands and other relevant partners for cross-promotions and on-ground activities.',
      'Plan and execute influencer marketing activities, including identification, outreach, negotiation, onboarding, briefing, approvals and performance tracking.',
      'Coordinate with internal teams, agencies, vendors, retail teams and brand partners to ensure timely and consistent campaign execution across locations.',
      'Monitor campaign budgets, lead generation, footfall, engagement, conversions and other performance indicators; prepare reports and recommend improvements.',
      'Conduct market research, competitor analysis and consumer insight studies to identify trends, promotional opportunities and customer needs.',
      'Support PR, media outreach, brand collaborations, sponsorships and 360-degree campaigns wherever required.',
    ],
    requirements: [
      'Typically 3–6 years of relevant experience in marketing, with practical exposure to integrated campaigns, digital marketing, retail activations, partnerships and campaign analytics. Strong candidates with relevant hands-on experience may also be considered.',
      'Experience in brand marketing, retail marketing, digital marketing, campaign management or an integrated marketing role.',
      'Hands-on understanding of paid social campaigns, lead generation, social media management and WhatsApp marketing.',
      'Experience in retail activations, influencer marketing, partnerships and managing campaigns across multiple locations will be preferred.',
      'Ability to plan budgets, coordinate creative execution, manage vendors and deliver campaigns within timelines.',
      'Working knowledge of Meta Ads Manager, Google Analytics, Canva, MS Excel and presentation tools.',
      'Strong communication, copywriting, negotiation, project management and stakeholder coordination skills.',
      'Experience in mobile retail, consumer electronics, IT products, lifestyle or other consumer-facing businesses will be an advantage.',
      'Ability to use data and campaign results to improve customer response, lead quality, footfall and marketing ROI.',
    ],
    education:
      'Graduate in Marketing, Business Administration, Mass Communication or a related discipline. An MBA or a relevant certification in Marketing/Digital Marketing will be an advantage.',
  },
  {
    id: 'video-editor-creative-producer',
    title: 'Video Editor & Creative Producer',
    department: 'Marketing & Creative Production',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-10-19',
    reportingTo: 'Marketing Head / Business Head',
    summary:
      'We are looking for a creative and performance-focused Video Editor & Creative Producer to develop engaging digital content and advertising creatives for social media, paid campaigns and brand marketing. The role will manage end-to-end content production — from concept development and shooting to editing, motion graphics, sound design and final delivery — while using audience insights and AI-assisted tools to improve creative output and efficiency. Based in Delhi NCR, or as per business requirement.',
    responsibilities: [
      'Create high-quality video content and advertising creatives for social media, paid campaigns and brand marketing initiatives.',
      'Manage end-to-end production, including ideation, scripting/concept development, shooting, editing, motion graphics, sound design and final delivery.',
      'Produce engaging short-form videos, promotional content, product videos and cinematic brand visuals tailored to target audiences.',
      'Develop performance-driven creatives for Meta Ads and other digital marketing campaigns, with a focus on audience retention and engagement.',
      'Work closely with marketing, product and business teams to translate campaign objectives into effective visual content.',
      'Review content performance and apply learnings to improve creative quality, engagement and campaign effectiveness.',
      'Use AI-assisted tools and workflows for ideation, editing, image/video generation and faster creative experimentation.',
      'Maintain consistent brand guidelines, quality standards and timely delivery across multiple projects.',
    ],
    requirements: [
      '2–5 years of experience in video editing, creative production, digital content or advertising.',
      'Strong hands-on skills in Adobe Premiere Pro and After Effects; knowledge of Photoshop, Illustrator, Final Cut Pro or similar tools is an advantage.',
      'Experience creating short-form videos, social media content, paid ad creatives and promotional campaigns.',
      'Understanding of video storytelling, pacing, hooks, audience retention and digital content trends.',
      'Working knowledge of shooting, lighting, sound design and motion graphics.',
      'Familiarity with AI creative tools and prompt-based workflows for image/video production is preferred.',
      'Creative thinking, attention to detail, good time management and the ability to handle multiple projects.',
      'A strong portfolio demonstrating relevant video and advertising work is essential.',
    ],
    education: 'Graduate in Film, Design, Media, Animation or a related field preferred.',
  },
  {
    id: 'area-sales-manager-delhi-ncr',
    title: 'Area Sales Manager',
    department: 'Channel Sales',
    location: 'Delhi & NCR',
    employmentType: 'Full-time',
    postedOn: '2026-09-29',
    reportingTo: 'Sales Head',
    summary:
      'Logica Infoway Ltd. is looking for a result-oriented Area Sales Manager to drive Samsung Laptop sales across Delhi & NCR. The role will focus on expanding the retail and channel network, onboarding new retailers, driving sell-out, maintaining product visibility and developing strong relationships with channel partners.',
    responsibilities: [
      'Manage and develop relationships with existing retailers, dealers and channel partners across the assigned territory.',
      'Identify, approach and onboard new retailers/channel partners for Samsung Laptop products.',
      'Drive sell-in and sell-out of laptops through the assigned retail network.',
      'Develop relationships with LFRs and key retail outlets and ensure effective product placement and sales.',
      'Present product features, pricing, schemes, promotions and commercial offers to retailers.',
      'Ensure adequate stock availability, product visibility and merchandising at retail outlets.',
      'Regularly visit retailers and monitor sales, stock movement, orders and market demand.',
      'Achieve assigned sales, revenue, distribution and retailer onboarding targets.',
      'Track competitor pricing, schemes, products and market activities and provide regular market feedback.',
      'Identify new business opportunities and expand the retailer/dealer network.',
      'Coordinate with the internal sales, distribution and operations teams for orders, stock availability, schemes and partner support.',
      'Ensure timely follow-up on outstanding orders, payments and other channel-related requirements.',
      'Maintain regular daily/weekly sales and market visit reports.',
    ],
    requirements: [
      '1–4 years of experience in channel sales, retail sales or distribution sales.',
      'Experience in laptops, IT hardware, consumer electronics or similar products preferred.',
      'Experience handling retailers, dealers, distributors, LFRs or channel partners.',
      'Good knowledge of the Delhi & NCR retail/channel market.',
    ],
    education: 'Graduate degree / MBA.',
  },
];

/** Cities offered in the location filter even before a posting exists
 *  there. OpenRoles.tsx merges this with the locations real postings carry. */
export const HIRING_LOCATIONS = ['Kolkata', 'Delhi & NCR'];
