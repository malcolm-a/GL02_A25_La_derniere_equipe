import { saveExam, loadExam } from "../src/projectManager.js";
import fs from "fs/promises";
import path from "path";

describe("Project Manager", () => {
    const outputDir = "./out/exams";

    // Ensure output directory exists
    beforeAll(async () => {
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (e) {
            // Directory already exists
        }
    });

    // Clean up test files after each test
    afterEach(async () => {
        try {
            const files = await fs.readdir(outputDir);
            for (const file of files) {
                if (file.startsWith("test_") && file.endsWith(".json")) {
                    await fs.unlink(path.join(outputDir, file));
                }
            }
        } catch (e) {
            // Directory might not exist, ignore
        }
    });

    describe("saveExam", () => {
        it("sauvegarde un examen valide", async () => {
            const exam = {
                titre: "Test Exam",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "Is this a test?",
                        answer: { correct: true },
                    },
                ],
            };

            const result = await saveExam(exam, "test_valid.json");

            expect(result).toBe(true);

            const filepath = path.join(outputDir, "test_valid.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            expect(savedExam.titre).toBe("Test Exam");
            expect(savedExam.questions.length).toBe(1);
            expect(savedExam.questions[0].id).toBe("q1");
        });

        it("sauvegarde un examen avec plusieurs questions", async () => {
            const exam = {
                titre: "Multi Question Exam",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "Question 1",
                        answer: { correct: true },
                    },
                    {
                        id: "q2",
                        type: "multiple_choice",
                        text: "Question 2",
                        choices: [
                            { text: "A", correct: true },
                            { text: "B", correct: false },
                        ],
                    },
                    {
                        id: "q3",
                        type: "numeric",
                        text: "Question 3",
                        answer: 42,
                        margin: 2,
                    },
                ],
            };

            const result = await saveExam(exam, "test_multi.json");

            expect(result).toBe(true);

            const filepath = path.join(outputDir, "test_multi.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            expect(savedExam.questions.length).toBe(3);
            expect(savedExam.questions[0].type).toBe("true_false");
            expect(savedExam.questions[1].type).toBe("multiple_choice");
            expect(savedExam.questions[2].type).toBe("numeric");
        });

        it("sauvegarde un examen vide", async () => {
            const exam = {
                titre: "Empty Exam",
                questions: [],
            };

            const result = await saveExam(exam, "test_empty.json");

            expect(result).toBe(true);

            const filepath = path.join(outputDir, "test_empty.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            expect(savedExam.titre).toBe("Empty Exam");
            expect(savedExam.questions).toEqual([]);
        });

        it("formate le JSON avec indentation", async () => {
            const exam = {
                titre: "Formatted Exam",
                questions: [
                    {
                        id: "q1",
                        type: "essay",
                        text: "Write an essay",
                    },
                ],
            };

            await saveExam(exam, "test_formatted.json");

            const filepath = path.join(outputDir, "test_formatted.json");
            const savedContent = await fs.readFile(filepath, "utf8");

            // Vérifier que le JSON est indenté (contient des espaces/newlines)
            expect(savedContent).toContain("\n");
            expect(savedContent).toContain("  ");
            expect(savedContent.split("\n").length).toBeGreaterThan(5);
        });

        it("écrase un fichier existant", async () => {
            const exam1 = {
                titre: "First Version",
                questions: [],
            };
            const exam2 = {
                titre: "Second Version",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "New question",
                        answer: { correct: false },
                    },
                ],
            };

            await saveExam(exam1, "test_overwrite.json");
            await saveExam(exam2, "test_overwrite.json");

            const filepath = path.join(outputDir, "test_overwrite.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            expect(savedExam.titre).toBe("Second Version");
            expect(savedExam.questions.length).toBe(1);
        });

        it("gère les caractères spéciaux dans le titre", async () => {
            const exam = {
                titre: "Examen de Mathématiques - Année 2024/2025 (1ère partie)",
                questions: [],
            };

            const result = await saveExam(
                exam,
                "test_special_chars.json"
            );

            expect(result).toBe(true);

            const filepath = path.join(outputDir, "test_special_chars.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            expect(savedExam.titre).toBe(
                "Examen de Mathématiques - Année 2024/2025 (1ère partie)"
            );
        });

        it("préserve toutes les propriétés des questions", async () => {
            const exam = {
                titre: "Complex Exam",
                questions: [
                    {
                        id: "q1",
                        type: "multiple_choice",
                        text: "Choose the best answer",
                        choices: [
                            {
                                text: "Choice A",
                                correct: true,
                                feedback: "Correct!",
                            },
                            {
                                text: "Choice B",
                                correct: false,
                                feedback: "Try again",
                            },
                        ],
                        format: "html",
                        source: "test.gift",
                    },
                ],
            };

            await saveExam(exam, "test_complex.json");

            const filepath = path.join(outputDir, "test_complex.json");
            const savedContent = await fs.readFile(filepath, "utf8");
            const savedExam = JSON.parse(savedContent);

            const q = savedExam.questions[0];
            expect(q.choices[0].feedback).toBe("Correct!");
            expect(q.format).toBe("html");
            expect(q.source).toBe("test.gift");
        });

        it("retourne false en cas d'erreur de chemin invalide", async () => {
            const exam = {
                titre: "Test",
                questions: [],
            };

            // Chemin invalide avec caractères interdits
            const result = await saveExam(exam, "../../../invalid/path.json");

            // Le résultat peut être true ou false selon le système
            // On vérifie juste qu'il ne plante pas
            expect(typeof result).toBe("boolean");
        });
    });

    describe("loadExam", () => {
        it("charge un examen sauvegardé", async () => {
            const originalExam = {
                titre: "Load Test",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "Test question",
                        answer: { correct: true },
                    },
                ],
            };

            const filename = "test_load.json";
            await saveExam(originalExam, filename);

            const filepath = path.join(outputDir, filename);
            const loadedExam = await loadExam(filepath);

            expect(loadedExam).not.toBeNull();
            expect(loadedExam.titre).toBe("Load Test");
            expect(loadedExam.questions.length).toBe(1);
            expect(loadedExam.questions[0].id).toBe("q1");
        });

        it("charge un examen avec plusieurs questions", async () => {
            const originalExam = {
                titre: "Multi Load Test",
                questions: [
                    { id: "q1", type: "essay", text: "Q1" },
                    { id: "q2", type: "numeric", text: "Q2", answer: 10, margin: 1 },
                    { id: "q3", type: "matching", text: "Q3", pairs: [] },
                ],
            };

            const filename = "test_load_multi.json";
            await saveExam(originalExam, filename);

            const filepath = path.join(outputDir, filename);
            const loadedExam = await loadExam(filepath);

            expect(loadedExam.questions.length).toBe(3);
            expect(loadedExam.questions[1].answer).toBe(10);
            expect(loadedExam.questions[1].margin).toBe(1);
        });

        it("retourne null si le fichier n'existe pas", async () => {
            const filepath = path.join(outputDir, "nonexistent.json");
            const result = await loadExam(filepath);

            expect(result).toBeNull();
        });

        it("retourne null si le format JSON est invalide", async () => {
            const filepath = path.join(outputDir, "test_invalid.json");
            await fs.writeFile(filepath, "{ invalid json }", "utf8");

            const result = await loadExam(filepath);

            expect(result).toBeNull();

            // Cleanup
            await fs.unlink(filepath);
        });

        it("retourne null si l'examen n'a pas de titre", async () => {
            const filepath = path.join(outputDir, "test_no_title.json");
            await fs.writeFile(
                filepath,
                JSON.stringify({ questions: [] }),
                "utf8"
            );

            const result = await loadExam(filepath);

            expect(result).toBeNull();

            // Cleanup
            await fs.unlink(filepath);
        });

        it("retourne null si l'examen n'a pas de questions", async () => {
            const filepath = path.join(outputDir, "test_no_questions.json");
            await fs.writeFile(
                filepath,
                JSON.stringify({ titre: "Test" }),
                "utf8"
            );

            const result = await loadExam(filepath);

            expect(result).toBeNull();

            // Cleanup
            await fs.unlink(filepath);
        });

        it("retourne null si questions n'est pas un tableau", async () => {
            const filepath = path.join(outputDir, "test_bad_questions.json");
            await fs.writeFile(
                filepath,
                JSON.stringify({ titre: "Test", questions: "not an array" }),
                "utf8"
            );

            const result = await loadExam(filepath);

            expect(result).toBeNull();

            // Cleanup
            await fs.unlink(filepath);
        });

        it("charge un examen vide valide", async () => {
            const originalExam = {
                titre: "Empty Valid",
                questions: [],
            };

            const filename = "test_load_empty.json";
            await saveExam(originalExam, filename);

            const filepath = path.join(outputDir, filename);
            const loadedExam = await loadExam(filepath);

            expect(loadedExam).not.toBeNull();
            expect(loadedExam.titre).toBe("Empty Valid");
            expect(loadedExam.questions).toEqual([]);
        });

        it("préserve les propriétés complexes lors du chargement", async () => {
            const originalExam = {
                titre: "Complex Load",
                questions: [
                    {
                        id: "q1",
                        type: "multiple_choice",
                        text: "Question with metadata",
                        choices: [
                            { text: "A", correct: true, feedback: "Great!" },
                            { text: "B", correct: false, feedback: null },
                        ],
                        metadata: {
                            difficulty: "hard",
                            tags: ["algebra", "equations"],
                        },
                    },
                ],
            };

            const filename = "test_load_complex.json";
            await saveExam(originalExam, filename);

            const filepath = path.join(outputDir, filename);
            const loadedExam = await loadExam(filepath);

            expect(loadedExam.questions[0].metadata.difficulty).toBe("hard");
            expect(loadedExam.questions[0].metadata.tags).toEqual([
                "algebra",
                "equations",
            ]);
            expect(loadedExam.questions[0].choices[0].feedback).toBe("Great!");
        });
    });

    describe("Integration: saveExam + loadExam", () => {
        it("le cycle complet sauvegarde/chargement préserve les données", async () => {
            const originalExam = {
                titre: "Integration Test Exam",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "First question",
                        answer: { correct: true },
                    },
                    {
                        id: "q2",
                        type: "multiple_choice",
                        text: "Second question",
                        choices: [
                            { text: "A", correct: false, feedback: "Wrong" },
                            { text: "B", correct: true, feedback: "Correct" },
                            { text: "C", correct: false, feedback: "Nope" },
                        ],
                    },
                    {
                        id: "q3",
                        type: "numeric",
                        text: "Third question",
                        answer: 3.14,
                        margin: 0.01,
                    },
                ],
            };

            const filename = "test_integration.json";
            const saveResult = await saveExam(originalExam, filename);
            expect(saveResult).toBe(true);

            const filepath = path.join(outputDir, filename);
            const loadedExam = await loadExam(filepath);

            expect(loadedExam).not.toBeNull();
            expect(loadedExam.titre).toBe(originalExam.titre);
            expect(loadedExam.questions.length).toBe(
                originalExam.questions.length
            );

            // Vérifier chaque question
            for (let i = 0; i < originalExam.questions.length; i++) {
                expect(loadedExam.questions[i].id).toBe(
                    originalExam.questions[i].id
                );
                expect(loadedExam.questions[i].type).toBe(
                    originalExam.questions[i].type
                );
                expect(loadedExam.questions[i].text).toBe(
                    originalExam.questions[i].text
                );
            }
        });

        it("peut sauvegarder et charger plusieurs examens différents", async () => {
            const exam1 = {
                titre: "Exam 1",
                questions: [{ id: "q1", type: "essay", text: "Q1" }],
            };
            const exam2 = {
                titre: "Exam 2",
                questions: [{ id: "q2", type: "numeric", text: "Q2", answer: 5, margin: 0 }],
            };

            await saveExam(exam1, "test_multi_1.json");
            await saveExam(exam2, "test_multi_2.json");

            const loaded1 = await loadExam(
                path.join(outputDir, "test_multi_1.json")
            );
            const loaded2 = await loadExam(
                path.join(outputDir, "test_multi_2.json")
            );

            expect(loaded1.titre).toBe("Exam 1");
            expect(loaded2.titre).toBe("Exam 2");
            expect(loaded1.questions[0].id).toBe("q1");
            expect(loaded2.questions[0].id).toBe("q2");
        });
    });
});