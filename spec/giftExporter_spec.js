import { examToGift, saveGift } from "../src/giftExport.js";
import fs from "fs/promises";
import path from "path";

describe("GIFT Exporter", () => {
    const outputDir = "./out/exams";

    // Clean up test files after each test
    afterEach(async () => {
        try {
            const files = await fs.readdir(outputDir);
            for (const file of files) {
                if (file.startsWith("test_") && file.endsWith(".gift")) {
                    await fs.unlink(path.join(outputDir, file));
                }
            }
        } catch (e) {
            // Directory might not exist, ignore
        }
    });

    describe("examToGift", () => {
        it("exporte un examen avec une question true/false", () => {
            const exam = {
                titre: "Test Exam",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "Paris is the capital of France",
                        answer: { correct: true },
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("// Export GIFT - Examen : Test Exam");
            expect(gift).toContain("::q1:: Paris is the capital of France {T}");
        });

        it("exporte une question true/false avec réponse false", () => {
            const exam = {
                titre: "Test",
                questions: [
                    {
                        id: "q2",
                        type: "true_false",
                        text: "The sun is cold",
                        answer: { correct: false },
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q2:: The sun is cold {F}");
        });

        it("exporte une question numeric sans marge", () => {
            const exam = {
                titre: "Math Test",
                questions: [
                    {
                        id: "q3",
                        type: "numeric",
                        text: "What is 2 + 2?",
                        answer: 4,
                        margin: 0,
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q3:: What is 2 + 2? { =4 }");
        });

        it("exporte une question numeric avec marge", () => {
            const exam = {
                titre: "Science Test",
                questions: [
                    {
                        id: "q4",
                        type: "numeric",
                        text: "What is the value of PI?",
                        answer: 3.14,
                        margin: 0.01,
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q4:: What is the value of PI? { =3.14:0.01 }");
        });

        it("exporte une question short_answer", () => {
            const exam = {
                titre: "Geography",
                questions: [
                    {
                        id: "q5",
                        type: "short_answer",
                        text: "What is the capital of France?",
                        answers: [
                            { text: "Paris", feedback: null },
                            { text: "paris", feedback: null },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q5:: What is the capital of France?");
            expect(gift).toContain("=Paris");
            expect(gift).toContain("=paris");
        });

        it("exporte une question short_answer avec feedback", () => {
            const exam = {
                titre: "Test",
                questions: [
                    {
                        id: "q6",
                        type: "short_answer",
                        text: "Name a color",
                        answers: [
                            { text: "red", feedback: "Good choice!" },
                            { text: "blue", feedback: "Nice!" },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("=red # Good choice!");
            expect(gift).toContain("=blue # Nice!");
        });

        it("exporte une question matching", () => {
            const exam = {
                titre: "Capitals",
                questions: [
                    {
                        id: "q7",
                        type: "matching",
                        text: "Match countries to capitals",
                        pairs: [
                            { left: "France", right: "Paris" },
                            { left: "Spain", right: "Madrid" },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q7:: Match countries to capitals");
            expect(gift).toContain("=France -> Paris");
            expect(gift).toContain("=Spain -> Madrid");
        });

        it("exporte une question multiple_choice", () => {
            const exam = {
                titre: "Quiz",
                questions: [
                    {
                        id: "q8",
                        type: "multiple_choice",
                        text: "What is 2+2?",
                        choices: [
                            { text: "4", correct: true, feedback: null },
                            { text: "3", correct: false, feedback: null },
                            { text: "5", correct: false, feedback: null },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q8:: What is 2+2?");
            expect(gift).toContain("=4");
            expect(gift).toContain("~3");
            expect(gift).toContain("~5");
        });

        it("exporte une question multiple_choice avec feedback", () => {
            const exam = {
                titre: "Test",
                questions: [
                    {
                        id: "q9",
                        type: "multiple_choice",
                        text: "Choose the correct answer",
                        choices: [
                            { text: "Correct", correct: true, feedback: "Well done!" },
                            { text: "Wrong", correct: false, feedback: "Try again" },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("=Correct # Well done!");
            expect(gift).toContain("~Wrong # Try again");
        });

        it("exporte une question essay", () => {
            const exam = {
                titre: "Writing Test",
                questions: [
                    {
                        id: "q10",
                        type: "essay",
                        text: "Write an essay about climate change",
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("::q10:: Write an essay about climate change {}");
        });

        it("exporte une question de type inconnu avec fallback", () => {
            const exam = {
                titre: "Test",
                questions: [
                    {
                        id: "q11",
                        type: "unknown_type",
                        text: "This is an unknown question type",
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("// Type inconnu pour la question q11");
            expect(gift).toContain(
                "::q11:: This is an unknown question type {}"
            );
        });

        it("exporte un examen avec plusieurs questions de types différents", () => {
            const exam = {
                titre: "Mixed Exam",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "True or false?",
                        answer: { correct: true },
                    },
                    {
                        id: "q2",
                        type: "numeric",
                        text: "Calculate this",
                        answer: 42,
                        margin: 0,
                    },
                    {
                        id: "q3",
                        type: "essay",
                        text: "Write something",
                    },
                ],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("// Export GIFT - Examen : Mixed Exam");
            expect(gift).toContain("::q1::");
            expect(gift).toContain("::q2::");
            expect(gift).toContain("::q3::");
        });

        it("gère un examen vide", () => {
            const exam = {
                titre: "Empty Exam",
                questions: [],
            };

            const gift = examToGift(exam);

            expect(gift).toContain("// Export GIFT - Examen : Empty Exam");
            expect(gift.split("\n").length).toBeLessThan(5);
        });
    });

    describe("saveGift", () => {
        beforeAll(async () => {
            try {
                await fs.mkdir(outputDir, { recursive: true });
            } catch (e) {
                // Directory already exists
            }
        });

        it("sauvegarde un fichier GIFT avec succès", async () => {
            const giftContent = "::q1:: Test question {T}\n";
            const filename = "test_exam1.gift";

            const result = await saveGift(giftContent, filename);

            expect(result).toBe(true);

            const filepath = path.join(outputDir, filename);
            const savedContent = await fs.readFile(filepath, "utf8");
            expect(savedContent).toBe(giftContent);
        });

        it("retourne false si le contenu est null", async () => {
            const result = await saveGift(null, "test_null.gift");

            expect(result).toBe(false);
        });

        it("crée le fichier avec le bon chemin", async () => {
            const giftContent = "::q2:: Another test {F}\n";
            const filename = "test_exam2.gift";

            await saveGift(giftContent, filename);

            const filepath = path.join(outputDir, filename);
            const fileExists = await fs
                .access(filepath)
                .then(() => true)
                .catch(() => false);

            expect(fileExists).toBe(true);
        });

        it("écrase un fichier existant", async () => {
            const filename = "test_overwrite.gift";
            const filepath = path.join(outputDir, filename);

            // Créer un fichier initial
            await saveGift("Initial content", filename);
            const content1 = await fs.readFile(filepath, "utf8");
            expect(content1).toBe("Initial content");

            // Écraser avec un nouveau contenu
            await saveGift("New content", filename);
            const content2 = await fs.readFile(filepath, "utf8");
            expect(content2).toBe("New content");
        });

        it("sauvegarde du contenu avec caractères spéciaux", async () => {
            const giftContent =
                "::q3:: Question avec accents: é à ü {=réponse}\n";
            const filename = "test_special_chars.gift";

            await saveGift(giftContent, filename);

            const filepath = path.join(outputDir, filename);
            const savedContent = await fs.readFile(filepath, "utf8");
            expect(savedContent).toContain("é à ü");
            expect(savedContent).toContain("réponse");
        });
    });

    describe("Integration: examToGift + saveGift", () => {
        it("exporte et sauvegarde un examen complet", async () => {
            const exam = {
                titre: "Integration Test",
                questions: [
                    {
                        id: "q1",
                        type: "true_false",
                        text: "Integration test question",
                        answer: { correct: true },
                    },
                    {
                        id: "q2",
                        type: "multiple_choice",
                        text: "Choose one",
                        choices: [
                            { text: "A", correct: true, feedback: null },
                            { text: "B", correct: false, feedback: null },
                        ],
                    },
                ],
            };

            const gift = examToGift(exam);
            const filename = "test_integration.gift";
            const result = await saveGift(gift, filename);

            expect(result).toBe(true);

            const filepath = path.join(outputDir, filename);
            const savedContent = await fs.readFile(filepath, "utf8");

            expect(savedContent).toContain("Integration Test");
            expect(savedContent).toContain("::q1::");
            expect(savedContent).toContain("::q2::");
        });
    });
});