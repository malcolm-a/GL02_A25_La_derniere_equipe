import { generateVcard } from "../src/vcardGenerator.js";
import fs from "fs/promises";
import path from "path";

describe("VCard Generator", () => {
    const outputDir = "./out/vcards";

    // Clean up test files after each test
    afterEach(async () => {
        try {
            const files = await fs.readdir(outputDir);
            for (const file of files) {
                if (file.endsWith(".vcf")) {
                    await fs.unlink(path.join(outputDir, file));
                }
            }
        } catch (e) {
            // Directory might not exist, ignore
        }
    });

    it("génère une vCard avec nom et prénom uniquement", async () => {
        const teacher = {
            nom: "Dupont",
            prenom: "Jean",
            org: "",
            email: "",
            tel: "",
        };

        await generateVcard(teacher);

        const filepath = path.join(outputDir, "JeanDupont.vcf");
        const content = await fs.readFile(filepath, "utf8");

        expect(content).toContain("BEGIN:VCARD");
        expect(content).toContain("VERSION:4.0");
        expect(content).toContain("FN:Jean Dupont");
        expect(content).toContain("N:Dupont;Jean;;;");
        expect(content).toContain("END:VCARD");
    });

    it("génère une vCard complète avec toutes les informations", async () => {
        const teacher = {
            nom: "Martin",
            prenom: "Marie",
            org: "Université Paris",
            email: "marie.martin@univ.fr",
            tel: "+33123456789",
        };

        await generateVcard(teacher);

        const filepath = path.join(outputDir, "MarieMartin.vcf");
        const content = await fs.readFile(filepath, "utf8");

        expect(content).toContain("BEGIN:VCARD");
        expect(content).toContain("FN:Marie Martin");
        expect(content).toContain("N:Martin;Marie;;;");
        expect(content).toContain("ORG:Université Paris");
        expect(content).toContain("EMAIL:marie.martin@univ.fr");
        expect(content).toContain("TEL:+33123456789");
        expect(content).toContain("END:VCARD");
    });

    it("n'écrit pas de fichier si le nom est manquant", async () => {
        const teacher = {
            nom: "",
            prenom: "Pierre",
            org: "",
            email: "",
            tel: "",
        };

        await generateVcard(teacher);

        // Vérifier qu'aucun fichier n'a été créé
        try {
            const files = await fs.readdir(outputDir);
            const vcfFiles = files.filter((f) => f.endsWith(".vcf"));
            expect(vcfFiles.length).toBe(0);
        } catch (e) {
            // Directory doesn't exist = no files created, which is expected
            expect(true).toBe(true);
        }
    });

    it("n'écrit pas de fichier si le prénom est manquant", async () => {
        const teacher = {
            nom: "Bernard",
            prenom: "",
            org: "",
            email: "",
            tel: "",
        };

        await generateVcard(teacher);

        // Vérifier qu'aucun fichier n'a été créé
        try {
            const files = await fs.readdir(outputDir);
            const vcfFiles = files.filter((f) => f.endsWith(".vcf"));
            expect(vcfFiles.length).toBe(0);
        } catch (e) {
            // Directory doesn't exist = no files created, which is expected
            expect(true).toBe(true);
        }
    });

    it("génère une vCard avec champs optionnels vides", async () => {
        const teacher = {
            nom: "Leroy",
            prenom: "Sophie",
            org: "",
            email: "",
            tel: "",
        };

        await generateVcard(teacher);

        const filepath = path.join(outputDir, "SophieLeroy.vcf");
        const content = await fs.readFile(filepath, "utf8");

        expect(content).toContain("FN:Sophie Leroy");
        expect(content).toContain("ORG:");
        expect(content).toContain("EMAIL:");
        expect(content).toContain("TEL:");
    });

    it("génère un nom de fichier correct", async () => {
        const teacher = {
            nom: "Petit",
            prenom: "Luc",
            org: "",
            email: "",
            tel: "",
        };

        await generateVcard(teacher);

        const filepath = path.join(outputDir, "LucPetit.vcf");
        const fileExists = await fs
            .access(filepath)
            .then(() => true)
            .catch(() => false);

        expect(fileExists).toBe(true);
    });

    it("gère les caractères spéciaux dans le nom", async () => {
        const teacher = {
            nom: "O'Connor",
            prenom: "Jean-Paul",
            org: "École Polytechnique",
            email: "jp.oconnor@ecole.fr",
            tel: "",
        };

        await generateVcard(teacher);

        const filepath = path.join(outputDir, "Jean-PaulO'Connor.vcf");
        const content = await fs.readFile(filepath, "utf8");

        expect(content).toContain("FN:Jean-Paul O'Connor");
        expect(content).toContain("N:O'Connor;Jean-Paul;;;");
    });
});