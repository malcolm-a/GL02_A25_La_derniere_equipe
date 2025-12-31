//on importe les modules nécessaires
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import { importBank, searchByKeyword, displayResults, displayQuestion } from "./questionBank.js";
import { examSimulator, summaryExam } from "./examSimulator.js";
import { showError, showSuccess } from "./utils/show.js";
import { generateVcard } from "./vcardGenerator.js";
import { createExam, addQuestion, removeQuestion, displayExam, verifExam } from "./examManager.js";
import { examToGift, saveGift } from "./giftExport.js";
import { computeExamProfile, saveProfileChart, compareGift } from "./examProfiler.js";
import { saveExam, loadExam } from "./projectManager.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin par défaut vers les données 
const DEFAULT_BANK_PATH = path.join(__dirname, "../SujetB_Data");

async function main() {
  let exams = {};
  let currentExam = null;
  let qtrouvee = [];
  console.log(chalk.green("=== démarrage ==="));
  // Charger la banque
  const bank = await importBank(DEFAULT_BANK_PATH);


  console.log("DEBUG: Nombre de questions chargées :", bank.questions.length);
  if (bank.questions.length > 0) {
    console.log("DEBUG: Exemple de question 1 :", JSON.stringify(bank.questions[0], null, 2));
  }
  // Attente des commandes de l'utilisateur 
  while (true) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Que souhaitez-vous faire ?",
      choices: [
        `Selectionner l'examen`,
        "Créer un examen",
        'Afficher l\'examen',
        'Rechercher une question par mot-clé',
        'Afficher une question par ID',
        'Ajouter une question à l\'examen',
        'Retirer une question de l\'examen',
        "Vérifier la validité de l'examen",
        "Simuler l'examen",
        `Sauvegarder l'examen`,
        "Exporter en gift l'examen",
        `Charger un examen`,
        "Générer un profil statistique d'un examen",
        "Comparer les profils d'un examen avec corpus",
        "Générer un fichier d'identification au format VCard",
        'Quitter'
      ]
    });

    //On recupère l'action de l'utilisateur

    //Si l'utilisateur veut quitter, on termine le programme

    if (action === "Quitter") {
      console.log("Au revoir !");
      process.exit(0);
    }

    //Sinon on traite la demande
    if (action === "Rechercher une question par mot-clé") {
      const { keyword } = await inquirer.prompt({
        type: "input",
        name: "keyword",
        message: "Mot-clé :"
      });
      qtrouvee = searchByKeyword(bank, keyword);
      displayResults(qtrouvee);



    } else if (action === "Afficher une question par ID") {
      const { qid } = await inquirer.prompt({
        type: "input",
        name: "qid",
        message: "ID de la question (ex: q1) :"
      });
      displayQuestion(bank, qid);

    } else if (action === "Simuler l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.")
      } else {
        await summaryExam(currentExam, examSimulator(currentExam)); // arguments: exam et list_answers renvoyée par examSimulator()
      }
    } else if (action === "Générer un fichier d'identification au format VCard") {
      const teacher = await inquirer.prompt([
        {
          type: "input",
          name: "nom",
          message: "[Obligatoire] Entrez votre nom:"
        },
        {
          type: "input",
          name: "prenom",
          message: "[Obligatoire] Entrez votre prénom:"
        },
        {
          type: "input",
          name: "org",
          message: "[Facultatif] Entrez votre organisation:"
        },
        {
          type: "input",
          name: "email",
          message: "[Facultatif] Entrez votre e-mail:"
        },
        {
          type: "input",
          name: "tel",
          message: "[Facultatif] Entrez votre numéro de téléphone:"
        }
      ]);
      await generateVcard(teacher);


    } else if (action === "Créer un examen") {
      const { title } = await inquirer.prompt({
        type: "input",
        name: "title",
        message: "Titre de l'examen : "
      });
      if (exams[title]) {
        console.log("Un examen avec ce titre existe déjà !");
      } else {
        const newExam = createExam(title);
        exams[title] = newExam;
        currentExam = newExam;
        console.log("Examen créé !");
      }





    } else if (action === "Selectionner l'examen") {

      if (currentExam == null) {
        console.log("Aucun examen disponible. Créez-en un d'abord.");
      } else {
        const { selectedTitle } = await inquirer.prompt({
          type: "list",
          name: "selectedTitle",
          message: "Choisissez l'examen :",
          choices: Object.keys(exams)
        });
        currentExam = exams[selectedTitle];
      }





    } else if (action === "Ajouter une question à l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        const { qid } = await inquirer.prompt({
          type: "input",
          name: "qid",
          message: "ID de la question à ajouter : "
        });
        const question = bank.questions.find(q => q.id === qid);
        if (!question) {
          console.log("Question introuvable dans la banque.");
        } else {
          addQuestion(currentExam, question);
        }
      }



    } else if (action === "Retirer une question de l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        const { qid } = await inquirer.prompt({
          type: "input",
          name: "qid",
          message: "ID de la question à retirer : "
        });
        removeQuestion(currentExam, qid);
      }



    } else if (action === "Afficher l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        displayExam(currentExam);
      }


    } else if (action === "Vérifier la validité de l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        verifExam(currentExam);
      }



    } else if (action === "Exporter en gift l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        if (!verifExam(currentExam)) {
          console(verifExam(currentExam));
          continue;
        }
        const { filepath } = await inquirer.prompt({
          type: "input",
          name: "filepath",
          message: "Sous quel nom voulez-vous enregister l'examen ? "
        });
        const gift = examToGift(currentExam);
        const success = await saveGift(gift, filepath + ".gift");
        if (success) {
          console.log("Export terminé");
        } else {
          console.log("Erreur");
        }
      }



    } else if (action === "Générer un profil statistique d'un examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        if (!verifExam(currentExam)) {
          console(verifExam(currentExam));
          continue;
        }
        const profile = computeExamProfile(currentExam);
        console.log("Profil généré");
        const { filepath } = await inquirer.prompt({
          type: "input",
          name: "filepath",
          message: "Sous quel nom voulez-vous enregister le profil ? "
        });
        saveProfileChart(profile, filepath + ".html");
      }



    } else if (action === "Comparer les profils d'un examen avec corpus") {

      const examDir = path.join(__dirname, "../out/exams");
      let fichiers;

      try {
        fichiers = (await fs.readdir(examDir)).filter(f => f.endsWith(".gift"));
      } catch {
        console.log("Aucun dossier exams/ trouvé");
        continue;
      }

      if (fichiers.length === 0) {
        console.log("Aucun examen sauvegardé");
      }
      const { selectedTitle } = await inquirer.prompt({
        type: "list",
        name: "selectedTitle",
        message: `Choisissez l'examen à comparer :`,
        choices: fichiers
      });

      const corpusDir = path.join(__dirname, "../SujetB_data");
      let fichiersCorpus;

      try {
        fichiersCorpus = (await fs.readdir(corpusDir)).filter(f => f.endsWith(".gift"));
      } catch {
        console.log("Aucun dossier trouvé");
        continue;
      }

      if (fichiersCorpus.length === 0) {
        console.log("Aucun examen sauvegardé");
      }
      const { selectedCorpus } = await inquirer.prompt({
        type: "list",
        name: "selectedCorpus",
        message: `Choisissez le corpus à comparer :`,
        choices: fichiersCorpus
      });

      const examPath = path.join(examDir, selectedTitle);
      const corpusPath = path.join(corpusDir, selectedCorpus);

      await compareGift(examPath, corpusPath);






    } else if (action === "Sauvegarder l'examen") {
      if (!currentExam) {
        console.log("Vous devez d'abord créer un examen.");
      } else {
        if (!verifExam(currentExam)) {
          console(verifExam(currentExam));
          continue;
        }
        const { filepath } = await inquirer.prompt({
          type: "input",
          name: "filepath",
          message: "Sous quel nom voulez-vous enregister l'examen ? "
        });
        const sauvegarde = await saveExam(currentExam, filepath + ".json");
        if (sauvegarde) {
          console.log("Sauvegarde réussie");
        }
      }


    } else if (action === "Charger un examen") {

      const examDir = path.join(__dirname, "../out/exams");
      let fichiers;

      try {
        fichiers = (await fs.readdir(examDir)).filter(f => f.endsWith(".json"));
      } catch {
        console.log("Aucun dossier exams/ trouvé");
        continue;
      }

      if (fichiers.length === 0) {
        console.log("Aucun examen sauvegardé");
      }

      const { selectedFile } = await inquirer.prompt({
        type: "list",
        name: "selectedFile",
        message: `Choisissez un examen à charger :`,
        choices: fichiers
      });


      const filepath = examDir + "/" + selectedFile;
      const charge = await loadExam(filepath);

      if (charge) {
        exams[charge.titre] = charge;
        currentExam = charge;
        console.log("Examen chargé !");
      }
    }

  }
}

main().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
