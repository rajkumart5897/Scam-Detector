// src/constants/trainingData.js
// label: 1 = scam, 0 = legitimate
// The more examples you add, the better the model gets.
// Minimum ~20 per class is needed for meaningful training.

export const TRAINING_DATA = [

  // ═══════════════════════════════════════════════════════════
  // SCAM EXAMPLES  (label: 1)
  // ═══════════════════════════════════════════════════════════

  {
    label: 1,
    text: `Work From Home - Earn $5000/week! No experience needed. 
    We are looking for motivated individuals to join our team as Data Entry Specialists. 
    You will be processing simple online forms from home. Must be 18+. 
    Training fee of $49.99 required. Send bank details to jobs@quickcash-online.net. 
    No interviews required - immediate start!`,
  },

  {
    label: 1,
    text: `URGENT HIRING! Make $800 daily from home. No skills required. 
    Just click ads and fill forms. Limited spots available - apply NOW! 
    Send your full name, address and date of birth to earn2day@gmail.com. 
    Guaranteed income every week. Be your own boss. Financial freedom awaits!`,
  },

  {
    label: 1,
    text: `Online Data Entry Job - Earn $200-$2000 per week! 
    Anyone can do it. Work from anywhere. No experience required. 
    Simple tasks include typing and copy paste work. 
    Registration fee $25 (fully refundable). 
    Contact us at fastjobs247@yahoo.com. Positions filling fast!`,
  },

  {
    label: 1,
    text: `Earn money from home processing insurance claims. 
    No experience necessary. We provide full training. 
    Starter kit fee: $75. Earn up to $3000 per week. 
    Send your national ID and bank account number to get started. 
    Reply within 24 hours - limited openings!`,
  },

  {
    label: 1,
    text: `Part time work from home opportunity. Earn $500 daily. 
    No qualifications needed. Just basic computer skills. 
    Envelope stuffing and form filling. Immediate hire, no interview. 
    Send your details to workfromhome99@hotmail.com. 
    Unlimited earning potential. Don't miss this chance!`,
  },

  {
    label: 1,
    text: `MAKE MONEY FAST!!! Online business opportunity. 
    Work 2 hours a day and earn $10,000 a month. 
    Be your own boss. Passive income guaranteed. 
    Small joining fee of $99.99 to access our exclusive platform. 
    Risk free opportunity. Act now before spots run out!!!`,
  },

  {
    label: 1,
    text: `Virtual assistant needed urgently. Earn $400-$4000 per week. 
    No experience needed. Just a computer and internet. 
    You will help process payments and transfer funds. 
    Send your bank details and routing number to apply. 
    Hired on the spot. No interview process needed.`,
  },

  {
    label: 1,
    text: `Work from home customer support. $50 per hour. No experience required. 
    You must purchase our software kit for $150 to get started. 
    Guaranteed refund after 30 days. Easy tasks, flexible hours. 
    Email your full address, date of birth to support@easyworkjobs.net. 
    Today only - 5 positions remaining!`,
  },

  {
    label: 1,
    text: `Home based data processing job. Earn $1000-$5000 weekly. 
    Simple online tasks. No degree required. Anyone can apply. 
    Admin fee $30 required to register. 
    Send your social security number and bank details to verify identity. 
    Immediate placement. No screening process.`,
  },

  {
    label: 1,
    text: `Freelance recruiter needed. Earn commission $500-$3000 per week. 
    No experience needed. Work from your phone. 
    You will receive payments and forward to clients via western union or bitcoin. 
    Flexible hours. Unlimited earning potential. 
    Contact moneyrecruit@gmail.com. Hiring now - respond immediately.`,
  },

  {
    label: 1,
    text: `Online survey jobs - get paid $200 per survey. 
    No experience needed. Work anytime from anywhere. 
    Sign up fee just $19.99. Earn passive income weekly. 
    Financial freedom from home. Limited positions available. 
    Email surveycash2024@yahoo.com with your bank account to receive payments.`,
  },

  {
    label: 1,
    text: `Mystery shopper needed urgently. Earn $400 per day. 
    No experience required. We will send you a check to purchase items. 
    Keep $100 as your fee and wire the rest back via western union. 
    No interview. Immediate start. Contact mysteryshop@gmail.com today!`,
  },

  {
    label: 1,
    text: `Work at home assembling products. Earn $800 weekly. 
    Simple craft assembly tasks. No experience necessary. 
    Materials kit costs $65 upfront fully refundable. 
    Send full name, home address and date of birth to crafthome@outlook.com. 
    Positions are filling fast. Apply now!`,
  },

  {
    label: 1,
    text: `Digital marketing assistant. Earn up to $5000/month. 
    No degree required. Just a smartphone needed. 
    Processing fee of $45 to access training portal. 
    Send your passport number for background verification. 
    No interview needed. Start earning today. Limited spots left!`,
  },

  {
    label: 1,
    text: `HIRING NOW!!! Amazon product reviewer. Get paid $300/day. 
    Work from home. No experience needed. Just review products online. 
    Registration $29. Guaranteed weekly payments to your bank. 
    Email your bank details to amazonreviewer@gmail.com immediately. 
    Don't miss this risk free opportunity!!!`,
  },

  // ═══════════════════════════════════════════════════════════
  // LEGITIMATE EXAMPLES  (label: 0)
  // ═══════════════════════════════════════════════════════════

  {
    label: 0,
    text: `Software Engineer - Frontend React. Company: Stripe. San Francisco CA Hybrid. 
    3 plus years React experience required. TypeScript, Jest, Cypress. 
    Salary $140,000 to $180,000 plus equity and benefits. 
    Interview process: phone screen, technical assessment, 3 virtual rounds. 
    Apply at stripe.com/jobs or careers@stripe.com.`,
  },

  {
    label: 0,
    text: `Data Analyst at Deloitte. Mumbai India. Full time permanent role. 
    Requirements: Bachelor degree in Statistics or Computer Science. 
    2 years experience with SQL, Python, Tableau. 
    Responsibilities include building dashboards and presenting insights to stakeholders. 
    Compensation: 8 to 12 LPA based on experience. 
    Apply through deloitte.com/careers. Structured interview process with HR and panel rounds.`,
  },

  {
    label: 0,
    text: `Product Manager at Flipkart. Bengaluru Karnataka. 
    5 years product management experience. MBA preferred. 
    You will own the roadmap for our logistics product vertical. 
    Work with engineering design and data science teams. 
    CTC 25 to 35 LPA. Apply at flipkart.com/careers. 
    Interview includes case study, product sense round, and leadership interview.`,
  },

  {
    label: 0,
    text: `Junior Backend Developer at Zoho Corporation. Chennai Tamil Nadu. 
    Freshers and 1 year experience welcome. 
    Skills: Java or Python, REST APIs, MySQL. 
    Training provided for selected candidates. 
    Salary: 4.5 to 6 LPA. 5 day work week. 
    Apply via zoho.com/careers. Written test followed by two technical interviews.`,
  },

  {
    label: 0,
    text: `UX Designer at Adobe. Noida Uttar Pradesh. Hybrid role. 
    Portfolio required. 3 years of UX design experience. 
    Proficiency in Figma, Adobe XD, user research methods. 
    You will lead design for Creative Cloud mobile applications. 
    Salary range: 18 to 25 LPA plus performance bonus. 
    careers.adobe.com. Interview: portfolio review, design challenge, culture fit round.`,
  },

  {
    label: 0,
    text: `Machine Learning Engineer at Google India. Hyderabad. 
    MS or PhD in Computer Science or related field. 
    Strong fundamentals in ML, deep learning, TensorFlow or PyTorch. 
    3 plus years industry experience. 
    Competitive compensation with RSUs, health insurance, and learning budget. 
    Apply at careers.google.com. Multiple technical rounds including coding and system design.`,
  },

  {
    label: 0,
    text: `Content Writer at Times of India Digital. Remote India. 
    2 years writing experience. Strong command of English. 
    You will produce 3 to 5 articles daily on tech and business topics. 
    Salary: 3.5 to 5 LPA. Byline credit given. 
    Send portfolio and resume to careers@timesinternet.in. 
    Editorial test followed by interview with senior editor.`,
  },

  {
    label: 0,
    text: `HR Executive at Infosys BPM. Pune Maharashtra. 
    Bachelor degree required. 1 to 3 years HR experience. 
    Responsibilities: recruitment coordination, onboarding, HRMS management. 
    CTC 3 to 5 LPA with annual appraisal. 
    infosys.com/careers. Assessment test, HR round and manager interview.`,
  },

  {
    label: 0,
    text: `Cybersecurity Analyst at Wipro. Bengaluru or Remote. 
    CEH or CISSP certification preferred. 3 years SOC experience. 
    Monitor SIEM tools, respond to incidents, conduct vulnerability assessments. 
    Salary 10 to 16 LPA plus shift allowance. Health and life insurance included. 
    Apply at careers.wipro.com. Technical screening, aptitude test, panel interview.`,
  },

  {
    label: 0,
    text: `Accountant at KPMG India. Delhi NCR. 
    CA qualification required. 2 years post qualification experience. 
    Handle client audits, financial statements, tax compliance. 
    Remuneration: 8 to 12 LPA based on experience. 
    Apply through kpmg.com/in/careers. Aptitude test, technical interview, partner round.`,
  },

  {
    label: 0,
    text: `DevOps Engineer at Razorpay. Bengaluru Karnataka. Full time. 
    4 plus years experience with AWS, Kubernetes, CI/CD pipelines. 
    You will manage infrastructure reliability and deploy at scale. 
    Compensation: 20 to 28 LPA plus ESOPs. 
    razorpay.com/jobs. Interview process includes system design and infrastructure deep dive.`,
  },

  {
    label: 0,
    text: `Operations Executive at Zomato. Gurugram Haryana. 
    Graduate with 1 year operations or logistics experience. 
    Coordinate between restaurant partners and delivery fleet. 
    Salary 3 to 4.5 LPA plus performance incentives. 
    Apply at zomato.com/jobs. Group discussion followed by HR and ops manager interview.`,
  },

  {
    label: 1,
    text: `Administrative Assistant Data Entry Clerk Remote. Urgent hiring! 
    Work from home. No experience needed. High pay $30/hr to start. 
    Must have your own laptop. We will send you a check to purchase 
    equipment from our preferred vendor. Immediate start no interview required.`,
  },

  {
    label: 1,
    text: `Remote customer service representative. $25 per hour no experience needed. 
    Work from home immediately. We will mail you a check for equipment purchase. 
    Buy equipment from our preferred vendor and keep the rest. 
    No interview needed. Start today. Contact us at remotejobs@gmail.com`,
  },

  {
    label: 1,
    text: `Data entry specialist work from home. High pay $35/hr. 
    No experience required. Must have your own computer. 
    We will send a check to cover your setup costs. 
    Wire the remaining amount back after purchase. Urgent hiring now.`,
  },
];

// ─── Quick stats export ───────────────────────────────────────────────────────
// Useful for displaying dataset info in the MetricsTab.

export const DATASET_STATS = {
  total:      TRAINING_DATA.length,
  scamCount:  TRAINING_DATA.filter(d => d.label === 1).length,
  legitCount: TRAINING_DATA.filter(d => d.label === 0).length,
};