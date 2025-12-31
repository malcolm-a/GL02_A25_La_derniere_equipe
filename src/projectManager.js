import fs from "fs/promises";
import { showError, showSuccess } from "./utils/show.js";

export async function saveExam(exam, path) {
    try {
        const filepath = "./out/exams/" + path;
        const contenu = JSON.stringify(exam, null, 2);
        await fs.writeFile(filepath, contenu, "utf-8");
        showSuccess("Examen sauvegardé avec succès !");
        console.log("Fichier enregistré : ", path);
        return true;
    } catch (e) {
        showError("Erreur lors de la sauvegarde de l'examen");
        console.error(e);
        return false;
    }
}

export async function loadExam(path) {


    try {
        const json = await fs.readFile(path, "utf-8");
        const exam = JSON.parse(json);
        if (!exam.titre || !Array.isArray(exam.questions)) {
            showError("Erreur : format incorrect");
            return null;
        }
        showSuccess("Examen chargé avec succès");
        return exam;
    } catch (e) {
        if (e.code === "ENOENT") {
            showError("Fichier d'examen non trouvé");
        } else {
            showError("Erreur de lecture du projet, format incorrect");
        }
        return null;
    }
}