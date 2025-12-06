//typesValides = ["multiple_choice","true_false", "numeric", "short_answer", "matching", "essay", "description"];

function getRandomInt(min = 0, max) { //min inclus, max exclus
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function examSimulator(exam) {
    let list_answers = [];
    for (const q of exam.questions) {
        if (q.type === "multiple_choice") {
            let nb = getRandomInt(q.choices.length); // on choisit une répnse aléatoire parmi les choix
            list_answers.push(q.choices[nb]); // on ajoute que cette réponse là 

        } else if (q.type === "true_false") {
            const tf = [true,false];
            let ind = getRandomInt(0,2);
            list_answers.push(tf[ind]);

        } else if (q.type === "numeric") {
            list_answers.push(null);
            
        } else if (q.type === "short_answer") {
            list_answers.push(null);


        } else if (q.type === "matching") {
            list_answers.push(null);

        } else if (q.type === "essay") {
            list_answers.push("Essay here");
            
        }

    }
};

export function summaryExam(list_answer) {
    
};