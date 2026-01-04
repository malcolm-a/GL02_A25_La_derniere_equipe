/* Fonction permettant de créer un examen*/
export function createExam(title) {
  return {
    titre: title,
    questions: [],
  };
}

/* Fonction permettant d'ajouter une question à l'examen */
export function addQuestion(exam, question) {
  if (!question || !question.id || !question.type || !question.text) {
    console.log("Erreur : format de question invalide.");
  } else if (exam.questions.some((q) => q.id === question.id)) {
    console.log("Erreur : cette question est déjà présente dans l'examen.");
  } else {
    exam.questions.push(question);
    console.log(`Question ${question.id} ajoutée à l'examen ${exam.titre}.`);
  }
}

/* Fonction permettant de retirer une question d'un examen */
export function removeQuestion(exam, ID_Question) {
  const index = exam.questions.findIndex((q) => q.id === ID_Question);
  if (index === -1) {
    console.log("Erreur : question introuvable");
  } else {
    exam.questions.splice(index, 1);
    console.log(`Question ${ID_Question} retirée.`);
  }
}

/* FOnction permettant d'afficher le nombre question, le titre de l'examen et la liste des id des questions */
export function displayExam(exam) {
  console.log("Titre : ", exam.titre);
  console.log("Nombre de question : ", exam.questions.length);
  console.log("Questions : ");
  exam.questions.forEach((element) => {
    console.log(`[${element.id}] ${element.text}`);
  });
}

/* Fonction permettant de vérifier si la validité d'un examen */
export function verifExam(exam) {
  let erreurs = [];

  // Vérification du nombre de question
  const nbQuestion = exam.questions.length;
  if (nbQuestion < 15) {
    erreurs.push(
      `Nombre insuffisant de questions : ${nbQuestion} (minimum requis : 15).`,
    );
  } else if (nbQuestion > 20) {
    erreurs.push(`Trop de questions : ${nbQuestion} (maximum : 15).`);
  }

  // Vérification des doublons
  let idQuestion = exam.questions.map((q) => q.id);
  let doublons = idQuestion.filter(
    (id, index) => idQuestion.indexOf(id) !== index,
  );

  if (doublons.length !== 0) {
    erreurs.push(`Erreur : ${doublons.length} doublons détectés.`);
  }

  // Vérification des questions de l'examen
  const typesValides = [
    "multiple_choice",
    "true_false",
    "numeric",
    "short_answer",
    "matching",
    "essay",
    "description",
  ];
  exam.questions.forEach((question) => {
    if (!question.id) {
      erreurs.push("Question sans identifiant.");
    }
    if (!question.text) {
      erreurs.push(`Question ${question.id} : champ text manquant.`);
    }
    if (!question.type || !typesValides.includes(question.type)) {
      erreurs.push(`Question ${question.id} : problème de type.`);
    }
  });

  if (erreurs.length === 0) {
    console.log("Examen valide : prêt pour export.");
    return {
      valide: true,
      erreurs: [],
    };
  } else {
    console.log("Examen invalide : ");
    erreurs.forEach((erreur) => {
      console.log(erreur);
    });
    return {
      valide: false,
      erreurs: erreurs,
    };
  }
}
