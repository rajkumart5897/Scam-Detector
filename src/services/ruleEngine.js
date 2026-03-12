// src/services/ruleEngine.js
// Runs all rules against the job posting text and returns
// a normalized score (0-100) plus detailed red flag objects.

import { RULES, MAX_RULE_SCORE } from "../constants/rules";
import { SEVERITY_COLOR }        from "../constants/config";

// ─── Main function ────────────────────────────────────────────────────────────
// Call this with the raw job posting string.
// Returns a clean result object the hook can consume directly.

export function runRuleEngine(text) {
  if (!text || typeof text !== "string") {
    return buildEmptyResult();
  }

  const trimmed    = text.trim();
  const redFlags   = [];
  let   rawScore   = 0;

  // ── Run every rule ──────────────────────────────────────────────────────────
  for (const rule of RULES) {
    let matchResult;

    // Safety wrapper — a broken rule should never crash the whole engine
    try {
      matchResult = rule.match(trimmed);
    } catch (err) {
      console.warn(`Rule "${rule.id}" threw an error:`, err);
      continue;
    }

    if (matchResult.matched) {
      rawScore += rule.points;

      redFlags.push({
        id:         rule.id,
        title:      rule.title,
        category:   rule.category,
        severity:   rule.severity,
        points:     rule.points,
        evidence:   matchResult.evidence || "Pattern detected in posting",
        // Explanation and benchmark are generated here so the UI
        // doesn't need to know anything about the rule internals
        explanation:       buildExplanation(rule),
        industryBenchmark: buildBenchmark(rule),
        color:             SEVERITY_COLOR[rule.severity],
      });
    }
  }

  // ── Normalize score to 0-100 ────────────────────────────────────────────────
  // Raw score is sum of matched rule points.
  // We cap at MAX_RULE_SCORE then scale to 100.
  // Amplified normalization — penalizes multiple co-occurring flags harder
  const normalized = MAX_RULE_SCORE > 0
  ? Math.min(100, Math.round((rawScore / MAX_RULE_SCORE) * 100 * 1.8))
  : 0;

  // ── Sort red flags by severity ──────────────────────────────────────────────
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  redFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // ── Derive positives ────────────────────────────────────────────────────────
  const positives = derivePositives(trimmed, redFlags);

  return {
    rawScore,
    normalizedScore: normalized,
    redFlags,
    positives,
    totalRulesChecked: RULES.length,
    totalRulesFired:   redFlags.length,
    categoryBreakdown: buildCategoryBreakdown(redFlags),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Builds a human-readable explanation for each matched rule.
// Keeps the rules.js file clean (just patterns) while the
// UI-facing text lives here.

function buildExplanation(rule) {
  const explanations = {
    unrealistic_salary:
      "Legitimate employers post fixed salary ranges based on market rates. " +
      "Promises of very high weekly or daily earnings with no experience required " +
      "are a hallmark of advance-fee and work-from-home scams.",

    upfront_fee:
      "No legitimate employer charges candidates money to get a job. " +
      "Upfront fees disguised as training costs, registration, or starter kits " +
      "are a primary revenue mechanism for employment fraud operations.",

    vague_compensation:
      "Extremely wide salary ranges like $200–$2000 are used to attract " +
      "as many applicants as possible while obscuring the true (often zero) pay. " +
      "Legitimate postings list a specific band based on experience level.",

    requests_bank_details:
      "Requesting bank account or routing numbers before employment is established " +
      "is a major red flag. This information is used for identity theft or to " +
      "set up money mule accounts without the victim's full knowledge.",

    requests_personal_info:
      "Sensitive identifiers like date of birth, passport, or social security numbers " +
      "are never required at the application stage. Early collection of this data " +
      "is consistent with identity theft schemes.",

    no_company_info:
      "Legitimate employers always provide verifiable contact information including " +
      "a company website and professional email domain. Absence of these signals " +
      "either a fraudulent operation or an unvetted third-party posting.",

    too_good_to_be_true:
      "Phrases promising financial freedom, passive income, or guaranteed earnings " +
      "with no qualifications are psychological hooks used in recruitment fraud. " +
      "Real jobs require real skills and offer realistic compensation.",

    vague_job_description:
      "A legitimate job description includes specific responsibilities, required tools, " +
      "and measurable outcomes. Multiple vague terms signal that the posting is " +
      "designed to attract victims rather than qualified candidates.",

    suspicious_email:
      "Professional organizations communicate through their own domain email addresses. " +
      "Use of free consumer email services like Gmail or Yahoo for recruitment indicates " +
      "the posting is not from a legitimate registered business.",

    no_official_contact:
      "Legitimate companies always provide a verifiable phone number or official " +
      "company email. The absence of any traceable contact information makes it " +
      "impossible to verify the employer's identity.",

    no_interview:
      "All credible hiring processes involve at least one interview or assessment. " +
      "Offering immediate placement without any evaluation is a tactic to rush " +
      "victims into handing over fees or personal information before they research.",

    urgency_pressure:
      "Artificial scarcity and time pressure are classic manipulation tactics. " +
      "Legitimate hiring timelines are driven by business need, not countdown clocks. " +
      "Urgency language is designed to prevent applicants from doing due diligence.",

    excessive_caps:
      "Professional job postings follow standard business writing conventions. " +
      "Excessive capitalization is associated with low-effort, high-volume scam " +
      "postings that are copied and distributed across multiple platforms.",

    grammar_issues:
      "Postings from legitimate HR departments go through multiple review stages. " +
      "Informal abbreviations, multiple punctuation marks, and non-standard phrasing " +
      "suggest the posting was written hastily or by a non-professional operation.",
  };

  return (
    explanations[rule.id] ||
    `This pattern matches known characteristics of fraudulent job postings ` +
    `in the ${rule.category} category.`
  );
}

// Builds an industry benchmark string — what a real posting would do instead.

function buildBenchmark(rule) {
  const benchmarks = {
    unrealistic_salary:
      "Legitimate postings state a fixed annual CTC or hourly rate, e.g. " +
      "'₹6–8 LPA' or '$45–55/hr', benchmarked against industry standards.",

    upfront_fee:
      "Employers cover all onboarding and training costs. Candidates are " +
      "never asked to pay anything at any stage of the hiring process.",

    vague_compensation:
      "Reputable companies publish salary bands with clear minimum and maximum " +
      "figures, often tied to years of experience or job grade.",

    requests_bank_details:
      "Bank details are only collected after a formal offer letter is signed, " +
      "through a secure internal HR system, never via email.",

    requests_personal_info:
      "Only name, contact details, and work history are needed at application stage. " +
      "Government IDs are collected post-offer through verified HR portals.",

    no_company_info:
      "Legitimate postings include the company's official website, LinkedIn page, " +
      "registered address, and a named HR contact with a company email.",

    too_good_to_be_true:
      "Real job descriptions state specific, achievable outcomes and realistic " +
      "growth paths tied to performance metrics.",

    vague_job_description:
      "Professional postings list 5–10 specific daily responsibilities, required " +
      "tools or technologies, and measurable KPIs.",

    suspicious_email:
      "All correspondence comes from a verified company domain, e.g. " +
      "hr@companyname.com, not a free consumer email service.",

    no_official_contact:
      "The posting includes a direct phone number, official email, and often " +
      "a named hiring manager or recruiter for transparency.",

    no_interview:
      "Every hire goes through at least one structured interview. Most companies " +
      "have a defined multi-stage process: screen → assessment → panel → offer.",

    urgency_pressure:
      "Reputable companies communicate realistic timelines and allow candidates " +
      "sufficient time to research the role and company before applying.",

    excessive_caps:
      "Professional postings use standard sentence case, with capitals reserved " +
      "only for proper nouns, acronyms, and section headings.",

    grammar_issues:
      "HR and talent teams review postings multiple times before publishing. " +
      "Professional language, correct grammar, and formal tone are standard.",
  };

  return (
    benchmarks[rule.id] ||
    "Legitimate postings in this category follow industry-standard professional practices."
  );
}

// Looks for positive signals in the text — things that suggest legitimacy.
// Only returns positives that weren't already caught as red flags.

function derivePositives(text, redFlags) {
  const positives  = [];
  const firedIds   = new Set(redFlags.map(f => f.id));
  const lower      = text.toLowerCase();

  const checks = [
    {
      condition: /\b(www\.|https?:\/\/|\.com\/careers|\.io\/jobs)\b/i.test(text),
      signal:    "Company website or careers page linked",
      weight:    "STRONG",
    },
    {
      condition: /linkedin\.com/i.test(text),
      signal:    "LinkedIn profile or job listing referenced",
      weight:    "STRONG",
    },
    {
      condition: /(interview|technical round|assessment|screening call)/i.test(text),
      signal:    "Structured interview process described",
      weight:    "STRONG",
    },
    {
      condition: /[\w.+-]+@(?!gmail|yahoo|hotmail|outlook)[\w-]+\.(com|org|io|net|co)/i.test(text),
      signal:    "Official company email domain used",
      weight:    "STRONG",
    },
    {
      condition: /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text),
      signal:    "Verifiable phone number provided",
      weight:    "MODERATE",
    },
    {
      condition: /(bachelor|master|degree|certification|years of experience)/i.test(text),
      signal:    "Specific qualifications or experience required",
      weight:    "MODERATE",
    },
    {
      condition: /(health insurance|provident fund|paid leave|annual leave|pto|401k|esop)/i.test(text),
      signal:    "Standard employment benefits mentioned",
      weight:    "MODERATE",
    },
    {
      condition: /(hybrid|on.?site|remote|work from office)/i.test(text),
      signal:    "Clear work location or policy stated",
      weight:    "WEAK",
    },
    {
      condition: lower.includes("equity") || lower.includes("stock") || lower.includes("rsu"),
      signal:    "Equity or stock compensation mentioned",
      weight:    "MODERATE",
    },
  ];

  for (const check of checks) {
    if (check.condition) {
      positives.push({ signal: check.signal, weight: check.weight });
    }
  }

  return positives;
}

// Counts how many red flags belong to each category.
// Used by MetricsTab to render the category breakdown bar chart.

function buildCategoryBreakdown(redFlags) {
  const breakdown = {};
  for (const flag of redFlags) {
    breakdown[flag.category] = (breakdown[flag.category] || 0) + 1;
  }
  return breakdown;
}

// Returns a safe empty result when input is invalid.

function buildEmptyResult() {
  return {
    rawScore:          0,
    normalizedScore:   0,
    redFlags:          [],
    positives:         [],
    totalRulesChecked: RULES.length,
    totalRulesFired:   0,
    categoryBreakdown: {},
  };
}