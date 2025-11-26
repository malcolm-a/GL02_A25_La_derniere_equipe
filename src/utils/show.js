import chalk from "chalk"; // Pour la couleur dans la console

export function showError(msg) {
  console.log(chalk.red("Erreur :  " + msg));
}

export function showSuccess(msg) {
  console.log(chalk.green("Succès : " + msg));
}

export function showInfo(msg) {
  console.log(chalk.blue("Info : " + msg));
}
