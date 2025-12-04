//on importe les modules nécessaires
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import { importBank, searchByKeyword, displayResults, displayQuestion } from "./questionBank.js";
import { showError, showSuccess } from "./utils/show.js";
import {createExam, addQuestion, removeQuestion, displayExam, verifExam} from "./examManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin par défaut vers les données 
const DEFAULT_BANK_PATH = path.join(__dirname, "../SujetB_Data");

async function main() {

  let exam = null;

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
        "Ajouter une question à l'examen",
        "Retirer une question de l'examen",
        "Afficher l'examen",
        "Vérifier la validité de l'examen",
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
      exam = createExam(title);
      console.log("Examen créé !");



    }else if (action === "Ajouter une question à l'examen"){
      if (!exam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { qid } = await inquirer.prompt({
        type : "input",
        name: "qid",
        message : "ID de la question à ajouter : "
        });
        const question = banq.questions.find(q => q.id === qid);
        if (!question){
          console.log("Question introuvable dans la banque.");
        }else {
          addQuestion(exam, question);
        }
      }



    }else if (action === "Retirer une question de l'examen"){
      if (!exam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        const { qid } = await inquirer.prompt({
        type : "input",
        name: "qid",
        message : "ID de la question à retirer : "
        });
        removeQuestion(exam, qid);
      }



    }else if (action === "Afficher l'examen"){
      if (!exam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        displayExam(exam);
      }


    }else if(action === "Vérifier la validité de l'examen"){
      if (!exam){
        console.log("Vous devez d'abord créer un examen.");
      }else{
        verifExam(exam);
      }
    }
    
  }
}

main().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
