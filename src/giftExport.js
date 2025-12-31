import fs from "fs/promises";

// ===============================================================
//  TRUE/FALSE
// ===============================================================

function giftTrueFalse(question) {
    const id = question.id;
    const enonce = question.text;
    let valeur;
    if (question.answer.correct) {
        valeur = "T";
    } else {
        valeur = "F";
    }
    return `::${id}:: ${enonce} {${valeur}}\n\n`;
}

// ===============================================================
//  NUMERIC
// ===============================================================

function giftNumeric(question) {
    const id = question.id;
    const enonce = question.text;
    const valeur = Number(question.answer);
    const marge = Number(question.margin);
    if (question.margin > 0) {
        return `::${id}:: ${enonce} { =${valeur}:${marge} }\n\n`;
    } else {
        return `::${id}:: ${enonce} { =${valeur} }\n\n`;
    }
}

// ===============================================================
//  SHORT ANSWER (=a =b =c)
// ===============================================================

function giftShortAnswer(question) {
    const id = question.id;
    const enonce = question.text;
    const choix = question.answers.map(c => {
        const text = c.text
        const fb = c.feedback ? ` # ${c.feedback}` : "";
        return `=${text}${fb}`;
    }).join(" ");
    return `::${id}:: ${enonce} { ${choix} }\n\n`;
}

// ===============================================================
//  MATCHING : a -> b
// ===============================================================

function giftMatching(question) {
    const id = question.id;
    const enonce = question.text;
    const choix = question.pairs.map(c => {
        const l = c.left;
        const r = c.right;
        return `=${l} -> ${r}`;
    }).join("\n");
    return `::${id}:: ${enonce} {\n${choix}\n}\n\n`;
}

// ===============================================================
//  CHOIX MULTIPLE OU MOT MANQUANT
// ===============================================================

function giftChoices(question) {
    const id = question.id;
    const enonce = question.text;
    const choix = question.choices.map(c => {
        let correct;
        if (c.correct) {
            correct = "=";
        } else {
            correct = "~";
        }
        const text = c.text;
        const fb = c.feedback ? ` # ${c.feedback}` : "";
        return `${correct}${text}${fb}`;
    }).join(" ");
    return `::${id}:: ${enonce} { ${choix} }\n\n`;
}

// ===============================================================
//  ESSAY
// ===============================================================

function giftEssay(question) {
    const id = question.id;
    const enonce = question.text;
    return `::${id}:: ${enonce} {}\n\n`;
}


export function examToGift(exam) {
    let gift = `// Export GIFT - Examen : ${exam.titre}\n\n`;
    for (const question of exam.questions) {

        if (question.type === "true_false") {
            gift += giftTrueFalse(question);
        } else if (question.type === "numeric") {
            gift += giftNumeric(question);
        } else if (question.type === "short_answer") {
            gift += giftShortAnswer(question);
        } else if (question.type === "matching") {
            gift += giftMatching(question);
        } else if (question.type === "multiple_choice") {
            gift += giftChoices(question);
        } else if (question.type === "essay") {
            gift += giftEssay(question);
        } else {
            gift += `// Type inconnu pour la question ${question.id} (${question.type})\n::${question.id}:: ${question.text} {}\n\n`;
        }

    }
    return gift;
}


export async function saveGift(gift, path) {
    if (gift === null) {
        console.log("Erreur : contenu vide, sauvegarde annulée.");
        return false;
    }
    try {
        const filepath = "./out/exams/" + path;
        await fs.writeFile(filepath, gift, "utf8");
        console.log(`Fichier enregistré vers ${path}`)
        return true;
    } catch (e) {
        console.log("Erreur lors de la sauvegarde du fichier GIFT");
        return false;
    }
}