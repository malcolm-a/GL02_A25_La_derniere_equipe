import {
    computeExamProfile,
    saveProfileChart,
    compareProfiles,
    displayComparaisonTable,
    compareGift,
} from "../src/examProfiler.js";
import fs from "fs";
import path from "path";

describe("Exam Profiler", () => {
    describe("computeExamProfile", () => {
        it("calcule le profil d'un examen avec des questions de différents types", () => {
            const exam = {
                titre: "Test Exam",
                questions: [
                    { id: "q1", type: "true_false", text: "Question 1" },
                    { id: "q2", type: "true_false", text: "Question 2" },
                    { id: "q3", type: "multiple_choice", text: "Question 3" },
                    { id: "q4", type: "essay", text: "Question 4" },
                    { id: "q5", type: "numeric", text: "Question 5" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.titre).toBe("Test Exam");
            expect(profile.total).toBe(5);
            expect(profile.type.true_false).toBe(2);
            expect(profile.type.multiple_choice).toBe(1);
            expect(profile.type.essay).toBe(1);
            expect(profile.type.numeric).toBe(1);
            expect(profile.autoCorrection).toBe(4); // true_false (2) + multiple_choice (1) + numeric (1)
            expect(profile.pourcentage.true_false).toBe("40.0%");
            expect(profile.pourcentage.multiple_choice).toBe("20.0%");
            expect(profile.pourcentage.essay).toBe("20.0%");
            expect(profile.pourcentage.numeric).toBe("20.0%");
        });

        it("calcule le profil d'un examen avec un seul type de question", () => {
            const exam = {
                titre: "All True/False",
                questions: [
                    { id: "q1", type: "true_false", text: "Question 1" },
                    { id: "q2", type: "true_false", text: "Question 2" },
                    { id: "q3", type: "true_false", text: "Question 3" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.titre).toBe("All True/False");
            expect(profile.total).toBe(3);
            expect(profile.type.true_false).toBe(3);
            expect(profile.autoCorrection).toBe(3);
            expect(profile.pourcentage.true_false).toBe("100.0%");
        });

        it("calcule le profil d'un examen avec toutes les questions auto-corrigibles", () => {
            const exam = {
                titre: "Auto-correctable",
                questions: [
                    { id: "q1", type: "true_false", text: "Question 1" },
                    { id: "q2", type: "numeric", text: "Question 2" },
                    { id: "q3", type: "matching", text: "Question 3" },
                    { id: "q4", type: "short_answer", text: "Question 4" },
                    { id: "q5", type: "multiple_choice", text: "Question 5" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.autoCorrection).toBe(5);
        });

        it("calcule le profil d'un examen avec des questions non auto-corrigibles", () => {
            const exam = {
                titre: "Manual Grading",
                questions: [
                    { id: "q1", type: "essay", text: "Question 1" },
                    { id: "q2", type: "essay", text: "Question 2" },
                    { id: "q3", type: "description", text: "Question 3" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.autoCorrection).toBe(0);
        });

        it("calcule correctement les pourcentages avec des décimales", () => {
            const exam = {
                titre: "Percentages",
                questions: [
                    { id: "q1", type: "multiple_choice", text: "Question 1" },
                    { id: "q2", type: "multiple_choice", text: "Question 2" },
                    { id: "q3", type: "essay", text: "Question 3" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.pourcentage.multiple_choice).toBe("66.7%");
            expect(profile.pourcentage.essay).toBe("33.3%");
        });

        it("calcule le profil d'un examen vide", () => {
            const exam = {
                titre: "Empty Exam",
                questions: [],
            };

            const profile = computeExamProfile(exam);

            expect(profile.titre).toBe("Empty Exam");
            expect(profile.total).toBe(0);
            expect(Object.keys(profile.type).length).toBe(0);
            expect(profile.autoCorrection).toBe(0);
        });

        it("compte correctement plusieurs questions du même type", () => {
            const exam = {
                titre: "Same Type",
                questions: [
                    { id: "q1", type: "multiple_choice", text: "Question 1" },
                    { id: "q2", type: "multiple_choice", text: "Question 2" },
                    { id: "q3", type: "multiple_choice", text: "Question 3" },
                    { id: "q4", type: "multiple_choice", text: "Question 4" },
                    { id: "q5", type: "multiple_choice", text: "Question 5" },
                ],
            };

            const profile = computeExamProfile(exam);

            expect(profile.type.multiple_choice).toBe(5);
            expect(profile.autoCorrection).toBe(5);
        });
    });

    describe("saveProfileChart", () => {
        const testHtmlDir = "./out/html";

        beforeEach(() => {
            // Ensure the html directory exists
            if (!fs.existsSync(testHtmlDir)) {
                fs.mkdirSync(testHtmlDir, { recursive: true });
            }
        });

        afterEach(() => {
            // Clean up test files
            const testFiles = [
                "test_profile.html",
                "test_chart.html",
                "profil.html",
            ];
            testFiles.forEach((file) => {
                const filepath = path.join(testHtmlDir, file);
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            });
        });

        it("génère un fichier HTML avec le graphique", () => {
            const profile = {
                titre: "Test Profile",
                total: 3,
                type: {
                    true_false: 2,
                    essay: 1,
                },
                pourcentage: {
                    true_false: "66.7%",
                    essay: "33.3%",
                },
            };

            const consoleSpy = spyOn(console, "log");
            saveProfileChart(profile, "test_profile.html");

            const filepath = path.join(testHtmlDir, "test_profile.html");
            expect(fs.existsSync(filepath)).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Graphique généré :test_profile.html"
            );
        });

        it("génère un fichier HTML avec le contenu Vega-Lite correct", () => {
            const profile = {
                titre: "Test Profile",
                total: 2,
                type: {
                    multiple_choice: 1,
                    numeric: 1,
                },
                pourcentage: {
                    multiple_choice: "50.0%",
                    numeric: "50.0%",
                },
            };

            saveProfileChart(profile, "test_chart.html");

            const filepath = path.join(testHtmlDir, "test_chart.html");
            const content = fs.readFileSync(filepath, "utf-8");

            expect(content).toContain("<!DOCTYPE html>");
            expect(content).toContain("vega-lite");
            expect(content).toContain("vegaEmbed");
            expect(content).toContain('"mark":"bar"');
            expect(content).toContain('"type":"multiple_choice"');
            expect(content).toContain('"type":"numeric"');
        });

        it("utilise le nom de fichier par défaut si non spécifié", () => {
            const profile = {
                titre: "Default",
                total: 1,
                type: { essay: 1 },
                pourcentage: { essay: "100.0%" },
            };

            saveProfileChart(profile);

            const filepath = path.join(testHtmlDir, "profil.html");
            expect(fs.existsSync(filepath)).toBe(true);
        });

        it("écrase un fichier existant", () => {
            const profile = {
                titre: "Test",
                total: 1,
                type: { essay: 1 },
                pourcentage: { essay: "100.0%" },
            };

            saveProfileChart(profile, "test_chart.html");
            const firstContent = fs.readFileSync(
                path.join(testHtmlDir, "test_chart.html"),
                "utf-8"
            );

            const profile2 = {
                titre: "Updated",
                total: 2,
                type: { true_false: 2 },
                pourcentage: { true_false: "100.0%" },
            };

            saveProfileChart(profile2, "test_chart.html");
            const secondContent = fs.readFileSync(
                path.join(testHtmlDir, "test_chart.html"),
                "utf-8"
            );

            expect(firstContent).not.toBe(secondContent);
            expect(secondContent).toContain('"type":"true_false"');
        });
    });

    describe("compareProfiles", () => {
        it("compare deux profils avec les mêmes types de questions", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 5, essay: 5 },
                pourcentage: { true_false: "50.0%", essay: "50.0%" },
            };

            const corpusProfile = {
                total: 20,
                type: { true_false: 10, essay: 10 },
                pourcentage: { true_false: "50.0%", essay: "50.0%" },
            };

            const result = compareProfiles(examProfile, corpusProfile);

            expect(result).not.toBeNull();
            expect(result.typeDifferent.true_false.exam).toBe(50.0);
            expect(result.typeDifferent.true_false.corpus).toBe(50.0);
            expect(result.typeDifferent.true_false.diff).toBe(0);
            expect(result.typeDifferent.essay.exam).toBe(50.0);
            expect(result.typeDifferent.essay.corpus).toBe(50.0);
            expect(result.typeDifferent.essay.diff).toBe(0);
            expect(result.divergence).toBe(0);
        });

        it("compare deux profils avec des types différents", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 10 },
                pourcentage: { true_false: "100.0%" },
            };

            const corpusProfile = {
                total: 10,
                type: { essay: 10 },
                pourcentage: { essay: "100.0%" },
            };

            const result = compareProfiles(examProfile, corpusProfile);

            expect(result).not.toBeNull();
            expect(result.typeDifferent.true_false.exam).toBe(100.0);
            expect(result.typeDifferent.true_false.corpus).toBe(0);
            expect(result.typeDifferent.true_false.diff).toBe(100.0);
            expect(result.typeDifferent.essay.exam).toBe(0);
            expect(result.typeDifferent.essay.corpus).toBe(100.0);
            expect(result.typeDifferent.essay.diff).toBe(-100.0);
            expect(result.divergence).toBe(200.0);
        });

        it("calcule correctement la divergence", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 6, essay: 4 },
                pourcentage: { true_false: "60.0%", essay: "40.0%" },
            };

            const corpusProfile = {
                total: 10,
                type: { true_false: 4, essay: 6 },
                pourcentage: { true_false: "40.0%", essay: "60.0%" },
            };

            const result = compareProfiles(examProfile, corpusProfile);

            expect(result.typeDifferent.true_false.diff).toBe(20.0);
            expect(result.typeDifferent.essay.diff).toBe(-20.0);
            expect(result.divergence).toBe(40.0);
        });

        it("retourne null si examProfile est null", () => {
            const corpusProfile = {
                total: 10,
                type: { true_false: 10 },
                pourcentage: { true_false: "100.0%" },
            };

            const result = compareProfiles(null, corpusProfile);

            expect(result).toBeNull();
        });

        it("retourne null si corpusProfile est null", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 10 },
                pourcentage: { true_false: "100.0%" },
            };

            const result = compareProfiles(examProfile, null);

            expect(result).toBeNull();
        });

        it("retourne null si les deux profils sont null", () => {
            const result = compareProfiles(null, null);

            expect(result).toBeNull();
        });

        it("gère les types présents dans un seul profil", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 5, numeric: 5 },
                pourcentage: { true_false: "50.0%", numeric: "50.0%" },
            };

            const corpusProfile = {
                total: 10,
                type: { true_false: 10 },
                pourcentage: { true_false: "100.0%" },
            };

            const result = compareProfiles(examProfile, corpusProfile);

            expect(result.typeDifferent.true_false.exam).toBe(50.0);
            expect(result.typeDifferent.true_false.corpus).toBe(100.0);
            expect(result.typeDifferent.numeric.exam).toBe(50.0);
            expect(result.typeDifferent.numeric.corpus).toBe(0);
        });

        it("gère des différences positives et négatives", () => {
            const examProfile = {
                total: 10,
                type: { true_false: 7, essay: 3 },
                pourcentage: { true_false: "70.0%", essay: "30.0%" },
            };

            const corpusProfile = {
                total: 10,
                type: { true_false: 3, essay: 7 },
                pourcentage: { true_false: "30.0%", essay: "70.0%" },
            };

            const result = compareProfiles(examProfile, corpusProfile);

            expect(result.typeDifferent.true_false.diff).toBeGreaterThan(0);
            expect(result.typeDifferent.essay.diff).toBeLessThan(0);
        });
    });

    describe("displayComparaisonTable", () => {
        it("affiche le tableau de comparaison", () => {
            const results = {
                typeDifferent: {
                    true_false: { exam: 50.0, corpus: 40.0, diff: 10.0 },
                    essay: { exam: 50.0, corpus: 60.0, diff: -10.0 },
                },
                divergence: 20.0,
            };

            const consoleSpy = spyOn(console, "log");
            displayComparaisonTable(results);

            expect(consoleSpy).toHaveBeenCalledWith(
                "\n=== COMPARAISON EXAMEN / CORPUS ===\n"
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                "Type" +
                    " ".repeat(12) +
                    "| Exam (%) | Corpus (%) | ∆ (pp) | Histogramme"
            );
            expect(consoleSpy).toHaveBeenCalledWith("-".repeat(80));
            expect(consoleSpy).toHaveBeenCalledWith(
                "\nIndice de divergence L1 : 20.00"
            );
        });

        it("affiche correctement les valeurs avec signe positif", () => {
            const results = {
                typeDifferent: {
                    true_false: { exam: 60.0, corpus: 40.0, diff: 20.0 },
                },
                divergence: 20.0,
            };

            const consoleSpy = spyOn(console, "log");
            displayComparaisonTable(results);

            const calls = consoleSpy.calls.all();
            const typeCall = calls.find((call) =>
                call.args[0].includes("true_false")
            );
            expect(typeCall).toBeDefined();
            expect(typeCall.args[0]).toContain("+");
        });

        it("affiche correctement les valeurs avec signe négatif", () => {
            const results = {
                typeDifferent: {
                    essay: { exam: 30.0, corpus: 50.0, diff: -20.0 },
                },
                divergence: 20.0,
            };

            const consoleSpy = spyOn(console, "log");
            displayComparaisonTable(results);

            const calls = consoleSpy.calls.all();
            const typeCall = calls.find((call) => call.args[0].includes("essay"));
            expect(typeCall).toBeDefined();
            expect(typeCall.args[0]).toContain("-");
        });

        it("affiche plusieurs types de questions", () => {
            const results = {
                typeDifferent: {
                    true_false: { exam: 40.0, corpus: 30.0, diff: 10.0 },
                    essay: { exam: 30.0, corpus: 40.0, diff: -10.0 },
                    numeric: { exam: 30.0, corpus: 30.0, diff: 0.0 },
                },
                divergence: 20.0,
            };

            const consoleSpy = spyOn(console, "log");
            displayComparaisonTable(results);

            const calls = consoleSpy.calls.all();
            expect(
                calls.some((call) => call.args[0].includes("true_false"))
            ).toBe(true);
            expect(calls.some((call) => call.args[0].includes("essay"))).toBe(
                true
            );
            expect(calls.some((call) => call.args[0].includes("numeric"))).toBe(
                true
            );
        });
    });

    describe("compareGift", () => {
        it("lance une erreur si l'examen est vide ou invalide", async () => {
            // This test would require mocking importBank to return an empty result
            // We'll test error handling by expecting the function to throw
            await expectAsync(
                compareGift("nonexistent_exam.gift", "corpus.gift")
            ).toBeRejected();
        });

        it("lance une erreur si le corpus est vide ou invalide", async () => {
            await expectAsync(
                compareGift("exam.gift", "nonexistent_corpus.gift")
            ).toBeRejected();
        });
    });
});
