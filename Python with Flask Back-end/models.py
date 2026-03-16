# backend/models.py
# All 5 ML models defined, trained, and exposed here.
# Parameters are dynamically set based on hardware tier.
# Models 1-4: scikit-learn (train instantly on startup)
# Model 5:    DistilBERT   (loads pretrained, no training)

import time
import re
import numpy as np
from sklearn.linear_model    import LogisticRegression
from sklearn.naive_bayes     import GaussianNB
from sklearn.ensemble        import RandomForestClassifier
from sklearn.svm             import SVC
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline        import Pipeline
from sklearn.preprocessing   import StandardScaler
from sklearn.metrics         import (
    precision_score, recall_score,
    f1_score, accuracy_score,
    confusion_matrix
)

# ─── Training data ────────────────────────────────────────────────────────────
# Same dataset as frontend trainingData.js but used by Python models.
# Label: 1 = scam, 0 = legitimate

TRAINING_DATA = [
    # ── SCAM (label 1) ────────────────────────────────────────────────────────
    (1, "Work From Home Earn $5000 week No experience needed Data Entry "
        "Specialists processing simple online forms training fee $49.99 "
        "send bank details to jobs@quickcash-online.net no interviews immediate start"),
    (1, "URGENT HIRING Make $800 daily from home No skills required click ads "
        "fill forms Limited spots apply NOW send full name address date of birth "
        "earn2day@gmail.com Guaranteed income every week financial freedom"),
    (1, "Online Data Entry Job Earn $200 to $2000 per week Anyone can do it "
        "work from anywhere no experience required simple tasks typing copy paste "
        "Registration fee $25 fully refundable contact fastjobs247@yahoo.com"),
    (1, "Earn money from home processing insurance claims no experience necessary "
        "full training provided Starter kit fee $75 Earn up to $3000 per week "
        "send national ID and bank account number reply within 24 hours"),
    (1, "Part time work from home opportunity Earn $500 daily no qualifications "
        "needed basic computer skills envelope stuffing form filling immediate hire "
        "no interview send details to workfromhome99@hotmail.com unlimited earning"),
    (1, "MAKE MONEY FAST online business opportunity work 2 hours earn $10000 month "
        "be your own boss passive income guaranteed joining fee $99 risk free "
        "act now before spots run out positions filling fast"),
    (1, "Virtual assistant needed urgently Earn $400 to $4000 per week no experience "
        "just computer and internet process payments transfer funds send bank details "
        "routing number hired on spot no interview needed"),
    (1, "Work from home customer support $50 per hour no experience required "
        "purchase software kit $150 easy tasks flexible hours email full address "
        "date of birth support@easyworkjobs.net today only 5 positions remaining"),
    (1, "Home based data processing job Earn $1000 to $5000 weekly simple online "
        "tasks no degree required anyone can apply admin fee $30 required "
        "send social security number bank details immediate placement no screening"),
    (1, "Freelance recruiter earn commission $500 to $3000 per week no experience "
        "work from phone receive payments forward to clients via western union bitcoin "
        "flexible hours unlimited earning contact moneyrecruit@gmail.com hiring now"),
    (1, "Online survey jobs get paid $200 per survey no experience work anytime "
        "sign up fee $19.99 earn passive income weekly financial freedom limited "
        "positions email surveycash2024@yahoo.com bank account to receive payments"),
    (1, "Mystery shopper needed urgently earn $400 per day no experience required "
        "send check to purchase items keep $100 as fee wire rest back western union "
        "no interview immediate start contact mysteryshop@gmail.com today"),
    (1, "Work at home assembling products earn $800 weekly simple craft assembly "
        "no experience materials kit costs $65 upfront refundable send full name "
        "home address date of birth crafthome@outlook.com positions filling fast"),
    (1, "Digital marketing assistant earn up to $5000 month no degree smartphone "
        "processing fee $45 access training portal send passport number background "
        "verification no interview needed start earning today limited spots"),
    (1, "HIRING NOW Amazon product reviewer get paid $300 per day work from home "
        "no experience registration $29 guaranteed weekly payments bank details "
        "email amazonreviewer@gmail.com immediately risk free opportunity"),
    (1, "Administrative assistant data entry remote urgent hiring work from home "
        "no experience needed high pay $30 per hour must have own laptop "
        "send check purchase equipment preferred vendor immediate start no interview"),
    (1, "Remote customer service $25 per hour no experience work from home "
        "mail check equipment purchase buy from preferred vendor keep the rest "
        "no interview needed start today contact remotejobs@gmail.com"),
    (1, "Data entry specialist work from home high pay $35 per hour no experience "
        "must have own computer send check cover setup costs wire remaining amount "
        "back after purchase urgent hiring now"),

    # ── LEGIT (label 0) ───────────────────────────────────────────────────────
    (0, "Software Engineer Frontend React Company Stripe Bengaluru India Hybrid "
        "3 years React experience TypeScript Jest Cypress salary 28 to 38 LPA "
        "equity benefits apply stripe.com careers interview phone screen "
        "technical assessment 3 virtual rounds"),
    (0, "Data Analyst Deloitte Mumbai India full time permanent Bachelor degree "
        "Statistics Computer Science 2 years SQL Python Tableau responsibilities "
        "building dashboards presenting insights stakeholders compensation 8 to 12 LPA "
        "apply deloitte.com careers structured interview HR panel rounds"),
    (0, "Product Manager Flipkart Bengaluru Karnataka 5 years product management "
        "MBA preferred own roadmap logistics product vertical work engineering "
        "design data science CTC 25 to 35 LPA apply flipkart.com careers "
        "interview case study product sense leadership round"),
    (0, "Junior Backend Developer Zoho Corporation Chennai Tamil Nadu freshers "
        "welcome Java Python REST APIs MySQL training provided salary 4.5 to 6 LPA "
        "5 day work week apply zoho.com careers written test two technical interviews"),
    (0, "UX Designer Adobe Noida Uttar Pradesh hybrid portfolio required 3 years "
        "UX design Figma Adobe XD user research lead design Creative Cloud mobile "
        "salary 18 to 25 LPA performance bonus careers.adobe.com "
        "interview portfolio review design challenge culture fit round"),
    (0, "Machine Learning Engineer Google India Hyderabad MS PhD Computer Science "
        "ML deep learning TensorFlow PyTorch 3 years industry experience "
        "competitive compensation RSUs health insurance learning budget "
        "careers.google.com technical rounds coding system design"),
    (0, "Content Writer Times of India Digital remote India 2 years writing "
        "strong command English produce 3 to 5 articles daily tech business "
        "salary 3.5 to 5 LPA byline credit send portfolio resume careers@timesinternet.in "
        "editorial test interview senior editor"),
    (0, "HR Executive Infosys BPM Pune Maharashtra Bachelor degree 1 to 3 years "
        "HR experience recruitment coordination onboarding HRMS management "
        "CTC 3 to 5 LPA annual appraisal infosys.com careers assessment test "
        "HR round manager interview"),
    (0, "Cybersecurity Analyst Wipro Bengaluru remote CEH CISSP certification "
        "3 years SOC experience monitor SIEM tools respond incidents vulnerability "
        "assessments salary 10 to 16 LPA shift allowance health life insurance "
        "careers.wipro.com technical screening aptitude test panel interview"),
    (0, "Accountant KPMG India Delhi NCR CA qualification 2 years post qualification "
        "client audits financial statements tax compliance remuneration 8 to 12 LPA "
        "apply kpmg.com in careers aptitude test technical interview partner round"),
    (0, "DevOps Engineer Razorpay Bengaluru Karnataka full time 4 years AWS "
        "Kubernetes CI CD pipelines infrastructure reliability deploy at scale "
        "compensation 20 to 28 LPA ESOPs razorpay.com jobs "
        "system design infrastructure deep dive interview"),
    (0, "Operations Executive Zomato Gurugram Haryana graduate 1 year operations "
        "logistics coordinate restaurant partners delivery fleet salary 3 to 4.5 LPA "
        "performance incentives apply zomato.com jobs group discussion "
        "HR ops manager interview"),
    (0, "Graphic Designer Artcraft Studios join creative team transform ideas visuals "
    "blend colors typography graphics motion tell stories culture champions bold ideas "
    "mentorship skill-building workshops cutting-edge tools brand identity digital presence"),

(0, "Creative Director boutique design agency lead visual storytelling campaigns "
    "collaborate passionate team designers no formal interview portfolio review conversation "
    "no website startup studio competitive salary experience great culture creative freedom"),

(0, "UX Writer early stage startup shape voice product work directly founders designers "
    "small team big impact no formal interview rounds two conversations salary 60000 80000 "
    "equity included remote friendly loves words users"),

(0, "Brand Strategist independent creative consultancy define brand narratives Fortune 500 "
    "clients collaborative environment flat hierarchy no corporate bureaucracy "
    "portfolio based hiring no traditional interview competitive compensation mentorship growth"),

(0, "Motion Designer film production studio animations visual effects commercial campaigns "
    "passion storytelling no degree required no company website rebuilding "
    "salary 55000 75000 plus bonuses apply showreel"),
]

# ─── Globals — loaded once, reused for every request ─────────────────────────
_pipelines   = {}     # sklearn pipelines keyed by model name
_vectorizer  = None   # shared TF-IDF vectorizer
_bert        = None   # DistilBERT pipeline
_hw_config   = None   # hardware tier config
_eval_metrics= {}     # precision/recall/F1 per model
_bert_ready  = False

# ─── Public: initialize all models ───────────────────────────────────────────

def init_models(hw_profile: dict):
    """
    Called once at Flask startup.
    Trains sklearn models instantly, loads DistilBERT in background.
    """
    global _hw_config, _bert_ready
    _hw_config = hw_profile["tier_config"]
    tier       = hw_profile["tier"]

    print(f"\n🔧 Initializing 5 ML models on tier: {tier}")

    texts  = [t for _, t in TRAINING_DATA]
    labels = [l for l, _ in TRAINING_DATA]

    # ── Train sklearn models ───────────────────────────────────────────────────
    _train_sklearn_models(texts, labels, _hw_config)

    # ── Evaluate all sklearn models ────────────────────────────────────────────
    _evaluate_all(texts, labels)

    # ── Load DistilBERT ────────────────────────────────────────────────────────
    _load_bert(_hw_config)

    print("✅ All models ready\n")


# ─── Public: predict with all 5 models ───────────────────────────────────────

def predict_all(text: str) -> dict:
    """
    Runs all 5 models on the input text.
    Returns individual scores + ensemble + timing.
    """
    results = {}
    times   = {}
    probs   = {}

    cleaned = _clean_text(text)

    # ── Model 1: Logistic Regression ──────────────────────────────────────────
    t0 = time.time()
    lr_prob = _predict_sklearn("lr", cleaned)
    times["lr"] = round((time.time() - t0) * 1000, 2)
    probs["lr"]  = lr_prob
    results["lr"] = round(lr_prob * 100)

    # ── Model 2: Naive Bayes ──────────────────────────────────────────────────
    t0 = time.time()
    nb_prob = _predict_sklearn("nb", cleaned)
    times["nb"] = round((time.time() - t0) * 1000, 2)
    probs["nb"]  = nb_prob
    results["nb"] = round(nb_prob * 100)

    # ── Model 3: Random Forest ────────────────────────────────────────────────
    t0 = time.time()
    rf_prob = _predict_sklearn("rf", cleaned)
    times["rf"] = round((time.time() - t0) * 1000, 2)
    probs["rf"]  = rf_prob
    results["rf"] = round(rf_prob * 100)

    # ── Model 4: SVM ──────────────────────────────────────────────────────────
    t0 = time.time()
    svm_prob = _predict_sklearn("svm", cleaned)
    times["svm"] = round((time.time() - t0) * 1000, 2)
    probs["svm"]  = svm_prob
    results["svm"] = round(svm_prob * 100)

    # ── Model 5: DistilBERT ───────────────────────────────────────────────────
    bert_prob = None
    if _bert_ready and _bert is not None:
        t0 = time.time()
        bert_prob = _predict_bert(text)   # use original text for BERT
        times["bert"] = round((time.time() - t0) * 1000, 2)
        probs["bert"]  = bert_prob
        results["bert"] = round(bert_prob * 100)
    else:
        times["bert"]  = None
        results["bert"] = None

    # ── Ensemble weighted vote ────────────────────────────────────────────────
    ensemble = _compute_ensemble(probs)
    results["ensemble"] = round(ensemble * 100)

    return {
        "model_scores":  results,
        "model_probs":   probs,
        "model_times":   times,
        "bert_available": _bert_ready,
        "eval_metrics":  _eval_metrics,
        "tier":          _hw_config,
    }


# ─── Public: get evaluation metrics ──────────────────────────────────────────

def get_eval_metrics() -> dict:
    return _eval_metrics


# ─── Private: train sklearn models ───────────────────────────────────────────

def _train_sklearn_models(texts, labels, cfg):
    global _pipelines

    print("  Training sklearn models...")

    # ── Logistic Regression ───────────────────────────────────────────────────
    t0 = time.time()
    _pipelines["lr"] = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features = 500,
            ngram_range  = (1, 2),
            stop_words   = "english",
            sublinear_tf = True,
        )),
        ("clf", LogisticRegression(
            max_iter  = cfg["lr_max_iter"],
            solver    = cfg["lr_solver"],
            n_jobs    = cfg["lr_n_jobs"],
            C         = 1.0,
            class_weight = "balanced",
        )),
    ])
    _pipelines["lr"].fit(texts, labels)
    print(f"  ✅ Logistic Regression trained in {round((time.time()-t0)*1000)}ms")

    # ── Naive Bayes ───────────────────────────────────────────────────────────
    # GaussianNB needs dense features so we use a custom vectorizer
    t0 = time.time()
    from sklearn.naive_bayes import MultinomialNB
    _pipelines["nb"] = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features = 500,
            ngram_range  = (1, 2),
            stop_words   = "english",
        )),
        ("clf", MultinomialNB(
            alpha = cfg["nb_var_smoothing"] * 1e9,
        )),
    ])
    _pipelines["nb"].fit(texts, labels)
    print(f"  ✅ Naive Bayes trained in {round((time.time()-t0)*1000)}ms")

    # ── Random Forest ─────────────────────────────────────────────────────────
    t0 = time.time()
    _pipelines["rf"] = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features = 500,
            ngram_range  = (1, 2),
            stop_words   = "english",
        )),
        ("clf", RandomForestClassifier(
            n_estimators = cfg["rf_n_estimators"],
            max_depth    = cfg["rf_max_depth"],
            n_jobs       = cfg["rf_n_jobs"],
            class_weight = "balanced",
            random_state = 42,
        )),
    ])
    _pipelines["rf"].fit(texts, labels)
    print(f"  ✅ Random Forest trained in {round((time.time()-t0)*1000)}ms")

    # ── SVM ───────────────────────────────────────────────────────────────────
    t0 = time.time()
    _pipelines["svm"] = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features = 500,
            ngram_range  = (1, 2),
            stop_words   = "english",
        )),
        ("clf", SVC(
            max_iter     = cfg["svm_max_iter"],
            probability  = True,   # needed for predict_proba
            kernel       = "rbf",
            class_weight = "balanced",
            C            = 1.0,
        )),
    ])
    _pipelines["svm"].fit(texts, labels)
    print(f"  ✅ SVM trained in {round((time.time()-t0)*1000)}ms")


# ─── Private: load DistilBERT ─────────────────────────────────────────────────

def _load_bert(cfg):
    global _bert, _bert_ready
    try:
        print("  Loading DistilBERT (first run downloads 260MB)...")
        from transformers import pipeline as hf_pipeline
        import torch

        device    = 0 if torch.cuda.is_available() else -1
        dtype     = torch.float16 if cfg["bert_dtype"] == "float16" \
                    else torch.float32

        _bert = hf_pipeline(
            "zero-shot-classification",
            model        = "typeform/distilbert-base-uncased-mnli",
            device       = device,
            torch_dtype  = dtype,
        )
        _bert_ready = True
        print("  ✅ DistilBERT ready")

    except Exception as e:
        _bert_ready = False
        print(f"  ⚠️  DistilBERT failed to load: {e}")
        print("  ⚠️  Continuing with 4 sklearn models only")


# ─── Private: sklearn prediction ─────────────────────────────────────────────

def _predict_sklearn(model_key: str, text: str) -> float:
    """Returns scam probability 0.0-1.0 from a sklearn pipeline."""
    try:
        pipe = _pipelines[model_key]
        prob = pipe.predict_proba([text])[0]
        # prob[1] = probability of class 1 (scam)
        return float(prob[1])
    except Exception as e:
        print(f"  {model_key} prediction error: {e}")
        return 0.5   # neutral fallback


# ─── Private: DistilBERT prediction ──────────────────────────────────────────

def _predict_bert(text: str) -> float:
    """
    Uses zero-shot classification to determine scam probability.
    Returns 0.0-1.0.
    """
    try:
        cfg     = _hw_config
        # Truncate to max_length words to respect token limits
        words   = text.split()[:cfg["bert_max_length"]]
        trimmed = " ".join(words)

        result  = _bert(
            trimmed,
            candidate_labels = ["job scam fraud", "legitimate job posting"],
        )
        # result["scores"][0] = score for first label
        labels  = result["labels"]
        scores  = result["scores"]
        scam_idx = labels.index("job scam fraud")
        return float(scores[scam_idx])

    except Exception as e:
        print(f"  BERT prediction error: {e}")
        return 0.5


# ─── Private: ensemble ───────────────────────────────────────────────────────

def _compute_ensemble(probs: dict) -> float:
    """
    Weighted average of all available model probabilities.
    BERT gets highest weight when available.
    """
    if probs.get("bert") is not None:
        weights = {
            "lr":   0.15,
            "nb":   0.15,
            "rf":   0.15,
            "svm":  0.15,
            "bert": 0.40,
        }
    else:
        # Equal weights when BERT unavailable
        weights = {
            "lr":  0.25,
            "nb":  0.25,
            "rf":  0.25,
            "svm": 0.25,
        }

    total_weight = 0.0
    weighted_sum = 0.0

    for key, weight in weights.items():
        val = probs.get(key)
        if val is not None:
            weighted_sum += val * weight
            total_weight += weight

    return weighted_sum / total_weight if total_weight > 0 else 0.5


# ─── Private: evaluate all models ────────────────────────────────────────────

def _evaluate_all(texts, labels):
    """
    Computes precision, recall, F1, accuracy for all sklearn models.
    Stored in _eval_metrics for the MetricsTab.
    """
    global _eval_metrics

    model_names = {
        "lr":  "Logistic Regression",
        "nb":  "Naive Bayes",
        "rf":  "Random Forest",
        "svm": "SVM",
    }

    for key, name in model_names.items():
        pipe  = _pipelines[key]
        preds = pipe.predict(texts)

        _eval_metrics[key] = {
            "name":      name,
            "precision": round(precision_score(labels, preds,
                               zero_division=0), 3),
            "recall":    round(recall_score(labels, preds,
                               zero_division=0), 3),
            "f1":        round(f1_score(labels, preds,
                               zero_division=0), 3),
            "accuracy":  round(accuracy_score(labels, preds), 3),
            "confusion": confusion_matrix(labels, preds).tolist(),
        }
        m = _eval_metrics[key]
        print(f"  📊 {name}: "
              f"F1={m['f1']} "
              f"Acc={m['accuracy']} "
              f"P={m['precision']} "
              f"R={m['recall']}")


# ─── Private: text cleaner ────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    """Lowercases and removes special characters for sklearn models."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text