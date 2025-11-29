// src/questionBank.js
import path from "path";
import { readDirFilesUtf8, readFileUtf8 } from "./utils/io.js";

// Obje
const TOKEN_TYPES = {
    // Structure
    ID_DELIMITER: 'ID_DELIMITER',   // ::
    START_BLOCK: 'START_BLOCK',     // {
    END_BLOCK: 'END_BLOCK',         // }
    CRLF: 'CRLF',                   // Saut de ligne (\r?\n)

    // Réponses/Commentaires
    CORRECT: 'CORRECT',             // =
    INCORRECT: 'INCORRECT',         // ~
    FEEDBACK: 'FEEDBACK',           // # (pour le commentaire général ou spécifique)

    // Contenu
    TEXT: 'TEXT',                   // Tout contenu textuel
};

export async function importBank(pathOrDir) {
  const resolved = path.resolve(pathOrDir);
  const questions = [];

  try {
    const files = await readDirFilesUtf8(resolved, ".gift");

    if (files.length > 0) { // si c’est un dossier
      for (const file of files) {
        try {
          const content = file.content;
          const parsedQuestions = parseGift(content, file.filename);

          for (const q of parsedQuestions) {
            q.source = file.filename;
            q.raw = content;
            questions.push(q);
          }
        } catch (error) {
          console.error(`Erreur de parsing dans le fichier ${file.filename}: ${error.message}`);
        }
      }

    } else { // si c’est un fichier
      const content = await readFileUtf8(resolved);
      const parsedQuestions = parseGift(content, path.basename(resolved));

      for (const q of parsedQuestions) {
        q.source = path.basename(resolved);
        q.raw = content;
        questions.push(q);
      }
    }

  } catch (error) {
    console.error(`Erreur import : ${error.message}`);
  }

  // Attribution auto d'identifiants
  for (let i = 0; i < questions.length; i++) {
    if (!questions[i].id) {
      questions[i].id = `q${i + 1}`;
    }
  }
  return { questions };
}


/* ============================================================
   PARSEUR GIFT
   ============================================================ */

export function parseGift(text, sourceName = "unknown") { // Analyse le texte GIFT et retourne une liste de questions
  const tokens = tokenizeGift(text);
  const questions = [];
  let current = 0;

  // fonctions utilitaires du parseur
  function peek() { return tokens[current]; } // regarde le token courant sans avancer
  function advance() { return tokens[current++]; } // avance et retourne le token courant

  function consume(expectedType, msg) { // consomme un token attendu
    const token = tokens[current];
    if (!token) throw new Error(`EOF: ${msg}`);
    if (token.type !== expectedType)
      throw new Error(`${msg} — found ${token.type} (${token.value})`);
    current++;
    return token;
  }

  //fonction pour collecter du texte jusqu'à un type de token spécifique
  function collectTextUntil(stopType) { 
    let buffer = [];
    while (peek() && peek().type !== stopType) {
      if (peek().type === TOKEN_TYPES.CRLF) break;
      buffer.push(advance().value);
    }
    return buffer.join('').trim();
  }

  function skipNewlines() {
    while (peek() && peek().type === TOKEN_TYPES.CRLF) advance();
  }

  function parseQuestion() {
    let question = { id: null, text: '', choices: [], feedback: null, type: '' };

    if (peek().type === TOKEN_TYPES.ID_DELIMITER) {
      consume(TOKEN_TYPES.ID_DELIMITER, "Expected ::");
      question.id = collectTextUntil(TOKEN_TYPES.ID_DELIMITER);
      consume(TOKEN_TYPES.ID_DELIMITER, "Expected closing ::");
    }

    skipNewlines();

    question.text = collectTextUntil(TOKEN_TYPES.START_BLOCK);
    consume(TOKEN_TYPES.START_BLOCK, "Expected {");

    const results = parseChoices();
    question.choices = results.options;
    question.feedback = results.feedback;
    question.type = determineQuestionType(question.choices);

    return question;
  }

  //function pour parser les choix de réponses
  function parseChoices() {
    let choices = [];
    let generalFeedback = null;

    while (peek() && peek().type !== TOKEN_TYPES.END_BLOCK) { // jusqu'à la fin du bloc

      if (peek().type === TOKEN_TYPES.CRLF) { // sauts de ligne
        advance();
        continue;
      }

      if (peek().type === TOKEN_TYPES.FEEDBACK) {
        consume(TOKEN_TYPES.FEEDBACK, "Expected #");
        generalFeedback = collectTextUntil(TOKEN_TYPES.END_BLOCK);
        break;
      }

      if (peek().type === TOKEN_TYPES.CORRECT || peek().type === TOKEN_TYPES.INCORRECT) { //si c'est une réponse

        let correct = peek().type === TOKEN_TYPES.CORRECT;

        consume(correct ? TOKEN_TYPES.CORRECT : TOKEN_TYPES.INCORRECT,
                "Expected '=' or '~'");

        let line = collectTextUntil(TOKEN_TYPES.CRLF); // lire jusqu'au saut de ligne ou fin de bloc
        let fbIndex = line.indexOf('#'); // chercher un feedback spécifique
        let choice = { correct, text: "", feedback: null };

        if (fbIndex !== -1) {
          choice.text = line.substring(0, fbIndex).trim(); // texte avant le # dans la réponse
          choice.feedback = line.substring(fbIndex + 1).trim(); // texte après le # dans le feedback
        } else {
          choice.text = line.trim();
        }

        choices.push(choice); // ajouter le choix à la liste

        if (peek() && peek().type === TOKEN_TYPES.CRLF) advance();

        continue;
      }

      throw new Error(`Unexpected token in block: ${peek().type}`);
    }
 
    consume(TOKEN_TYPES.END_BLOCK, "Expected '}'"); // fin du bloc
    return { options: choices, feedback: generalFeedback }; // retourner les choix et le feedback général
  }

  // fonction pour déterminer le type de question
  // (vrai/faux ou choix multiple)
  //  à modifier pour d'autres types plus tard

  function determineQuestionType(options) {
    if (!options || options.length === 0) return 'unknown';
    if (options.length === 2) return 'true_false';
    return 'multiple_choice';
  }


  /* ============================================================
     BOUCLE PRINCIPALE
     ============================================================ */

  while (peek()) { //tant qu'il y a des tokens
    try {
      skipNewlines();

      if (peek().type === TOKEN_TYPES.TEXT) { // gérer les commentaires ou lignes spéciales
        const val = peek().value;
        if (val.startsWith("//") || val.startsWith("$")) {
          advance();
          continue;
        }
      }

      if (peek().type === TOKEN_TYPES.ID_DELIMITER || peek().type === TOKEN_TYPES.TEXT) { // début d'une question
        questions.push(parseQuestion()); // parser la question et l'ajouter à la liste
      } else {
        advance();
      }

    } catch (err) {
      console.error(`Erreur parsing ${sourceName}: ${err.message}`);
      advance();
      while (peek() && peek().type !== TOKEN_TYPES.ID_DELIMITER) advance();
    }
  }

  return questions;
}


/* ============================================================
   TOKENIZER GIFT
   ============================================================ */

function tokenizeGift(text) { // divise le texte GIFT en tokens
  const tokens = [];
  const regex = /(\r?\n|::|\{|\}|=|~|#)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) { // trouver les délimiteurs
    const delimiter = match[0];
    const before = text.substring(lastIndex, match.index);

    if (before.trim() !== "")
      tokens.push({ type: TOKEN_TYPES.TEXT, value: before.trim() });

    switch (delimiter) {
      case "::": tokens.push({ type: TOKEN_TYPES.ID_DELIMITER, value: delimiter }); break;
      case "{":  tokens.push({ type: TOKEN_TYPES.START_BLOCK, value: delimiter }); break;
      case "}":  tokens.push({ type: TOKEN_TYPES.END_BLOCK, value: delimiter }); break;
      case "=":  tokens.push({ type: TOKEN_TYPES.CORRECT, value: delimiter }); break;
      case "~":  tokens.push({ type: TOKEN_TYPES.INCORRECT, value: delimiter }); break;
      case "#":  tokens.push({ type: TOKEN_TYPES.FEEDBACK, value: delimiter }); break;
      default:   tokens.push({ type: TOKEN_TYPES.CRLF, value: delimiter }); break;
    }

    lastIndex = regex.lastIndex;
  }

  const remaining = text.substring(lastIndex).trim();
  if (remaining !== "")
    tokens.push({ type: TOKEN_TYPES.TEXT, value: remaining });

  return tokens;
}


/* ============================================================
   SEARCH + DISPLAY
   ============================================================ */

export function searchByKeyword(bank, keyword) { // recherche par mot-clé dans le texte des questions et les IDs
  if (!bank || !keyword) return [];
  keyword = keyword.toLowerCase();
  return bank.questions.filter(q => q.text.toLowerCase().includes(keyword) ||(q.id && q.id.toLowerCase().includes(keyword)) //recherche dans la bank de questions parsées
  );
}

export function displayResults(results = []) {
  if (results.length === 0) {
    console.log("Aucun résultat.");
    return;
  }

  console.log(`${results.length} résultat(s) :`);
  results.forEach(q => {
    const preview = q.text.substring(0, 50) + "...";
    console.log(`- [${q.id}] ${preview}`);
  });
}


export function displayQuestion(bank, qid) {
  let q = bank.questions.find(q => q.id === qid);
  if (!q) return console.log("Question non trouvée.");

  console.log(`ID: ${q.id}`);
  console.log(`Titre: ${q.text}`);
  console.log("-----------------------");

  if (q.choices && q.choices.options) {
    q.choices.options.forEach((opt, i) => {
      const status = opt.correct ? "[x]" : "[ ]";
      console.log(`${i + 1}. ${status} ${opt.text}`);
      if (opt.feedback)
        console.log(`   -> Feedback: ${opt.feedback}`);
    });
  }
}
