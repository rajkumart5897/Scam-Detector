# backend/app.py
# Flask REST API server.
# Endpoints:
#   GET  /api/health          — server status + hardware info
#   POST /api/analyze         — run all 5 models on a job posting
#   GET  /api/history         — paginated analysis history
#   GET  /api/history/<id>    — single analysis detail
#   DELETE /api/history/<id>  — delete from history
#   GET  /api/metrics         — model performance stats
#   GET  /api/stats           — aggregate dashboard stats
#   POST /api/feedback        — mark result correct/wrong

import os
import sys
import json
import time
import uuid
from datetime import datetime

from flask      import Flask, request, jsonify
from flask_cors import CORS

# Local imports
from hardware  import detect_hardware
from database  import (
    init_db, save_analysis, get_history,
    get_analysis_by_id, get_model_performance,
    get_stats_summary, save_feedback, delete_analysis
)
from models    import init_models, predict_all, get_eval_metrics

# ─── Also import rule engine ──────────────────────────────────────────────────
# We replicate the rule engine in Python so the backend is self-contained.
# This means the frontend rule engine and backend rule engine run in parallel
# and their scores are combined.

import re

# ─── App setup ────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Global state ─────────────────────────────────────────────────────────────

hw_profile   = None
server_ready = False
start_time   = datetime.utcnow()

# ─── Startup ──────────────────────────────────────────────────────────────────

def startup():
    global hw_profile, server_ready

    print("\n" + "="*50)
    print("  SCAM DETECTOR BACKEND STARTING")
    print("="*50)

    # 1. Detect hardware
    hw_profile = detect_hardware()

    # 2. Init database
    init_db()

    # 3. Train / load all 5 models
    init_models(hw_profile)

    server_ready = True
    print("\n🚀 Server ready at http://localhost:5000\n")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Returns server status and hardware profile."""
    return jsonify({
        "status":       "ready" if server_ready else "starting",
        "uptime_sec":   (datetime.utcnow() - start_time).seconds,
        "hardware":     hw_profile,
        "models_ready": server_ready,
        "bert_ready":   _check_bert_ready(),
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Main endpoint. Accepts job posting text.
    Runs all 5 ML models + rule engine.
    Saves to database. Returns full result.
    """
    if not server_ready:
        return jsonify({"error": "Server still initializing"}), 503

    data     = request.get_json()
    job_text = data.get("text", "").strip()
    session  = data.get("session_id", str(uuid.uuid4()))

    if not job_text:
        return jsonify({"error": "No text provided"}), 400

    if len(job_text) < 20:
        return jsonify({"error": "Text too short"}), 400

    t_start = time.time()

    # ── Step 1: Rule engine ───────────────────────────────────────────────────
    rule_result = run_rule_engine(job_text)

    # ── Step 2: All 5 ML models ───────────────────────────────────────────────
    ml_result = predict_all(job_text)

    # ── Step 3: Combine rule + ML scores ──────────────────────────────────────
    rule_score     = rule_result["normalized_score"]
    ensemble_score = ml_result["model_scores"]["ensemble"]

    # 45% rules + 55% ML ensemble
    final_score = round(
        rule_score * 0.45 + ensemble_score * 0.55
    )
    final_score = max(0, min(100, final_score))

    # ── Step 4: Risk level ────────────────────────────────────────────────────
    risk_level = _get_risk_level(final_score)
    action_map = {
        "HIGH":   "AVOID",
        "MEDIUM": "PROCEED WITH CAUTION",
        "LOW":    "SAFE TO APPLY",
    }

    # ── Step 5: Build result ──────────────────────────────────────────────────
    total_ms = round((time.time() - t_start) * 1000, 2)

    result = {
        # Core
        "score":             final_score,
        "risk_level":        risk_level,
        "recommended_action":action_map[risk_level],
        "verdict":           _build_verdict(
                               final_score, risk_level,
                               rule_result["red_flags"]
                             ),
        "executive_summary": _build_summary(
                               final_score, risk_level,
                               rule_result
                             ),

        # Rule engine
        "red_flags":         rule_result["red_flags"],
        "positives":         rule_result["positives"],
        "scam_patterns":     rule_result["scam_patterns"],
        "rule_score":        rule_score,

        # ML models — individual
        "model_scores":      ml_result["model_scores"],
        "model_probs":       ml_result["model_probs"],
        "model_times":       ml_result["model_times"],
        "bert_available":    ml_result["bert_available"],

        # Evaluation metrics
        "eval_metrics":      ml_result["eval_metrics"],

        # Hardware
        "hardware_tier":     hw_profile["tier"],
        "hardware_profile":  hw_profile,

        # Meta
        "total_time_ms":     total_ms,
        "word_count":        len(job_text.split()),
        "char_count":        len(job_text),
        "analyzed_at":       datetime.utcnow().isoformat(),
        "session_id":        session,
    }

    # ── Step 6: Save to database ──────────────────────────────────────────────
    try:
        db_data = {
            **result,
            "job_text":   job_text,
            "final_score": final_score,
        }
        analysis_id      = save_analysis(db_data)
        result["id"]     = analysis_id
    except Exception as e:
        print(f"DB save error: {e}")
        result["id"] = None

    return jsonify(result), 200


@app.route("/api/history", methods=["GET"])
def history():
    """Returns paginated analysis history."""
    limit  = int(request.args.get("limit",  20))
    offset = int(request.args.get("offset",  0))
    rows   = get_history(limit=limit, offset=offset)
    stats  = get_stats_summary()
    return jsonify({
        "history": rows,
        "stats":   stats,
        "limit":   limit,
        "offset":  offset,
    })


@app.route("/api/history/<int:analysis_id>", methods=["GET"])
def history_detail(analysis_id):
    """Returns full detail of a single past analysis."""
    row = get_analysis_by_id(analysis_id)
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row)


@app.route("/api/history/<int:analysis_id>", methods=["DELETE"])
def history_delete(analysis_id):
    """Deletes an analysis from history."""
    success = delete_analysis(analysis_id)
    if success:
        return jsonify({"deleted": True})
    return jsonify({"error": "Delete failed"}), 500


@app.route("/api/metrics", methods=["GET"])
def metrics():
    """Returns model performance stats from DB + eval metrics."""
    db_perf    = get_model_performance()
    eval_m     = get_eval_metrics()
    return jsonify({
        "db_performance": db_perf,
        "eval_metrics":   eval_m,
        "hardware":       hw_profile,
    })


@app.route("/api/stats", methods=["GET"])
def stats():
    """Returns aggregate dashboard stats."""
    return jsonify(get_stats_summary())


@app.route("/api/feedback", methods=["POST"])
def feedback():
    """User marks an analysis result as correct or incorrect."""
    data        = request.get_json()
    analysis_id = data.get("analysis_id")
    verdict     = data.get("verdict")       # 'correct' or 'incorrect'
    actual      = data.get("actual_label")  # 'scam' or 'legit'
    notes       = data.get("notes", "")

    if not analysis_id or verdict not in ("correct", "incorrect"):
        return jsonify({"error": "Invalid input"}), 400

    success = save_feedback(analysis_id, verdict, actual, notes)
    return jsonify({"saved": success})


# ─── Rule engine (Python mirror of frontend rules.js) ─────────────────────────

RULES = [
    {
        "id": "unrealistic_salary", "title": "Unrealistic Salary Promise",
        "category": "Financial",   "severity": "HIGH", "points": 25,
        "pattern": r"\$[\d,]+\s*(/|\s*per\s*)(week|day|hour|daily|weekly)",
    },
    {
        "id": "upfront_fee", "title": "Upfront Payment / Training Fee",
        "category": "Financial",  "severity": "HIGH", "points": 30,
        "keywords": [
            "training fee","registration fee","starter kit","upfront",
            "pay to start","refundable deposit","processing fee",
            "admin fee","joining fee",
        ],
    },
    {
        "id": "requests_bank_details", "title": "Requests Bank Details",
        "category": "Identity",   "severity": "HIGH", "points": 35,
        "keywords": [
            "bank details","bank account","account number","routing number",
            "credit card","wire transfer","send money","western union",
            "crypto","bitcoin",
        ],
    },
    {
        "id": "requests_personal_info", "title": "Requests Personal Info",
        "category": "Identity",   "severity": "HIGH", "points": 30,
        "keywords": [
            "date of birth","social security","passport number",
            "national id","id number","driver's license",
            "full address","mother's maiden",
        ],
    },
    {
        "id": "check_scam", "title": "Equipment / Check Advance Scam",
        "category": "Financial",  "severity": "HIGH", "points": 35,
        "keywords": [
            "send you a check","send a check","mail you a check",
            "purchase equipment","buy equipment","equipment from our",
            "preferred vendor","send the remaining","wire the rest",
            "deposit the check",
        ],
    },
    {
        "id": "suspicious_email", "title": "Suspicious Email Domain",
        "category": "Contact",    "severity": "HIGH", "points": 25,
        "pattern": r"[\w.+-]+@(gmail|yahoo|hotmail|outlook|aol|mail)\.(com|net|org)",
    },
    {
        "id": "too_good_to_be_true", "title": "Too Good To Be True",
        "category": "Legitimacy", "severity": "HIGH", "points": 20,
        "keywords": [
            "no experience needed","no experience required",
            "anyone can do it","financial freedom",
            "unlimited earning","passive income",
            "guaranteed income","risk free",
        ],
    },
    {
        "id": "no_company_info", "title": "No Verifiable Company Info",
        "category": "Legitimacy", "severity": "MEDIUM", "points": 20,
        "check": "no_company",
    },
    {
        "id": "no_interview", "title": "No Interview Process",
        "category": "Process",    "severity": "MEDIUM", "points": 15,
        "check": "no_interview",
    },
    {
        "id": "urgency_pressure", "title": "Urgency / Pressure Tactics",
        "category": "Process",    "severity": "MEDIUM", "points": 15,
        "keywords": [
            "limited spots","act now","apply immediately",
            "urgent hiring","don't miss","positions filling fast",
            "respond within 24","today only",
        ],
    },
    {
        "id": "vague_job_description", "title": "Vague Job Description",
        "category": "Legitimacy", "severity": "MEDIUM", "points": 15,
        "keywords": [
            "data entry","form filling","envelope stuffing",
            "simple tasks","easy work","basic computer skills",
        ],
        "min_matches": 2,
    },
    {
        "id": "high_pay_no_exp",
        "title": "High Pay With No Experience Required",
        "category": "Financial",  "severity": "HIGH", "points": 25,
        "check": "high_pay_no_exp",
    },
    {
        "id": "must_own_equipment", "title": "Must Supply Own Equipment",
        "category": "Legitimacy", "severity": "MEDIUM", "points": 15,
        "keywords": [
            "must have your own laptop","must own a computer",
            "need your own device","your own equipment",
        ],
    },
]

MAX_RULE_SCORE = sum(r["points"] for r in RULES)

SCAM_PATTERN_MAP = {
    "upfront_fee":          "Advance Fee Fraud",
    "requests_bank_details":"Money Mule Recruitment",
    "requests_personal_info":"Identity Theft Scheme",
    "unrealistic_salary":   "Work-From-Home Income Scam",
    "check_scam":           "Equipment / Check Advance Scam",
    "no_interview":         "Impersonation / Fake Employer",
    "suspicious_email":     "Phishing via Fake Job Offer",
    "too_good_to_be_true":  "Get-Rich-Quick Employment Scam",
}


def run_rule_engine(text: str) -> dict:
    lower      = text.lower()
    red_flags  = []
    raw_score  = 0

    for rule in RULES:
        matched  = False
        evidence = None

        # Pattern match
        if "pattern" in rule:
            m = re.search(rule["pattern"], text, re.IGNORECASE)
            if m:
                matched  = True
                evidence = m.group(0)

        # Keyword match
        elif "keywords" in rule:
            min_m = rule.get("min_matches", 1)
            hits  = [k for k in rule["keywords"] if k in lower]
            if len(hits) >= min_m:
                matched  = True
                evidence = f'"{hits[0]}" found in posting'

        # Custom checks
        elif "check" in rule:
            if rule["check"] == "no_company":
                has_web = bool(re.search(
                    r"\b(www\.|https?://|\.com|\.org|\.io)\b",
                    text, re.IGNORECASE
                ))
                if not has_web:
                    matched  = True
                    evidence = "No company website mentioned"

            elif rule["check"] == "no_interview":
                has_int = bool(re.search(
                    r"(interview|screening|assessment)", text, re.IGNORECASE
                ))
                no_int  = bool(re.search(
                    r"(no interview|immediate(ly)? (hire|start))",
                    text, re.IGNORECASE
                ))
                if not has_int or no_int:
                    matched  = True
                    evidence = "No interview process described"

            elif rule["check"] == "high_pay_no_exp":
                high = bool(re.search(
                    r"\$[2-9]\d/hr|\$[2-9]\d\s*per\s*hour",
                    text, re.IGNORECASE
                ))
                no_exp = bool(re.search(
                    r"no experience (needed|required)", text, re.IGNORECASE
                ))
                if high and no_exp:
                    matched  = True
                    evidence = "High hourly rate + no experience required"

        if matched:
            raw_score += rule["points"]
            red_flags.append({
                "id":       rule["id"],
                "title":    rule["title"],
                "category": rule["category"],
                "severity": rule["severity"],
                "points":   rule["points"],
                "evidence": evidence or "Pattern detected",
                "explanation":       _get_explanation(rule["id"]),
                "industryBenchmark": _get_benchmark(rule["id"]),
                "color": (
                    "#ef4444" if rule["severity"] == "HIGH" else
                    "#f59e0b" if rule["severity"] == "MEDIUM" else
                    "#94a3b8"
                ),
            })

    # Normalize with amplification
    normalized = min(100, round((raw_score / MAX_RULE_SCORE) * 100 * 1.8)) \
                 if MAX_RULE_SCORE > 0 else 0

    # Sort by severity
    sev_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    red_flags.sort(key=lambda f: sev_order[f["severity"]])

    # Positives
    positives = _derive_positives(text, red_flags)

    # Scam patterns
    fired_ids    = {f["id"] for f in red_flags}
    scam_patterns = list({
        v for k, v in SCAM_PATTERN_MAP.items() if k in fired_ids
    })

    return {
        "normalized_score":  normalized,
        "raw_score":         raw_score,
        "red_flags":         red_flags,
        "positives":         positives,
        "scam_patterns":     scam_patterns,
        "rules_checked":     len(RULES),
        "rules_fired":       len(red_flags),
    }


def _derive_positives(text, red_flags):
    positives = []
    fired_ids = {f["id"] for f in red_flags}
    checks    = [
        (r"\b(www\.|https?://|\.com/careers)", "Company website linked",         "STRONG"),
        (r"linkedin\.com",                      "LinkedIn profile referenced",    "STRONG"),
        (r"(interview|technical round)",        "Structured interview described", "STRONG"),
        (r"[\w.+-]+@(?!gmail|yahoo|hotmail)"
         r"[\w-]+\.(com|org|io)",               "Official company email",         "STRONG"),
        (r"\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}","Phone number provided",         "MODERATE"),
        (r"(bachelor|degree|years of experience)","Specific qualifications required","MODERATE"),
        (r"(health insurance|paid leave|401k|esop)","Benefits mentioned",         "MODERATE"),
        (r"(hybrid|on.?site|remote policy)",    "Clear work policy stated",       "WEAK"),
    ]
    for pattern, signal, weight in checks:
        if re.search(pattern, text, re.IGNORECASE):
            positives.append({"signal": signal, "weight": weight})
    return positives


def _get_risk_level(score: int) -> str:
    if score >= 51: return "HIGH"
    if score >= 29: return "MEDIUM"
    return "LOW"


def _build_verdict(score, risk, red_flags):
    count = len(red_flags)
    if risk == "HIGH":
        return (f"High fraud probability ({score}/100) — "
                f"{count} red flags detected; do not apply.")
    if risk == "MEDIUM":
        return (f"Moderate risk ({score}/100) — "
                f"{count} signals detected; verify independently.")
    return f"Low fraud probability ({score}/100) — appears legitimate."


def _build_summary(score, risk, rule_result):
    flags   = rule_result["red_flags"]
    pos     = rule_result["positives"]
    count   = len(flags)
    high_c  = sum(1 for f in flags if f["severity"] == "HIGH")

    if risk == "HIGH":
        return (
            f"This posting exhibits {count} distinct fraud indicators "
            f"including {high_c} high-severity signals. "
            f"The combined ML ensemble and rule-based analysis assigns "
            f"a scam probability of {score}/100. "
            f"Applicants are strongly advised to avoid this posting "
            f"and report it to the relevant job platform."
        )
    if risk == "MEDIUM":
        return (
            f"This posting contains {count} cautionary signals "
            f"that warrant further verification. "
            f"A scam probability score of {score}/100 suggests moderate risk. "
            f"Independent verification of the company is strongly recommended."
        )
    return (
        f"This posting demonstrates {len(pos)} positive legitimacy signals "
        f"and scored {score}/100 on the scam probability scale. "
        f"{'No significant red flags were detected.' if count == 0 else f'{count} minor flags noted.'} "
        f"Standard due diligence is always recommended."
    )


def _get_explanation(rule_id):
    explanations = {
        "unrealistic_salary":
            "Legitimate employers post fixed salary ranges. "
            "Promises of very high weekly earnings are a hallmark of scams.",
        "upfront_fee":
            "No legitimate employer charges candidates money to get a job. "
            "Upfront fees are a primary revenue mechanism for employment fraud.",
        "requests_bank_details":
            "Requesting bank details before employment is a major red flag. "
            "This information is used for identity theft or money mule schemes.",
        "requests_personal_info":
            "Sensitive identifiers are never required at application stage. "
            "Early collection is consistent with identity theft schemes.",
        "check_scam":
            "Sending a check to buy equipment is a classic advance fee scam. "
            "The check will bounce after you wire money back.",
        "suspicious_email":
            "Professional organizations use their own domain email. "
            "Free email services signal a non-legitimate operation.",
        "too_good_to_be_true":
            "Phrases promising financial freedom or guaranteed earnings "
            "are psychological hooks used in recruitment fraud.",
        "no_company_info":
            "Legitimate employers provide verifiable website and contact info. "
            "Absence signals a fraudulent or unvetted operation.",
        "no_interview":
            "All credible hiring involves at least one interview. "
            "Immediate placement is used to rush victims into paying fees.",
        "urgency_pressure":
            "Artificial scarcity is a classic manipulation tactic. "
            "It prevents applicants from doing due diligence.",
        "vague_job_description":
            "A legitimate job description includes specific responsibilities. "
            "Vague terms signal the posting targets victims not candidates.",
        "high_pay_no_exp":
            "High pay with zero requirements is unrealistic. "
            "Real jobs require real skills and offer realistic pay.",
        "must_own_equipment":
            "Legitimate employers provide necessary equipment. "
            "Requiring candidates to own equipment is a scam signal.",
    }
    return explanations.get(
        rule_id,
        "This pattern matches known characteristics of fraudulent postings."
    )


def _get_benchmark(rule_id):
    benchmarks = {
        "unrealistic_salary":
            "Legitimate postings state a fixed annual CTC benchmarked to industry.",
        "upfront_fee":
            "Employers cover all onboarding costs. Candidates never pay anything.",
        "requests_bank_details":
            "Bank details only collected post-offer via secure HR systems.",
        "requests_personal_info":
            "Only name and contact details needed at application stage.",
        "check_scam":
            "Equipment is provided by the employer on day one of employment.",
        "suspicious_email":
            "All correspondence from a verified company domain email.",
        "too_good_to_be_true":
            "Real postings state specific, achievable outcomes tied to performance.",
        "no_company_info":
            "Legitimate postings include company website, address, named HR contact.",
        "no_interview":
            "Every hire goes through structured multi-stage interview process.",
        "urgency_pressure":
            "Reputable companies communicate realistic timelines without pressure.",
        "vague_job_description":
            "Professional postings list 5-10 specific responsibilities and KPIs.",
        "high_pay_no_exp":
            "Competitive salaries are tied to specific skills and experience levels.",
        "must_own_equipment":
            "Employers provide all tools, hardware, and software from day one.",
    }
    return benchmarks.get(
        rule_id,
        "Legitimate postings follow industry-standard professional practices."
    )


def _check_bert_ready():
    try:
        from models import _bert_ready
        return _bert_ready
    except Exception:
        return False


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    startup()
    app.run(
        host    = "0.0.0.0",
        port    = 5000,
        debug   = False,   # debug=True causes double startup
        threaded= True,
    )
