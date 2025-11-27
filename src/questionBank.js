// src/questionBank.js
import path from "path";
import { readDirFilesUtf8, readFileUtf8 } from "./utils/io.js";

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
export function parseGift() {
  
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
