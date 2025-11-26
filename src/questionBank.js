import path from "path";
import { readDirFilesUtf8, readFileUtf8 } from "./utils/io.js";

/**
 * importBank(pathOrDir)
 * - si pathOrDir est un dossier : lit tous les .gift du dossier
 * - si c'est un fichier : lit le fichier
 * renvoie { questions: [ { id, title, text, choices, type, raw } ] }
 */
export async function importBank(pathOrDir) {

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
