// src/services/tfClassifier.js
// Builds, trains, and runs a TensorFlow.js text classifier.
// Architecture: Bag-of-Words vectorizer → Dense neural network → Binary output
// All processing happens in the browser. No server, no API.

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; 
import { TRAINING_DATA, DATASET_STATS } from "../constants/trainingData";

// ─── Module-level state ───────────────────────────────────────────────────────
// We keep the model and vocabulary in memory after first training
// so we don't retrain on every single prediction call.

let model      = null;   // trained tf.Sequential model
let vocabulary = null;   // word → index mapping
let isTrained  = false;

// ─── Hyperparameters ──────────────────────────────────────────────────────────

const VOCAB_SIZE   = 150;
const EPOCHS       = 25;
const HIDDEN_UNITS = 16;
const BATCH_SIZE   = 8;
const LEARNING_RATE = 0.005;

// ─── Public API ───────────────────────────────────────────────────────────────

// Main entry point. Call this once per app session.
// Returns training metrics so the UI can display them.

export async function initClassifier() {
  if (isTrained) return getModelStats();

  vocabulary = buildVocabulary(TRAINING_DATA.map(d => d.text));
  model      = buildModel();

  const metrics = await trainModel();
  isTrained = true;

  return metrics;
}

// Predicts scam probability for a single job posting string.
// Returns a value between 0.0 (legitimate) and 1.0 (scam).
// Always call initClassifier() before this.

export async function predict(text) {
  if (!isTrained || !model || !vocabulary) {
    await initClassifier();
  }

  const vector  = vectorize(text, vocabulary);
  const tensor  = tf.tensor2d([vector]);
  const output  = model.predict(tensor);
  const prob    = (await output.data())[0];

  // Clean up tensors to prevent memory leaks
  tensor.dispose();
  output.dispose();

  return prob;   // 0.0 → 1.0
}

// Returns whether the classifier has been trained this session.
export function isClassifierReady() {
  return isTrained;
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

// Builds a vocabulary of the most frequent words across all training texts.
// Each word maps to a unique index (0 to VOCAB_SIZE-1).

function buildVocabulary(texts) {
  const freq = {};

  for (const text of texts) {
    for (const word of tokenize(text)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  // Sort by frequency descending, keep top VOCAB_SIZE words
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, VOCAB_SIZE)
    .map(([word]) => word);

  // Build word → index map
  const vocab = {};
  topWords.forEach((word, idx) => { vocab[word] = idx; });

  return vocab;
}

// ─── Vectorizer ───────────────────────────────────────────────────────────────

// Converts a text string into a fixed-size numeric vector.
// Uses Bag-of-Words with TF-IDF-style normalization.
// Output is always an array of length VOCAB_SIZE.

function vectorize(text, vocab) {
  const vector = new Array(VOCAB_SIZE).fill(0);
  const words  = tokenize(text);

  for (const word of words) {
    if (word in vocab) {
      vector[vocab[word]] += 1;
    }
  }

  // Normalize by document length to prevent long texts
  // from dominating short ones
  const total = words.length || 1;
  return vector.map(v => v / total);
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

// Lowercases and splits text into clean word tokens.
// Removes stopwords that don't carry signal for scam detection.

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for",
  "of","with","by","from","is","are","was","were","be","been",
  "have","has","had","do","does","did","will","would","could",
  "should","may","might","this","that","these","those","it",
  "its","we","our","you","your","they","their","i","my","me",
  "he","she","him","her","us","as","if","so","up","out","about",
  "into","than","more","also","can","all","any","both","each",
  "just","not","no","nor","too","very","s","t","re","ll","ve",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")   // remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

// ─── Model Architecture ───────────────────────────────────────────────────────

// Simple but effective feedforward network for binary text classification.
//
// Input layer  : VOCAB_SIZE features (bag-of-words vector)
// Hidden layer : HIDDEN_UNITS neurons, ReLU activation, dropout for regularization
// Output layer : 1 neuron, sigmoid activation → probability 0-1

function buildModel() {
  const net = tf.sequential();

  // Input + first hidden layer
  net.add(tf.layers.dense({
    units:           HIDDEN_UNITS,
    activation:      "relu",
    inputShape:      [VOCAB_SIZE],
    kernelInitializer: "glorotUniform",
  }));

  // Dropout to prevent overfitting on our small dataset
  net.add(tf.layers.dropout({ rate: 0.3 }));

  // Second hidden layer for more expressive power
  net.add(tf.layers.dense({
    units:      8,
    activation: "relu",
  }));

  // Output layer — sigmoid squashes to 0-1 probability
  net.add(tf.layers.dense({
    units:      1,
    activation: "sigmoid",
  }));

  net.compile({
    optimizer: tf.train.adam(LEARNING_RATE),
    loss:      "binaryCrossentropy",
    metrics:   ["accuracy"],
  });

  return net;
}

// ─── Training ─────────────────────────────────────────────────────────────────

// Trains the model on TRAINING_DATA and returns evaluation metrics.
// Uses an 80/20 train/validation split.

async function trainModel() {
  // Build input matrix and label vector
  const vectors = TRAINING_DATA.map(d => vectorize(d.text, vocabulary));
  const labels  = TRAINING_DATA.map(d => d.label);

  const xs = tf.tensor2d(vectors);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  // Track best validation accuracy across epochs
  let bestValAcc  = 0;
  let finalLoss   = 0;
  let finalAcc    = 0;

  await model.fit(xs, ys, {
    epochs:          EPOCHS,
    batchSize:       BATCH_SIZE,
    validationSplit: 0.2,       // hold out 20% for validation
    shuffle:         true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (logs.val_acc > bestValAcc) {
          bestValAcc = logs.val_acc;
        }
        // Capture final epoch metrics
        if (epoch === EPOCHS - 1) {
          finalLoss = logs.loss;
          finalAcc  = logs.acc;
        }
      },
    },
  });

  // Clean up training tensors
  xs.dispose();
  ys.dispose();

  // ── Evaluate precision / recall / F1 via manual pass ─────────────────────
  const evalMetrics = await evaluateModel();

  return {
    trainAccuracy:   finalAcc,
    valAccuracy:     bestValAcc,
    finalLoss,
    ...evalMetrics,
    datasetStats:    DATASET_STATS,
    epochs:          EPOCHS,
    vocabSize:       Object.keys(vocabulary).length,
    architecture:    `Dense(${HIDDEN_UNITS}, relu) → Dropout(0.3) → Dense(8, relu) → Dense(1, sigmoid)`,
  };
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

// Runs the trained model over all training examples and computes
// precision, recall, and F1 score manually.
// In a production system you'd use a held-out test set.

async function evaluateModel() {
  let tp = 0; // true positives  (predicted scam, actually scam)
  let fp = 0; // false positives (predicted scam, actually legit)
  let fn = 0; // false negatives (predicted legit, actually scam)
  let tn = 0; // true negatives  (predicted legit, actually legit)

  for (const sample of TRAINING_DATA) {
    const prob      = await predict(sample.text);
    const predicted = prob >= 0.5 ? 1 : 0;
    const actual    = sample.label;

    if (predicted === 1 && actual === 1) tp++;
    else if (predicted === 1 && actual === 0) fp++;
    else if (predicted === 0 && actual === 1) fn++;
    else tn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall    = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1        = precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : 0;
  const accuracy  = (tp + tn) / TRAINING_DATA.length;

  return {
    precision:       parseFloat(precision.toFixed(3)),
    recall:          parseFloat(recall.toFixed(3)),
    f1Score:         parseFloat(f1.toFixed(3)),
    accuracy:        parseFloat(accuracy.toFixed(3)),
    confusionMatrix: { tp, fp, fn, tn },
  };
}

// ─── Model Stats ──────────────────────────────────────────────────────────────

// Returns current model metadata without retraining.

function getModelStats() {
  return {
    alreadyTrained: true,
    vocabSize:      Object.keys(vocabulary || {}).length,
    datasetStats:   DATASET_STATS,
  };
}