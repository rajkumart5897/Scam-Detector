# Architecture Decision Record

This document explains the key architectural decisions made during the development of ScamDetect and the reasoning behind each choice.

---

## ADR-001: Hybrid Rule + ML Scoring

**Decision:** Combine a rule-based engine with 5 ML models using a weighted formula: `Final = Rules(45%) + ML(55%)`

**Context:** Early prototypes used rules-only scoring. This was interpretable but brittle — a scammer avoiding trigger keywords could score 0. Pure ML scoring was more robust but produced false positives on legitimate creative industry postings that lacked websites or interview descriptions.

**Reasoning:** The hybrid approach exploits the complementary strengths of each method. Rules provide explainability (required for user trust). ML provides generalisation (required for robustness). The 45/55 split was tuned empirically on a test set of ~20 real postings.

**Consequences:** The system is slightly more complex than either pure approach. The rule engine must be maintained in two places (JS and Python). This is an acceptable tradeoff.

---

## ADR-002: SQLite over PostgreSQL

**Decision:** Use SQLite as the persistence layer.

**Context:** The system needs to persist analysis results for the history feature. PostgreSQL would offer better concurrency and scalability.

**Reasoning:** The primary deployment target is a local machine for a single user. SQLite requires zero configuration — no server, no credentials, no connection string. The database is a single file. WAL mode provides sufficient concurrency for the expected load (one analysis at a time). Migrating to PostgreSQL later requires only changing the connection string.

**Consequences:** Not suitable for multi-user cloud deployment without migration. Acceptable for the current use case.

---

## ADR-003: Zero-Shot BERT over Fine-Tuned BERT

**Decision:** Use `typeform/distilbert-base-uncased-mnli` in zero-shot mode rather than fine-tuning on our dataset.

**Context:** Fine-tuning BERT requires a substantial labeled dataset (typically 1,000+ examples minimum). We have 30.

**Reasoning:** Fine-tuning on 30 examples would achieve near-100% training accuracy (memorisation) and poor generalisation. Zero-shot classification leverages the model's pre-trained language understanding — which already encodes semantic knowledge of what "fraud" and "legitimate" mean — without any training. The MNLI checkpoint is specifically trained on natural language inference, making it suitable for classifying text against candidate label descriptions.

**Consequences:** Zero-shot performance is lower than a fine-tuned model would be with adequate data. The correct path forward is to collect 1,000+ labeled examples and fine-tune.

---

## ADR-004: Hardware Adaptive Parameters

**Decision:** Detect CPU, RAM, and GPU at startup and adjust all model parameters accordingly.

**Context:** The system must run on hardware ranging from an Intel i3 with 8GB RAM and HDD to a modern workstation with GPU. Fixed parameters that work well on high-end hardware are unusable on low-end hardware (multi-minute inference times).

**Reasoning:** Parameter scaling is a well-established production practice (used in TensorFlow Serving, ONNX Runtime, etc.). Implementing it at the application level, rather than relying on library defaults, gives us precise control over the user experience on each hardware tier.

**Consequences:** Slightly more complex model initialisation code. Accuracy varies slightly between tiers (lower on LOW tier due to smaller models). This is the correct tradeoff — a fast approximate answer on a budget machine is more useful than a slow accurate answer.

---

## ADR-005: TF-IDF over Word2Vec / FastText

**Decision:** Use TF-IDF vectorization for the 4 sklearn models rather than dense word embeddings.

**Context:** Dense embeddings (Word2Vec, FastText, GloVe) capture semantic similarity between words. "Fee" and "payment" would be similar in embedding space. TF-IDF treats them as independent features.

**Reasoning:** For our task, exact keyword matching is more important than semantic similarity. The phrase "training fee" is a scam signal not because of its semantic meaning but because of its exact wording. TF-IDF with bigrams (`ngram_range=(1,2)`) captures these exact phrases effectively. Dense embeddings would blur the boundaries between legitimate and fraudulent phrasing.

Additionally, TF-IDF training is instantaneous. Dense embedding lookup requires loading pre-trained vectors (~300MB for GloVe) which is unnecessary overhead when TF-IDF achieves comparable performance on this task.

**Consequences:** The sklearn models are less robust to paraphrasing. A scammer who writes "start-up cost" instead of "training fee" may evade those rules. This is partially compensated by DistilBERT, which understands paraphrases.

---

## ADR-006: Inline Styles over CSS Modules

**Decision:** Use React inline styles for all component styling rather than CSS Modules, Tailwind, or a component library.

**Context:** Several alternatives were considered: Tailwind CSS, CSS Modules, styled-components, shadcn/ui.

**Reasoning:**
- **Tailwind:** Requires a compiler pass and enforces a utility-class mental model that conflicts with dynamic styling based on JavaScript state (e.g. risk level colours).
- **CSS Modules:** Good for static styles, but creates friction when styles depend on runtime values.
- **Component libraries:** Add significant bundle weight and impose visual constraints.
- **Inline styles:** Keep styling co-located with component logic, allow direct use of JavaScript values in styles, and produce a completely custom visual identity.

The primary downside — no pseudo-selectors like `:hover` — is handled with `onMouseEnter`/`onMouseLeave` handlers where needed.

**Consequences:** Slightly more verbose JSX. No :hover or :focus-within pseudo-class support without handlers. Global design tokens managed through the `THEME` object and CSS custom properties in `index.css`.