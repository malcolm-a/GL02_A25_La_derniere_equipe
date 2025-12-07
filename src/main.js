//on importe les modules nécessaires
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import { importBank, searchByKeyword, displayResults, displayQuestion } from "./questionBank.js";
import { showError, showSuccess } from "./utils/show.js";
import {createExam, addQuestion, removeQuestion, displayExam, verifExam} from "./examManager.js";
import {examToGift, saveGift} from "./giftExport.js";
import {computeExamProfile, compareProfiles, displayComparaison, saveProfileChart} from "./examProfiler.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin par défaut vers les données 
const DEFAULT_BANK_PATH = path.join(__dirname, "../SujetB_Data");

async function main() {

  let exams = {};
  let currentExam = null;

  console.log(chalk.green("=== démarrage ==="));
  // Charger la banque
  const bank = await importBank(DEFAULT_BANK_PATH);

  // Attente des commandes de l'utilisateur 
  while (true) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Que souhaitez-vous faire ?",
      choices: [
        'Rechercher une question par mot-clé',
        'Afficher une question par ID',
        'Créer un examen',
        `Selectionner l'examen`,
        "Ajouter une question à l'examen",
        "Retirer une question de l'examen",
        "Afficher l'examen",
        "Vérifier la validité de l'examen",
        "Exporter en gift l'examen",
        "Générer un profil statistique d'un examen",
        "Comparer les profils de 2 examens",
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
      searchByKeyword(bank, keyword);
   


    } else if (action === "Afficher une question par ID") {
      const { qid } = await inquirer.prompt({
        type: "input",
        name: "qid",
        message: "ID de la question (ex: q1) :"
      });
      displayQuestion(bank, qid);
   


    } else if (action === "Créer un examen"){
      const { title } = await inquirer.prompt({
        type : "input",
        name: "title",
        message : "Titre de l'examen : "
      });
      if (exams[title]){
        console.log("Un examen avec ce titre existe déjà !");
      }else{
        const newExam = createExam(title);
        exams[title] = newExam;
        currentExam = newExam;
        console.log("Examen créé !");
      }
      
      



    } else if (action === "Selectionner l'examen"){
      
      if (currentExam==null){
        console.log("Aucun examen disponible. Créez-en un d'abord.");
      }else{
        const { selectedTitle } = await inquirer.prompt({
          type: "list",
          name: "selectedTitle",
          message: "Choisissez l'examen :",
          choices: Object.keys(exams)
        });
        currentExam = exams[selectedTitle];
      }
      
      



    }else if (action === "Ajouter une question à l'examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { qid } = await inquirer.prompt({
        type : "input",
        name: "qid",
        message : "ID de la question à ajouter : "
        });
        const question = bank.questions.find(q => q.id === qid);
        if (!question){
          console.log("Question introuvable dans la banque.");
        }else {
          addQuestion(currentExam, question);
        }
      }



    }else if (action === "Retirer une question de l'examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { qid } = await inquirer.prompt({
        type : "input",
        name: "qid",
        message : "ID de la question à retirer : "
        });
        removeQuestion(currentExam, qid);
      }



    }else if (action === "Afficher l'examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        displayExam(currentExam);
      }


    }else if(action === "Vérifier la validité de l'examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        verifExam(currentExam);
      }
    }else if(action === "Exporter en gift l'examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { filepath } = await inquirer.prompt({
        type : "input",
        name: "filepath",
        message : "Sous quel nom voulez-ous enregister l'examen ? "
        });
        const gift = examToGift(currentExam);
        const success = await saveGift(gift, filepath+".gift");
        if (success){
          console.log("Export terminé");
        }else{
          console.log("Erreur");
        }
      }



    }else if(action === "Générer un profil statistique d'un examen"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const profile = computeExamProfile(currentExam);
        console.log("Profil généré");
        for (const [type, count] of Object.entries(profile.type)){
          console.log(profile.pourcentage[type]);
        }
        const { filepath } = await inquirer.prompt({
        type : "input",
        name: "filepath",
        message : "Sous quel nom voulez-ous enregister le profil ? "
        });
        saveProfileChart(profile, filepath+".html");
      }



    }else if(action === "Comparer les profils de 2 examens"){
      if (!currentExam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { selectedTitle } = await inquirer.prompt({
          type: "list",
          name: "selectedTitle",
          message: `Choisissez l'examen à comparer avec ${currentExam.titre}:`,
          choices: Object.keys(exams)
        });
        const examCompare = exams[selectedTitle];
        const profil1 = computeExamProfile(currentExam);
        const profil2 = computeExamProfile(examCompare);
        const comparaison = compareProfiles(profil1, profil2);
        displayComparaison(comparaison);
      }
    }
    
  }
}

main().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
