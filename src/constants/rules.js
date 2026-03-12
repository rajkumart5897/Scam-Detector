// src/constants/rules.js
// Each rule has:
//   id         — unique snake_case identifier
//   title      — short display name (shown in UI)
//   category   — one of the FLAG_CATEGORIES from config.js
//   severity   — HIGH / MEDIUM / LOW
//   points     — how much this adds to the scam score (0-100 scale)
//   match      — a function that takes the full text and returns
//                { matched: bool, evidence: string | null }

export const RULES = [

  // ─── FINANCIAL FLAGS ──────────────────────────────────────────────────────

  {
    id:       "unrealistic_salary",
    title:    "Unrealistic Salary Promise",
    category: "Financial",
    severity: "HIGH",
    points:   25,
    match: (text) => {
      // Looks for patterns like "$5000/week", "earn $500 daily", "make $10,000 a month"
      const pattern = /\$[\d,]+\s*(\/|\s*per\s*)(week|day|hour|daily|weekly)/i;
      const found = text.match(pattern);
      return {
        matched:  !!found,
        evidence: found ? found[0] : null,
      };
    },
  },

  {
    id:       "upfront_fee",
    title:    "Upfront Payment / Training Fee",
    category: "Financial",
    severity: "HIGH",
    points:   30,
    match: (text) => {
      const keywords = [
        "training fee", "registration fee", "starter kit",
        "upfront", "pay to start", "refundable deposit",
        "processing fee", "admin fee", "joining fee",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  {
    id:       "vague_compensation",
    title:    "Vague or Variable Compensation",
    category: "Financial",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      // e.g. "earn up to $X" or "$200-$2000" (very wide range = suspicious)
      const pattern = /earn\s+up\s+to|\$\d+\s*[-–]\s*\$\d{4,}/i;
      const found = text.match(pattern);
      return {
        matched:  !!found,
        evidence: found ? found[0] : null,
      };
    },
  },

  // ─── ADDITIONAL SCAM PATTERNS ─────────────────────────────────────────────

  {
    id:       "check_scam",
    title:    "Equipment/Check Advance Scam",
    category: "Financial",
    severity: "HIGH",
    points:   35,
    match: (text) => {
      const keywords = [
        "send you a check",
        "send a check",
        "mail you a check",
        "purchase equipment",
        "buy equipment",
        "equipment from our",
        "preferred vendor",
        "send the remaining",
        "wire the rest",
        "deposit the check",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  {
    id:       "must_own_equipment",
    title:    "Candidate Must Supply Own Equipment",
    category: "Legitimacy",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      const keywords = [
        "must have your own laptop",
        "must own a computer",
        "need your own device",
        "your own equipment",
        "own a smartphone",
        "personal computer required",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  {
    id:       "high_hourly_no_experience",
    title:    "High Hourly Rate With No Experience Required",
    category: "Financial",
    severity: "HIGH",
    points:   25,
    match: (text) => {
      // Flags high hourly pay ($25+/hr) combined with no experience
      const highPay = /\$[2-9]\d\/hr|\$[1-9]\d{2}\/hr|\$[2-9]\d\s*per\s*hour/i.test(text);
      const noExp   = /no experience (needed|required|necessary)/i.test(text);
      const matched = highPay && noExp;
      return {
        matched,
        evidence: matched
          ? "High hourly rate offered alongside 'no experience needed'"
          : null,
      };
    },
  },

  {
    id:       "urgent_hiring",
    title:    "Urgent Hiring Language",
    category: "Process",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      const keywords = [
        "urgent hiring",
        "urgently hiring",
        "urgent recruitment",
        "hire immediately",
        "need someone asap",
        "start today",
        "start tomorrow",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  // ─── IDENTITY FLAGS ───────────────────────────────────────────────────────

  {
    id:       "requests_bank_details",
    title:    "Requests Bank or Financial Details",
    category: "Identity",
    severity: "HIGH",
    points:   35,
    match: (text) => {
      const keywords = [
        "bank details", "bank account", "account number",
        "routing number", "credit card", "wire transfer",
        "send money", "western union", "crypto", "bitcoin",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  {
    id:       "requests_personal_info",
    title:    "Requests Sensitive Personal Information",
    category: "Identity",
    severity: "HIGH",
    points:   30,
    match: (text) => {
      const keywords = [
        "date of birth", "social security", "passport number",
        "national id", "id number", "driver's license",
        "full address", "mother's maiden",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  // ─── LEGITIMACY FLAGS ─────────────────────────────────────────────────────

  {
    id:       "no_company_info",
    title:    "No Verifiable Company Information",
    category: "Legitimacy",
    severity: "MEDIUM",
    points:   20,
    match: (text) => {
      // Check if there's no mention of a company website or LinkedIn
      const hasWebsite = /\b(www\.|https?:\/\/|\.com|\.org|\.io)\b/i.test(text);
      const hasLinkedIn = /linkedin/i.test(text);
      const matched = !hasWebsite && !hasLinkedIn;
      return {
        matched,
        evidence: matched
          ? "No company website or LinkedIn profile mentioned"
          : null,
      };
    },
  },

  {
    id:       "too_good_to_be_true",
    title:    "Too Good To Be True Claims",
    category: "Legitimacy",
    severity: "HIGH",
    points:   20,
    match: (text) => {
      const keywords = [
        "no experience needed", "no experience required",
        "anyone can do it", "work from anywhere",
        "be your own boss", "financial freedom",
        "unlimited earning", "passive income",
        "guaranteed income", "risk free",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  {
    id:       "vague_job_description",
    title:    "Vague or Generic Job Description",
    category: "Legitimacy",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      const keywords = [
        "data entry", "form filling", "envelope stuffing",
        "simple tasks", "easy work", "online tasks",
        "basic computer skills", "motivated individual",
      ];
      const lower = text.toLowerCase();
      const matches = keywords.filter(k => lower.includes(k));
      // Flag if 2 or more vague terms found together
      const matched = matches.length >= 2;
      return {
        matched,
        evidence: matched
          ? `Vague terms found: ${matches.slice(0,3).map(m => `"${m}"`).join(", ")}`
          : null,
      };
    },
  },

  // ─── CONTACT FLAGS ────────────────────────────────────────────────────────

  {
    id:       "suspicious_email",
    title:    "Suspicious or Generic Email Domain",
    category: "Contact",
    severity: "HIGH",
    points:   25,
    match: (text) => {
      // Legitimate companies use their own domain, not gmail/yahoo/hotmail
      const pattern = /[\w.+-]+@(gmail|yahoo|hotmail|outlook|aol|mail)\.(com|net|org)/i;
      const found = text.match(pattern);
      return {
        matched:  !!found,
        evidence: found ? found[0] : null,
      };
    },
  },

  {
    id:       "no_official_contact",
    title:    "No Official Company Contact Info",
    category: "Contact",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      // Real postings have a phone number or official email
      const hasPhone   = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text);
      const hasOfficialEmail = /[\w.+-]+@(?!gmail|yahoo|hotmail|outlook)[\w-]+\.(com|org|io|net|co)/i.test(text);
      const matched = !hasPhone && !hasOfficialEmail;
      return {
        matched,
        evidence: matched
          ? "No phone number or official company email found"
          : null,
      };
    },
  },

  // ─── PROCESS FLAGS ────────────────────────────────────────────────────────

  {
    id:       "no_interview",
    title:    "No Interview Process Mentioned",
    category: "Process",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      const hasInterview = /(interview|screening|assessment|hiring process|selection process)/i.test(text);
      const hasNoInterview = /(no interview|immediate(ly)? (hire|start|join)|hired on the spot)/i.test(text);
      const matched = !hasInterview || hasNoInterview;
      return {
        matched,
        evidence: hasNoInterview
          ? "Posting explicitly states no interview required"
          : matched ? "No interview process described" : null,
      };
    },
  },

  {
    id:       "urgency_pressure",
    title:    "Urgency or Pressure Tactics",
    category: "Process",
    severity: "MEDIUM",
    points:   15,
    match: (text) => {
      const keywords = [
        "limited spots", "limited positions", "act now",
        "apply immediately", "urgent hiring", "hiring now",
        "don't miss", "last chance", "positions filling fast",
        "respond within 24", "today only",
      ];
      const lower = text.toLowerCase();
      const found = keywords.find(k => lower.includes(k));
      return {
        matched:  !!found,
        evidence: found ? `"${found}" found in posting` : null,
      };
    },
  },

  // ─── LANGUAGE FLAGS ───────────────────────────────────────────────────────

  {
    id:       "excessive_caps",
    title:    "Excessive Capitalization / Unprofessional Tone",
    category: "Language",
    severity: "LOW",
    points:   10,
    match: (text) => {
      // Count words that are ALL CAPS (3+ letters)
      const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
      // Ignore common legitimate caps like USA, CEO, IT, HR, etc.
      const ignore = new Set(["USA","CEO","IT","HR","CV","ID","UK","US","LLC","Inc"]);
      const flagged = capsWords.filter(w => !ignore.has(w));
      const matched = flagged.length >= 4;
      return {
        matched,
        evidence: matched
          ? `Excessive caps: ${[...new Set(flagged)].slice(0,5).join(", ")}`
          : null,
      };
    },
  },

  {
    id:       "grammar_issues",
    title:    "Poor Grammar or Spelling Indicators",
    category: "Language",
    severity: "LOW",
    points:   10,
    match: (text) => {
      const patterns = [
        /\b(ur|u r|plz|pls|kindly revert|do the needful|revert back)\b/i,
        /!!+/,           // multiple exclamation marks
        /\$\$+/,         // multiple dollar signs
        /\.{4,}/,        // more than 3 dots
      ];
      const found = patterns.find(p => p.test(text));
      const matched = !!found;
      return {
        matched,
        evidence: matched
          ? "Unprofessional language patterns detected in posting"
          : null,
      };
    },
  },
];

// ─── Max possible rule score ──────────────────────────────────────────────────
// Used to normalize the rule score to 0-100.
// This is the sum of ALL rule points if every single rule fires.

export const MAX_RULE_SCORE = RULES.reduce((sum, r) => sum + r.points, 0);