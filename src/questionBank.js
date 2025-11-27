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
    TEXT: 'TEXT',                   // Tout contenu textuel entre les délimiteurs
};


export async function importBank(pathOrDir) {
  const resolved = path.resolve(pathOrDir);
  const questions = [];

  try {
    const files = await readDirFilesUtf8(resolved, ".gift"); 
    if (files.length >0 ) { //si c'est un dossier
      for (const file of files) {
        const content = file.content; // Lire le contenu du fichier
        const parsedQuestions = parseGift(content, file.filename); // Parse le contenu GIFT

        for (const q of parsedQuestions) {
          q.source = file.filename; // Ajout du nom du fichier source
          q.raw = content; // Ajout du contenu brut
          questions.push(q); // Ajout des questions au tableau principal
        }
      }
  }else { //si c'est un fichier
      const content = await readFileUtf8(resolved);
      const parsedQuestions = parseGift(content, path.basename(resolved));
       for (const q of parsedQuestions) {
          q.source= path.basename(resolved); // Ajout du nom du fichier source
          q.raw = content; // Ajout du contenu brut
            questions.push(q); // Ajout des questions au tableau principal
        }
    } 

  }catch (error) {console.error(`Erreur lors de l'importation de la banque de questions : ${error.message}`);}

  for (let i=0; i< questions.length; i++) {
    if (!questions[i].id) {
      questions[i].id = `q${i+1}`;
    }
  }
  return {questions};
}




/**
 * parseGift(text, sourceName)
 * - parse un texte GIFT contenant une ou plusieurs questions
 * - renvoie un tableau d'objets question

 */
export function parseGift(text, sourceName = "unknown") {
  const tokens = tokenizeGift(text);
  const questions = [];
  let current = 0;
  
  function peek() { //renvoie le token courant sans l'avancer
    return tokens[current];
  }
  function advance() { //renvoie le token courant et avance
    const token = tokens[current];
    current++;
    return token;
  }

  //consomme le token courant s'il correspond au type attendu, sinon lève une erreur 
  function consume(expectedType, errorMessage) { 
      const token = tokens[current];
      if (!token) {
        throw new Error(`Parse error at token ${current}: ${errorMessage}. Found end of input.`);
      }
      if (token.type === expectedType) {
        current++;
        return token;
      }else {
        throw new Error(`Parse error at token ${current}: ${errorMessage}. Found ${token.type} (${token.value})`);
      }
  }
  function collectTextUntil(delimiterTypes) {
    let text = [];
    while (peek() && peek().type !== delimiterTypes) {
        if (peek().type === TOKEN_TYPES.TEXT) {
          text.push(advance().value);
        } else if (peek().type === TOKEN_TYPES.CRLF) {
          advance(); // Ignorer les sauts de ligne
        } else {
          throw new Error(`Unexpected token at position ${current}: ${peek().type} (${peek().value})`);
          break;
        }
    }
    return text.join(' ').trim();
  }
  // Fonction pour parser une question complète
  function parseQuestion() {
    let question = {id: null, text: '', choices: [], feedback: null, type: ''};
    if (peek().type === TOKEN_TYPES.ID_DELIMITER) {
      consume(TOKEN_TYPES.ID_DELIMITER, "Expected question ID delimiter '::'");
      question.id = collectTextUntil(TOKEN_TYPES.START_BLOCK);
  }
}
  // Fonction pour parser les choix de réponses
  function parseChoices() {
    
  }
  //Boucle principale de parsing

  while(peek()) {
    try {
      if (peek().type === TOKEN_TYPES.ID_DELIMITER) {// Début d'une nouvelle question
        questions.push(parseQuestion()); // Appel à une fonction pour parser une question complète et l'ajouter au tableau
      } else if (peek().type === TOKEN_TYPES.CRLF) {
        advance(); // Ignorer les sauts de ligne
      } else {
        throw new Error(`Unexpected token at position ${current}: ${peek().type} (${peek().value})`);
      }
      
    } catch (error) {
      console.error(`Erreur de parsing dans le fichier ${sourceName}: ${error.message}`); 
      break; // Sortir de la boucle en cas d'erreur   
    }
  }
  return questions;
}


  



// lexer GIFT pour faire fonctionner le parseur
function tokenizeGift(text) { //prend en entrée le texte GIFT brut et renvoie une liste de tokens
  const tokens = [];
  const DELIMITER_REGEX = /(\r?\n|::|\{|\}|=|~|#)/g; // Expressions régulières des délimiteurs GIFT
  let lastIndex = 0;
  let match;  

  while ((match = DELIMITER_REGEX.exec(text)) !== null) { // Trouver chaque délimiteur
    const delimiter = match[0];
    const textBefore = text.substring(lastIndex, match.index);

     if (textBefore.trim() !== '') {
      tokens.push({ type: TOKEN_TYPES.TEXT, value: textBefore.trim() });
    }
    switch (delimiter) {
      case '::':
        tokens.push({ type: TOKEN_TYPES.ID_DELIMITER, value: delimiter });  
        break;
      case '{':
        tokens.push({ type: TOKEN_TYPES.START_BLOCK, value: delimiter });
        break;
      case '}':
        tokens.push({ type: TOKEN_TYPES.END_BLOCK, value: delimiter });
        break; 
      case '=':
        tokens.push({ type: TOKEN_TYPES.CORRECT, value: delimiter });
        break;
      case '~':
        tokens.push({ type: TOKEN_TYPES.INCORRECT, value: delimiter });
        break;
      case '#':
        tokens.push({ type: TOKEN_TYPES.FEEDBACK, value: delimiter });
        break;
    default:
        if (delimiter.includes('\n')) {
          tokens.push({ type: TOKEN_TYPES.CRLF, value: delimiter });
        }
        break;
    }
   
  }
   lastIndex = DELIMITER_REGEX.lastIndex;
    remainingText = text.substring(lastIndex);
    if (remainingText.trim() !== '') {
      tokens.push({ type: TOKEN_TYPES.TEXT, value: remainingText.trim() });
    }
  return tokens;
}



/**
 * searchByKeyword(bank, keyword)
 * recherche basique (dans text et title)
 */
export function searchByKeyword(bank, keyword) {
    console.log("Fonction de recherche non encore implémentée.");
}


export function searchByFilter(bank, filters = {}) {

}

/**
 * displayResults(results)
 */
export function displayResults(results = []) {
 
}

/**
 * displayQuestion(question)
 */
export function displayQuestion(q) {
  console.log("Affichage de question non encore implémentée.");

}
