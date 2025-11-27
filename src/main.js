//on importe les modules nécessaires
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import { importBank, searchByKeyword, displayResults, displayQuestion } from "./questionBank.js";
import { showError, showSuccess } from "./utils/show.js";
import { generateVcard, displayVcard } from "./vcardGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chemin par défaut vers les données 
const DEFAULT_BANK_PATH = path.join(__dirname, "../SujetB_Data");

async function main() {
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
      searchByKeyword(bank, keyword);
   


    } else if (action === "Afficher une question par ID") {
      const { qid } = await inquirer.prompt({
        type: "input",
        name: "qid",
        message: "ID de la question (ex: q1) :"
      });
      displayQuestion(bank, qid);
   
    } else if (action === "Générer un fichier d'identification au format VCard") {
      const { teacher } = await inquirer.prompt([
        {
          type: "input",
          name: "nom",
          message: "Entrez votre nom: (obligatoire)"
        },
        {
          type: "input",
          name: "prenom",
          message: "Entrez votre prénom: (obligatoire)"
        },
        {
          type: "input",
          name: "org",
          message: "Entrez votre organisation: (obligatoire)"
        },
        {
          type: "input",
          name: "email",
          message: "Entrez votre e-mail: (obligatoire)"
        },
        {
          type: "input",
          name: "tel",
          message: "Entrez votre numéro de téléphone: (obligatoire)"
        }
      ]);
      generateVcard(teacher);
    }
  }
}

main().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
