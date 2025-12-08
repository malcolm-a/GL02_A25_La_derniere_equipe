//typesValides = ["multiple_choice","true_false", "numeric", "short_answer", "matching", "essay", "description"];

function getRandomInt(min = 0, max) { //min inclus, max exclus
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function examSimulator(exam) {
    let list_answers = [];
    for (let q of exam.questions) {
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
            list_answers.push(null);

        } else if (q.type === "essay") {
            list_answers.push("Essay here"); // pas faisable aléatoirement
            
        }

    };
    return list_answers;
};

export function summaryExam(exam, list_answers) {
    if (list_answers.length != exam.questions.length) {
        console.log("Erreur lors de la simulation de réponses.");
        return;
    } else {
        return;
    };
    
};