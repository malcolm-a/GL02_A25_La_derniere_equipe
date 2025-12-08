import chalk from "chalk";
//typesValides = ["multiple_choice","true_false", "numeric", "short_answer", "matching", "essay", "description"];

function getRandomInt(min = 0, max) { // min inclus, max exclus
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

function shuffle(array) { // algorithme de Fisher-Yales, permet de mélanger un array aléatoirement
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
};


export function examSimulator(exam) {
    let list_answers = [];
    for (const q of exam.questions) {
        if (q.type === "multiple_choice") {
            let nb = getRandomInt(q.choices.length); // on choisit une répnse aléatoire parmi les choix
            list_answers.push(q.choices[nb]); // on ajoute cette réponse là 

        } else if (q.type === "true_false") {
            const tf = [true,false];
            let ind = getRandomInt(2);
            list_answers.push(tf[ind]);

        } else if (q.type === "numeric") {
            list_answers.push(getRandomInt(10)); // entier aléatoire entre 0 et 10
            
        } else if (q.type === "short_answer") {
            list_answers.push("Short answer here"); // pas faisable aléatoirement


        } else if (q.type === "matching") {
            let lefts = [], rights = [], newpairs = [];
            for (let i = 0; i < q.pairs.length; i++) { // récupérer les left & right pr former des paires random
                lefts.push(q.pairs[i].left);
                rights.push(q.pairs[i].right);
            }
            // mélanger les 2 listes pr ensuite créer des paires facilement
            shuffle(lefts);
            shuffle(rights);
            for (let i = 0; i < lefts.length; i++) {
                newpairs.push({
                    left: lefts[i],
                    right: rights[i]
                });
            };
            
            list_answers.push(newpairs);

        } else if (q.type === "essay") {
            list_answers.push("Essay here"); // pas faisable aléatoirement
            
        } else if (q.type === "description") {
            list_answers.push(q.text);
        }

    };
    return list_answers;
};

export async function summaryExam(exam, list_answers) {
    if (list_answers.length != exam.questions.length) {
        console.log("Erreur lors de la simulation de réponses.  " + list_answers.length + "   " + exam.questions.length);
        return;
    } else {
        let score = 0;
        console.log("===== Résultats de simulation =====\n")
        for (let i = 0; i < list_answers.length; i++) {
            if (exam.questions[i].type === "multiple_choice") {
                console.log(exam.questions[i].text + "\n");


            } else if (exam.questions[i].type === "true_false") {
                console.log(exam.questions[i].text + "\n");
                if (exam.questions[i].answer === list_answers[i]) {
                    score++;
                    console.log(chalk.green(list_answers[i] + ": Correct\n"));
                } else {
                    console.log(chalk.red(list_answers[i] + ": Incorrect\n"));
                };

            } else if (exam.questions[i].type === "numeric") {
                console.log(exam.questions[i].text + "\n");
                if (exam.questions[i].margin) {
                    if ((list_answers[i] >= exam.questions[i].answer-exam.questions[i].margin) && (list_answers[i] <= exam.questions[i].answer+exam.questions[i].margin)) {
                        score++;
                        console.log(chalk.green(list_answers[i] + ": Correct\n"))
                    } else {
                        console.log(chalk.red(list_answers[i] + ": Incorrect (bonne réponse = " + exam.questions[i].answer+")\n"));
                    }
                } else {
                    if (list_answers[i] === exam.questions[i].answer) {
                        score++;
                        console.log(chalk.green(list_answers[i] + ": Correct\n"));
                    } else {
                        console.log(chalk.red(list_answers[i] + ": Incorrect (bonne réponse = " + exam.questions[i].answer+")\n"));
                    }
                };

            } else if (exam.questions[i].type === "short_answer") {
                console.log(exam.questions[i].text + "\n");
                score += 0.5;
                console.log(chalk.yellow(list_answers[i] + " (not randomizable)\n"))

            } else if (exam.questions[i].type === "matching") {
                console.log(exam.questions[i].text + "\n");
                let isCorrect = true;
                for (let j = 0; j < list_answers[i].length; j++) {
                    for (let k = 0; k < exam.questions[i].pairs.length; k++) {
                        if (list_answers[i][j] === exam.questions[i].pairs[k]) {
                            console.log(chalk.green(list_answers[i][j].left + " -> " + list_answers[i][j].right + "\n"));
                        } else {
                            console.log(chalk.red(list_answers[i][j].left + " -> " + list_answers[i][j].right + "\n"));
                            isCorrect = false; // si 1 erreur on ne donne pas le point
                        }
                    }
                }
                if (isCorrect) score++;

            } else if (exam.questions[i].type === "essay") {
                console.log(exam.questions[i].text + "\n");
                score += 0.5;
                console.log(chalk.yellow(list_answers[i] + " (not randomizable)\n"))

            } else if (exam.questions[i].type === "description") {
                console.log(exam.questions[i].text + "\n");
                score++;
            }
        }
        console.log("===== Fin de simulation =====\n");
        console.log("Score obtenu: " + score + " / " + exam.questions.length + " (les short answers et essays valent pour 0.5 et les desc pour 1\n");
    };
    
};