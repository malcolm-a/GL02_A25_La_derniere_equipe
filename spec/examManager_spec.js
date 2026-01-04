import {
    createExam,
    addQuestion,
    removeQuestion,
    displayExam,
    verifExam,
} from "../src/examManager.js";

describe("Exam Manager", () => {
    describe("createExam", () => {
        it("crée un examen avec un titre", () => {
            const exam = createExam("Test Exam");

            expect(exam).toBeDefined();
            expect(exam.titre).toBe("Test Exam");
            expect(exam.questions).toEqual([]);
        });

        it("crée un examen avec un titre vide", () => {
            const exam = createExam("");

            expect(exam.titre).toBe("");
            expect(exam.questions).toEqual([]);
        });

        it("crée un examen avec un titre contenant des caractères spéciaux", () => {
            const exam = createExam("Examen de Mathématiques - 2024");

            expect(exam.titre).toBe("Examen de Mathématiques - 2024");
            expect(exam.questions).toEqual([]);
        });
    });

    describe("addQuestion", () => {
        let exam;

        beforeEach(() => {
            exam = createExam("Test Exam");
        });

        it("ajoute une question valide à l'examen", () => {
            const question = {
                id: "q1",
                type: "true_false",
                text: "Test question",
                answer: { correct: true },
            };

            addQuestion(exam, question);

            expect(exam.questions.length).toBe(1);
            expect(exam.questions[0]).toBe(question);
        });

        it("ajoute plusieurs questions à l'examen", () => {
            const q1 = {
                id: "q1",
                type: "true_false",
                text: "Question 1",
                answer: { correct: true },
            };
            const q2 = {
                id: "q2",
                type: "multiple_choice",
                text: "Question 2",
                choices: [],
            };

            addQuestion(exam, q1);
            addQuestion(exam, q2);

            expect(exam.questions.length).toBe(2);
            expect(exam.questions[0].id).toBe("q1");
            expect(exam.questions[1].id).toBe("q2");
        });

        it("n'ajoute pas une question sans id", () => {
            const question = {
                type: "true_false",
                text: "Test question",
            };

            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, question);

            expect(exam.questions.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : format de question invalide."
            );
        });

        it("n'ajoute pas une question sans type", () => {
            const question = {
                id: "q1",
                text: "Test question",
            };

            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, question);

            expect(exam.questions.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : format de question invalide."
            );
        });

        it("n'ajoute pas une question sans text", () => {
            const question = {
                id: "q1",
                type: "true_false",
            };

            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, question);

            expect(exam.questions.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : format de question invalide."
            );
        });

        it("n'ajoute pas une question avec un id déjà présent", () => {
            const q1 = {
                id: "q1",
                type: "true_false",
                text: "First question",
                answer: { correct: true },
            };
            const q2 = {
                id: "q1",
                type: "multiple_choice",
                text: "Second question with same id",
                choices: [],
            };

            addQuestion(exam, q1);
            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, q2);

            expect(exam.questions.length).toBe(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : cette question est déjà présente dans l'examen."
            );
        });

        it("n'ajoute pas une question null", () => {
            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, null);

            expect(exam.questions.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : format de question invalide."
            );
        });

        it("n'ajoute pas une question undefined", () => {
            const consoleSpy = spyOn(console, "log");
            addQuestion(exam, undefined);

            expect(exam.questions.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : format de question invalide."
            );
        });
    });

    describe("removeQuestion", () => {
        let exam;

        beforeEach(() => {
            exam = createExam("Test Exam");
            const q1 = {
                id: "q1",
                type: "true_false",
                text: "Question 1",
                answer: { correct: true },
            };
            const q2 = {
                id: "q2",
                type: "multiple_choice",
                text: "Question 2",
                choices: [],
            };
            const q3 = {
                id: "q3",
                type: "essay",
                text: "Question 3",
            };
            addQuestion(exam, q1);
            addQuestion(exam, q2);
            addQuestion(exam, q3);
        });

        it("retire une question par son ID", () => {
            expect(exam.questions.length).toBe(3);

            removeQuestion(exam, "q2");

            expect(exam.questions.length).toBe(2);
            expect(exam.questions.find((q) => q.id === "q2")).toBeUndefined();
        });

        it("retire la première question", () => {
            removeQuestion(exam, "q1");

            expect(exam.questions.length).toBe(2);
            expect(exam.questions[0].id).toBe("q2");
            expect(exam.questions[1].id).toBe("q3");
        });

        it("retire la dernière question", () => {
            removeQuestion(exam, "q3");

            expect(exam.questions.length).toBe(2);
            expect(exam.questions[0].id).toBe("q1");
            expect(exam.questions[1].id).toBe("q2");
        });

        it("ne fait rien si l'ID n'existe pas", () => {
            const consoleSpy = spyOn(console, "log");
            removeQuestion(exam, "q999");

            expect(exam.questions.length).toBe(3);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur : question introuvable"
            );
        });

        it("retire toutes les questions une par une", () => {
            removeQuestion(exam, "q1");
            removeQuestion(exam, "q2");
            removeQuestion(exam, "q3");

            expect(exam.questions.length).toBe(0);
        });
    });

    describe("displayExam", () => {
        it("affiche un examen vide", () => {
            const exam = createExam("Empty Exam");
            const consoleSpy = spyOn(console, "log");

            displayExam(exam);

            expect(consoleSpy).toHaveBeenCalledWith("Titre : ", "Empty Exam");
            expect(consoleSpy).toHaveBeenCalledWith("Nombre de question : ", 0);
        });

        it("affiche un examen avec des questions", () => {
            const exam = createExam("Test Exam");
            const q1 = {
                id: "q1",
                type: "true_false",
                text: "Is this a test?",
                answer: { correct: true },
            };
            const q2 = {
                id: "q2",
                type: "multiple_choice",
                text: "Choose the correct answer",
                choices: [],
            };
            addQuestion(exam, q1);
            addQuestion(exam, q2);

            const consoleSpy = spyOn(console, "log");
            displayExam(exam);

            expect(consoleSpy).toHaveBeenCalledWith("Titre : ", "Test Exam");
            expect(consoleSpy).toHaveBeenCalledWith("Nombre de question : ", 2);
            expect(consoleSpy).toHaveBeenCalledWith("[q1] Is this a test?");
            expect(consoleSpy).toHaveBeenCalledWith(
                "[q2] Choose the correct answer"
            );
        });
    });

    describe("verifExam", () => {
        it("valide un examen avec 15 questions valides", () => {
            const exam = createExam("Valid Exam");
            for (let i = 1; i <= 15; i++) {
                addQuestion(exam, {
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const consoleSpy = spyOn(console, "log");
            const result = verifExam(exam);

            expect(result.valide).toBe(true);
            expect(result.erreurs.length).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Examen valide : prêt pour export."
            );
        });

        it("valide un examen avec 20 questions", () => {
            const exam = createExam("Max Questions");
            for (let i = 1; i <= 20; i++) {
                addQuestion(exam, {
                    id: `q${i}`,
                    type: "numeric",
                    text: `Question ${i}`,
                    answer: i,
                    margin: 0,
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(true);
            expect(result.erreurs.length).toBe(0);
        });

        it("détecte un nombre insuffisant de questions (< 15)", () => {
            const exam = createExam("Too Few");
            for (let i = 1; i <= 10; i++) {
                addQuestion(exam, {
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.length).toBeGreaterThan(0);
            expect(result.erreurs[0]).toContain(
                "Nombre insuffisant de questions : 10"
            );
        });

        it("détecte un nombre excessif de questions (> 20)", () => {
            const exam = createExam("Too Many");
            for (let i = 1; i <= 25; i++) {
                addQuestion(exam, {
                    id: `q${i}`,
                    type: "essay",
                    text: `Question ${i}`,
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.length).toBeGreaterThan(0);
            expect(result.erreurs[0]).toContain("Trop de questions : 25");
        });

        it("détecte les doublons d'ID", () => {
            const exam = createExam("Duplicates");
            for (let i = 1; i <= 15; i++) {
                addQuestion(exam, {
                    id: "q1", // Même ID pour toutes
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            // Forcer les doublons en modifiant directement le tableau
            exam.questions = [];
            for (let i = 1; i <= 15; i++) {
                exam.questions.push({
                    id: i <= 10 ? "q1" : `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.some((e) => e.includes("doublons"))).toBe(true);
        });

        it("détecte une question sans identifiant", () => {
            const exam = createExam("No ID");
            exam.questions = [
                {
                    type: "true_false",
                    text: "Question without ID",
                    answer: { correct: true },
                },
            ];
            // Ajouter 14 questions valides pour atteindre 15
            for (let i = 1; i <= 14; i++) {
                exam.questions.push({
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(
                result.erreurs.some((e) => e.includes("sans identifiant"))
            ).toBe(true);
        });

        it("détecte une question sans texte", () => {
            const exam = createExam("No Text");
            exam.questions = [
                {
                    id: "q1",
                    type: "true_false",
                    answer: { correct: true },
                },
            ];
            // Ajouter 14 questions valides
            for (let i = 2; i <= 15; i++) {
                exam.questions.push({
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(
                result.erreurs.some((e) => e.includes("champ text manquant"))
            ).toBe(true);
        });

        it("détecte un type de question invalide", () => {
            const exam = createExam("Invalid Type");
            exam.questions = [
                {
                    id: "q1",
                    type: "invalid_type",
                    text: "Question with invalid type",
                },
            ];
            // Ajouter 14 questions valides
            for (let i = 2; i <= 15; i++) {
                exam.questions.push({
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.some((e) => e.includes("problème de type"))).toBe(
                true
            );
        });

        it("détecte une question sans type", () => {
            const exam = createExam("No Type");
            exam.questions = [
                {
                    id: "q1",
                    text: "Question without type",
                },
            ];
            // Ajouter 14 questions valides
            for (let i = 2; i <= 15; i++) {
                exam.questions.push({
                    id: `q${i}`,
                    type: "essay",
                    text: `Question ${i}`,
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.some((e) => e.includes("problème de type"))).toBe(
                true
            );
        });

        it("accepte tous les types de questions valides", () => {
            const exam = createExam("All Types");
            const validTypes = [
                "multiple_choice",
                "true_false",
                "numeric",
                "short_answer",
                "matching",
                "essay",
                "description",
            ];

            validTypes.forEach((type, i) => {
                exam.questions.push({
                    id: `q${i + 1}`,
                    type: type,
                    text: `Question ${i + 1}`,
                });
            });

            // Ajouter 8 questions supplémentaires pour atteindre 15
            for (let i = 8; i <= 15; i++) {
                exam.questions.push({
                    id: `q${i}`,
                    type: "true_false",
                    text: `Question ${i}`,
                    answer: { correct: true },
                });
            }

            const result = verifExam(exam);

            expect(result.valide).toBe(true);
            expect(result.erreurs.length).toBe(0);
        });

        it("détecte plusieurs erreurs simultanément", () => {
            const exam = createExam("Multiple Errors");
            // Seulement 5 questions (< 15)
            exam.questions = [
                { id: "q1", type: "invalid", text: "Q1" }, // Type invalide
                { id: "q2", type: "true_false" }, // Pas de texte
                { type: "essay", text: "Q3" }, // Pas d'ID
                { id: "q4", type: "numeric", text: "Q4" },
                { id: "q5", type: "matching", text: "Q5" },
            ];

            const result = verifExam(exam);

            expect(result.valide).toBe(false);
            expect(result.erreurs.length).toBeGreaterThan(3);
            expect(
                result.erreurs.some((e) => e.includes("Nombre insuffisant"))
            ).toBe(true);
        });
    });
});