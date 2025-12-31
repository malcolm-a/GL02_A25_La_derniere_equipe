// ===============================================================
//  QUESTION BANK (FULL Moodle GIFT parser)
// ===============================================================

import path from "path";
import { readDirFilesUtf8, readFileUtf8 } from "./utils/io.js";

// ===============================================================
// IMPORT BANK
// ===============================================================

/* ==============================================================
    Nouvelle version sans lexeur 
    le lexeur permettait de garder que les fichiers qui correspondait strictement à la grammaire
    mais trop strict 
    on passe par plusieur parseur selon le type de question detecté 
    plus souple permet de gérer plus de fichier 
    Parseur basé sur la doc moodle et pas sur le cahier des charges 
  ============================================================== */

export async function importBank(pathOrDir) {
  const resolved = path.resolve(pathOrDir);
  const questions = [];

  try {
    const files = await readDirFilesUtf8(resolved, ".gift");

    if (files.length > 0) {
      // dossier avec fichiers .gift
      for (const file of files) {
        try {
          const parsed = parseGift(file.content);
          for (const q of parsed) {
            q.source = file.filename;
            q.raw = file.content;
            questions.push(q);
          }
        } catch (e) {
          console.error(`Erreur parsing ${file.filename}: ${e.message}`);
        }
      }
    } else {
      // fichier unique (gift)
      const content = await readFileUtf8(resolved);
      const parsed = parseGift(content);
      for (const q of parsed) {
        q.source = path.basename(resolved);
        q.raw = content;
        questions.push(q);
      }
    }
  } catch (err) {
    console.error(`Erreur import: ${err.message}`);
  }

  for (let i = 0; i < questions.length; i++) {
    if (!questions[i].id) {
      questions[i].id = `q${i + 1}`;
    }
  }

  return { questions };
}

// ===============================================================
//  PARSE GIFT
// ===============================================================

export function parseGift(text) {
  //  Séparer par blocs (séparés par lignes vides)
  const blocks = splitIntoBlocks(text);

  const results = [];

  for (const block of blocks) {
    try {
      const q = parseGiftBlock(block);
      if (q) results.push(q);
    } catch (err) {
      console.error("Erreur block:", err.message);
    }
  }

  return results;
}

// ===============================================================
//   Découpe en blocs séparés
// ===============================================================

function splitIntoBlocks(text) {
  const lines = text.split(/\r?\n/);
  let blocks = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length > 0) {
        blocks.push(current.join("\n"));
        current = [];
      }
    } else current.push(line);
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks;
}

// ===============================================================
//  PARSE UN BLOC GIFT
// ===============================================================

function parseGiftBlock(block) {
  const text = block.trim();

  // Enlever les commentaires //...
  const filtered = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !l.startsWith("//"))
    .join("\n");

  // Extraire un éventuel ID ::ID::
  let id = null;
  let cleaned = filtered;

  const idMatch = cleaned.match(/^::([^:]+?)::/);
  if (idMatch) {
    id = idMatch[1].trim();
    cleaned = cleaned.replace(/^::[^:]+::\s*/, "");
  }

  // Détecter un format facultatif [html], [markdown], etc.
  let format = null;
  const fmtMatch = cleaned.match(/^\[(html|markdown|plain|moodle)\]/i);
  if (fmtMatch) {
    format = fmtMatch[1].toLowerCase();
    cleaned = cleaned.replace(/^\[[^\]]+\]/, "").trim();
  }

  // Reconstruire le texte complet en remplaçant chaque {…} par un ___
  // pour les texte à trous
  let reconstructedText = "";
  let holes = [];

  const full = cleaned;
  const regex = /\{([^}]*)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(full)) !== null) {
    const before = full.substring(lastIndex, match.index);

    // Ajouter le texte avant et un placeholder
    reconstructedText += before + " ___ ";

    // Sauvegarder le bloc réponse
    holes.push(match[1]);

    lastIndex = regex.lastIndex;
  }

  // Partie après le dernier bloc
  reconstructedText += full.substring(lastIndex).trim();

  // Nettoyage espaces
  reconstructedText = reconstructedText.replace(/\s+/g, " ").trim();

  // Si on n'a aucun bloc {}, c'est une description simple
  if (holes.length === 0) {
    return {
      id,
      type: "description",
      format,
      text: reconstructedText,
      choices: [],
    };
  }

  // Fusionner tous les blocs réponse en un seul block pour parseAnswerBlock
  const answerBlock = holes.join("\n").trim();

  // Déléguer au parseur des réponses GIFT
  return parseAnswerBlock(id, format, reconstructedText, answerBlock);
}

// ===============================================================
//  PARSE ANSWERS {}
//  Detecte le type de question et délègue au parseur adapté
// ===============================================================

function parseAnswerBlock(id, format, text, block) {
  // matching : a -> b
  if (block.includes("->")) {
    return parseMatching(id, format, text, block);
  }

  // VRAI/FAUX : {T} ou {F} ou {TRUE}, {FALSE}
  if (/^(t|f|true|false)$/i.test(block.trim())) {
    return parseTrueFalse(id, format, text, block.trim());
  }

  // numérique : {#3:2} ou {#3..5}
  if (block.trim().startsWith("#")) {
    return parseNumeric(id, format, text, block);
  }

  // composition / essay : {}
  if (block.trim() === "") {
    return {
      id,
      type: "essay",
      format,

      text,
      choices: [],
    };
  }

  // réponse courte : uniquement des "="
  if (/^=/.test(block.trim()) && !block.includes("~")) {
    return parseShortAnswer(id, format, text, block);
  }

  // mot manquant (texte troué)
  if (block.includes("~") || block.includes("=")) {
    // plusieurs possibilités → soit multiple-choice, soit cloze
    return parseChoices(id, format, text, block);
  }

  // fallback
  return {
    id,
    type: "unknown",
    format,
    text,
    choices: [],
  };
}

// ===============================================================
//  TRUE/FALSE
// ===============================================================

function parseTrueFalse(id, format, text, block) {
  const raw = block.trim().toUpperCase();
  const isTrue = raw === "T" || raw === "TRUE";

  return {
    id,
    type: "true_false",
    format,
    text,
    answer: isTrue,
  };
}

// ===============================================================
//  NUMERIC
// ===============================================================

function parseNumeric(id, format, text, block) {
  // format : #3:2   ou  #1..5
  let answer = null;
  let margin = 0;

  const numeric = block.trim().substring(1);

  if (numeric.includes("..")) {
    const [min, max] = numeric.split("..").map((s) => parseFloat(s));
    answer = (min + max) / 2;
    margin = (max - min) / 2;
  } else if (numeric.includes(":")) {
    const [value, err] = numeric.split(":");
    answer = parseFloat(value);
    margin = parseFloat(err);
  } else {
    answer = parseFloat(numeric);
  }

  return {
    id,
    type: "numeric",
    format,
    text,
    answer,
    margin,
  };
}

// ===============================================================
//  SHORT ANSWER (=a =b =c)
// ===============================================================

function parseShortAnswer(id, format, text, block) {
  const parts = block.split(/(?==)/g);

  const answers = parts
    .map((p) => p.trim())
    .filter((p) => p.startsWith("="))
    .map((p) => ({
      text: p.substring(1).replace(/#.*$/, "").trim(),
      feedback: extractFeedback(p),
    }));

  return {
    id,
    type: "short_answer",
    format,
    text,
    answers,
  };
}

// ===============================================================
//  MATCHING : a -> b
// ===============================================================

function parseMatching(id, format, text, block) {
  const lines = block.split(/\n/);

  const pairs = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("="))
    .map((l) => {
      const content = l.substring(1);
      const [left, right] = content.split("->").map((s) => s.trim());
      return { left, right };
    });

  return {
    id,
    type: "matching",
    format,
    text,
    pairs,
  };
}

// ===============================================================
//  CHOIX MULTIPLE OU MOT MANQUANT
// ===============================================================

function parseChoices(id, format, text, block) {
  const options = [];

  // Transformer tout en une seule ligne propre
  const data = block.replace(/\s+/g, " ").trim();

  // Découpe par "point de décision" : chaque = ou ~ marque un nouveau choix
  const parts = data.split(/(?=[=~])/g);

  for (let part of parts) {
    part = part.trim();
    if (part === "") continue;

    const isCorrect = part.startsWith("=");
    const isWrong = part.startsWith("~");

    if (!isCorrect && !isWrong) continue;

    // Enlever le = ou ~
    let clean = part.substring(1).trim();

    // Extraire éventuel feedback (#feedback)
    const feedback = extractFeedback(clean);

    // Nettoyer le texte du choix (retirer le #feedback)
    const cleanedText = clean.replace(/#.*$/, "").trim();

    options.push({
      correct: isCorrect,
      text: cleanedText,
      feedback,
    });
  }

  return {
    id,
    type: "multiple_choice",
    format,
    text,
    choices: options,
  };
}

// ===============================================================
//  FEEDBACK extraction
// ===============================================================

function extractFeedback(text) {
  if (!text.includes("#")) return null;
  return text.substring(text.indexOf("#") + 1).trim();
}

/* ============================================================
   SEARCH + DISPLAY
   ============================================================ */

export function searchByKeyword(bank, keyword) {
  // recherche par mot-clé dans le texte des questions et les IDs
  if (!bank || !keyword) return [];
  keyword = keyword.toLowerCase();
  return bank.questions.filter(
    (q) =>
      q.text.toLowerCase().includes(keyword) ||
      (q.id && q.id.toLowerCase().includes(keyword)), //recherche dans la bank de questions parsées
  );
}

export function displayResults(results = []) {
  if (results.length === 0) {
    console.log("Aucun résultat.");
    return;
  }

  console.log(`${results.length} résultat(s) :`);
  results.forEach((q) => {
    const preview = q.text.substring(0, 50) + "...";
    console.log(`- [${q.id}] ${preview}`);
  });
}

//=============================================================
//  DISPLAY QUESTION DETAILS
//  Récupère une question par son ID
//  Récupère le type et affiche les détails selon le type
//=============================================================

export function displayQuestion(bank, qid) {
  let q = bank.questions.find((q) => q.id === qid);
  if (!q) return console.log("Question non trouvée.");

  console.log(`ID: ${q.id}`);
  console.log(`Type: ${q.type}`);
  if (q.format) console.log(`Format: ${q.format}`);
  console.log("Texte:");
  console.log(q.text);
  console.log("-----------------------");

  // Aucun bloc de réponses (description / essai)
  if (q.type === "essay" || q.type === "description") {
    console.log("(Pas de réponses — question ouverte)");
    return;
  }

  // TRUE/FALSE
  if (q.type === "true_false") {
    console.log(`Réponse attendue : ${q.answer ? "Vrai" : "Faux"}`);
    return;
  }

  // NUMERIC
  if (q.type === "numeric") {
    if (q.margin != null) {
      console.log(`Réponse numérique : ${q.answer} ± ${q.margin}`);
    } else {
      console.log(`Réponse entre : ${q.answer_min} et ${q.answer_max}`);
    }
    return;
  }

  // MATCHING
  if (q.type === "matching" && Array.isArray(q.pairs)) {
    q.pairs.forEach((p, i) => {
      console.log(`${i + 1}. ${p.left}  ->  ${p.right}`);
    });
    return;
  }

  // SHORT ANSWER : q.answers
  if (q.type === "short_answer" && Array.isArray(q.answers)) {
    console.log("Réponses acceptées :");
    q.answers.forEach((ans, i) => {
      console.log(`  - ${ans.text}`);
      if (ans.feedback) console.log(`     -> Feedback: ${ans.feedback}`);
    });
    return;
  }

  // MULTIPLE CHOICE : q.choices
  if (q.type === "multiple_choice" && Array.isArray(q.choices)) {
    q.choices.forEach((opt, i) => {
      const status = opt.correct ? "[x]" : "[ ]";
      console.log(`${i + 1}. ${status} ${opt.text}`);
      if (opt.feedback) console.log(`     -> Feedback: ${opt.feedback}`);
    });
    return;
  }

  // fallback (au cas où)
  console.log("Format de réponses non reconnu ou vide.");
  console.log(JSON.stringify(q, null, 2));
}
