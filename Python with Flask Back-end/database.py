# backend/database.py
# SQLite database setup and all query functions.
# Tables:
#   analyses        — every scan ever run
#   model_performance — live F1/accuracy per model
#   feedback        — user marks result correct/wrong
#   history         — summarized view for frontend history tab

import sqlite3
import json
import os
from datetime import datetime

# ─── DB path ──────────────────────────────────────────────────────────────────
# Creates scam_detector.db in the backend folder
DB_PATH = os.path.join(os.path.dirname(__file__), "scam_detector.db")

# ─── Connection helper ────────────────────────────────────────────────────────

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL")  # faster writes
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

# ─── Init — run once on Flask startup ─────────────────────────────────────────

def init_db():
    """Creates all tables if they don't exist."""
    conn = get_connection()
    c    = conn.cursor()

    # ── analyses ──────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            job_text            TEXT    NOT NULL,
            job_title           TEXT,
            final_score         INTEGER NOT NULL,
            risk_level          TEXT    NOT NULL,
            recommended_action  TEXT    NOT NULL,

            -- Individual model scores (0-100)
            lr_score            REAL,
            nb_score            REAL,
            rf_score            REAL,
            svm_score           REAL,
            bert_score          REAL,
            rule_score          REAL,
            ensemble_score      REAL,

            -- Model probabilities (raw 0.0-1.0)
            lr_prob             REAL,
            nb_prob             REAL,
            rf_prob             REAL,
            svm_prob            REAL,
            bert_prob           REAL,

            -- Timing (ms per model)
            lr_time_ms          REAL,
            nb_time_ms          REAL,
            rf_time_ms          REAL,
            svm_time_ms         REAL,
            bert_time_ms        REAL,

            -- Red flags
            red_flags_count     INTEGER,
            high_flags          INTEGER,
            medium_flags        INTEGER,
            low_flags           INTEGER,
            red_flags_json      TEXT,    -- full JSON array

            -- Positive signals
            positives_count     INTEGER,
            positives_json      TEXT,

            -- Scam patterns matched
            scam_patterns_json  TEXT,

            -- Hardware context
            hardware_tier       TEXT,
            bert_available      INTEGER DEFAULT 0,

            -- Meta
            word_count          INTEGER,
            char_count          INTEGER,
            analyzed_at         TEXT    NOT NULL,
            session_id          TEXT    -- groups analyses in same session
        )
    """)

    # ── model_performance ─────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS model_performance (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            model_name          TEXT    NOT NULL UNIQUE,
            precision_score     REAL,
            recall_score        REAL,
            f1_score            REAL,
            accuracy            REAL,
            total_predictions   INTEGER DEFAULT 0,
            correct_predictions INTEGER DEFAULT 0,
            avg_confidence      REAL,
            last_updated        TEXT
        )
    """)

    # ── feedback ──────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id         INTEGER NOT NULL,
            user_verdict        TEXT    NOT NULL,  -- 'correct' or 'incorrect'
            actual_label        TEXT,              -- 'scam' or 'legit'
            notes               TEXT,
            recorded_at         TEXT    NOT NULL,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id)
        )
    """)

    # ── Seed model_performance rows ───────────────────────────────────────────
    models = [
        "Logistic Regression",
        "Naive Bayes",
        "Random Forest",
        "SVM",
        "DistilBERT",
    ]
    for m in models:
        c.execute("""
            INSERT OR IGNORE INTO model_performance
                (model_name, total_predictions, correct_predictions, last_updated)
            VALUES (?, 0, 0, ?)
        """, (m, datetime.utcnow().isoformat()))

    conn.commit()
    conn.close()
    print("✅ Database initialized at:", DB_PATH)

# ─── Save analysis ────────────────────────────────────────────────────────────

def save_analysis(data: dict) -> int:
    """
    Saves a full analysis result to the database.
    Returns the new row ID.
    """
    conn = get_connection()
    c    = conn.cursor()

    red_flags = data.get("red_flags", [])
    positives = data.get("positives", [])
    patterns  = data.get("scam_patterns", [])

    # Extract job title from first line if possible
    job_text  = data.get("job_text", "")
    job_title = job_text.strip().split("\n")[0][:120] if job_text else None

    scores    = data.get("model_scores", {})
    probs     = data.get("model_probs",  {})
    times     = data.get("model_times",  {})

    c.execute("""
        INSERT INTO analyses (
            job_text, job_title, final_score, risk_level,
            recommended_action,
            lr_score, nb_score, rf_score, svm_score, bert_score,
            rule_score, ensemble_score,
            lr_prob, nb_prob, rf_prob, svm_prob, bert_prob,
            lr_time_ms, nb_time_ms, rf_time_ms, svm_time_ms, bert_time_ms,
            red_flags_count, high_flags, medium_flags, low_flags,
            red_flags_json, positives_count, positives_json,
            scam_patterns_json, hardware_tier, bert_available,
            word_count, char_count, analyzed_at, session_id
        ) VALUES (
            ?,?,?,?,?,
            ?,?,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )
    """, (
        job_text,
        job_title,
        data.get("final_score", 0),
        data.get("risk_level", "LOW"),
        data.get("recommended_action", "SAFE TO APPLY"),

        scores.get("lr"),
        scores.get("nb"),
        scores.get("rf"),
        scores.get("svm"),
        scores.get("bert"),
        scores.get("rules"),
        scores.get("ensemble"),

        probs.get("lr"),
        probs.get("nb"),
        probs.get("rf"),
        probs.get("svm"),
        probs.get("bert"),

        times.get("lr"),
        times.get("nb"),
        times.get("rf"),
        times.get("svm"),
        times.get("bert"),

        len(red_flags),
        sum(1 for f in red_flags if f.get("severity") == "HIGH"),
        sum(1 for f in red_flags if f.get("severity") == "MEDIUM"),
        sum(1 for f in red_flags if f.get("severity") == "LOW"),
        json.dumps(red_flags),

        len(positives),
        json.dumps(positives),
        json.dumps(patterns),

        data.get("hardware_tier", "LOW"),
        1 if data.get("bert_available") else 0,

        data.get("word_count", 0),
        data.get("char_count", 0),
        datetime.utcnow().isoformat(),
        data.get("session_id"),
    ))

    analysis_id = c.lastrowid
    conn.commit()
    conn.close()

    # Update model performance stats
    _update_model_performance(data)

    return analysis_id

# ─── Get history ──────────────────────────────────────────────────────────────

def get_history(limit: int = 20, offset: int = 0) -> list:
    """
    Returns paginated analysis history for the frontend history tab.
    Ordered newest first.
    """
    conn = get_connection()
    c    = conn.cursor()

    c.execute("""
        SELECT
            id,
            job_title,
            final_score,
            risk_level,
            recommended_action,
            red_flags_count,
            high_flags,
            bert_available,
            hardware_tier,
            word_count,
            analyzed_at,
            lr_score, nb_score, rf_score, svm_score, bert_score,
            scam_patterns_json
        FROM analyses
        ORDER BY analyzed_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))

    rows = c.fetchall()
    conn.close()

    result = []
    for row in rows:
        r = dict(row)
        r["scam_patterns"] = json.loads(r.pop("scam_patterns_json") or "[]")
        result.append(r)
    return result

# ─── Get single analysis ──────────────────────────────────────────────────────

def get_analysis_by_id(analysis_id: int) -> dict:
    """Returns full analysis detail including red flags."""
    conn = get_connection()
    c    = conn.cursor()

    c.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = c.fetchone()
    conn.close()

    if not row:
        return None

    r = dict(row)
    r["red_flags"]     = json.loads(r.pop("red_flags_json")     or "[]")
    r["positives"]     = json.loads(r.pop("positives_json")     or "[]")
    r["scam_patterns"] = json.loads(r.pop("scam_patterns_json") or "[]")
    return r

# ─── Get model performance ────────────────────────────────────────────────────

def get_model_performance() -> list:
    """Returns live performance stats for all 5 models."""
    conn = get_connection()
    c    = conn.cursor()
    c.execute("SELECT * FROM model_performance ORDER BY model_name")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

# ─── Save feedback ────────────────────────────────────────────────────────────

def save_feedback(analysis_id: int, verdict: str,
                  actual_label: str = None, notes: str = None) -> bool:
    """User marks an analysis as correct or incorrect."""
    conn = get_connection()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO feedback
                (analysis_id, user_verdict, actual_label, notes, recorded_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            analysis_id, verdict, actual_label,
            notes, datetime.utcnow().isoformat()
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"Feedback save error: {e}")
        return False
    finally:
        conn.close()

# ─── Get stats summary ────────────────────────────────────────────────────────

def get_stats_summary() -> dict:
    """
    Returns aggregate stats for the dashboard.
    Total scans, scam rate, avg score, model accuracy etc.
    """
    conn = get_connection()
    c    = conn.cursor()

    c.execute("SELECT COUNT(*) as total FROM analyses")
    total = c.fetchone()["total"]

    c.execute("""
        SELECT
            COUNT(*) as scam_count
        FROM analyses
        WHERE risk_level IN ('HIGH', 'MEDIUM')
    """)
    scam_count = c.fetchone()["scam_count"]

    c.execute("SELECT AVG(final_score) as avg_score FROM analyses")
    avg_score  = c.fetchone()["avg_score"] or 0

    c.execute("""
        SELECT
            SUM(CASE WHEN risk_level='HIGH'   THEN 1 ELSE 0 END) as high_count,
            SUM(CASE WHEN risk_level='MEDIUM' THEN 1 ELSE 0 END) as med_count,
            SUM(CASE WHEN risk_level='LOW'    THEN 1 ELSE 0 END) as low_count
        FROM analyses
    """)
    dist = dict(c.fetchone())

    c.execute("""
        SELECT COUNT(*) as feedback_count FROM feedback
        WHERE user_verdict = 'correct'
    """)
    correct_feedback = c.fetchone()["feedback_count"]

    conn.close()

    return {
        "total_analyses":    total,
        "scam_count":        scam_count,
        "legit_count":       total - scam_count,
        "scam_rate_pct":     round((scam_count / total * 100) if total > 0 else 0, 1),
        "avg_scam_score":    round(avg_score, 1),
        "risk_distribution": dist,
        "correct_feedback":  correct_feedback,
    }

# ─── Delete analysis ──────────────────────────────────────────────────────────

def delete_analysis(analysis_id: int) -> bool:
    """Deletes an analysis and its feedback from history."""
    conn = get_connection()
    c    = conn.cursor()
    try:
        c.execute("DELETE FROM feedback WHERE analysis_id = ?", (analysis_id,))
        c.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Delete error: {e}")
        return False
    finally:
        conn.close()

# ─── Private: update model performance ───────────────────────────────────────

def _update_model_performance(data: dict):
    """
    Updates running accuracy stats for each model after every prediction.
    Uses the ensemble final score as ground truth proxy.
    """
    conn  = get_connection()
    c     = conn.cursor()
    probs = data.get("model_probs", {})

    # Ground truth proxy: if final score >= 50 → scam (1), else legit (0)
    ground_truth = 1 if data.get("final_score", 0) >= 50 else 0

    model_map = {
        "Logistic Regression": probs.get("lr"),
        "Naive Bayes":         probs.get("nb"),
        "Random Forest":       probs.get("rf"),
        "SVM":                 probs.get("svm"),
        "DistilBERT":          probs.get("bert"),
    }

    for model_name, prob in model_map.items():
        if prob is None:
            continue

        predicted = 1 if prob >= 0.5 else 0
        correct   = 1 if predicted == ground_truth else 0

        c.execute("""
            UPDATE model_performance
            SET
                total_predictions   = total_predictions + 1,
                correct_predictions = correct_predictions + ?,
                accuracy = CAST(correct_predictions + ? AS REAL)
                         / (total_predictions + 1),
                avg_confidence = CASE
                    WHEN avg_confidence IS NULL THEN ?
                    ELSE (avg_confidence + ?) / 2.0
                END,
                last_updated = ?
            WHERE model_name = ?
        """, (
            correct, correct,
            prob, prob,
            datetime.utcnow().isoformat(),
            model_name
        ))

    conn.commit()
    conn.close()