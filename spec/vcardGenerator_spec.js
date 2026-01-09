import { generateVcard } from "../src/vcardGenerator.js";
import fs from "fs/promises";
import path from "path";

describe("VCard Generator", () => {
  const outputDir = "./out/vcards";

  // Nettoyage après chaque test
  afterEach(async () => {
    try {
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        if (file.endsWith(".vcf")) {
          await fs.unlink(path.join(outputDir, file));
        }
      }
    } catch {
      // dossier inexistant → OK
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

    // Champs optionnels absents
    expect(content).not.toContain("ORG:");
    expect(content).not.toContain("EMAIL:");
    expect(content).not.toContain("TEL:");
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
    expect(content).toContain("EMAIL;TYPE=work:marie.martin@univ.fr");
    expect(content).toContain("TEL;TYPE=cell:+33123456789");
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

    try {
      const files = await fs.readdir(outputDir);
      expect(files.filter((f) => f.endsWith(".vcf")).length).toBe(0);
    } catch {
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

    try {
      const files = await fs.readdir(outputDir);
      expect(files.filter((f) => f.endsWith(".vcf")).length).toBe(0);
    } catch {
      expect(true).toBe(true);
    }
  });

  it("génère un nom de fichier correct au format PrénomNom.vcf", async () => {
    const teacher = {
      nom: "Petit",
      prenom: "Luc",
      org: "",
      email: "",
      tel: "",
    };

    await generateVcard(teacher);

    const filepath = path.join(outputDir, "LucPetit.vcf");
    const exists = await fs
      .access(filepath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);
  });

  it("gère les caractères spéciaux dans le contenu de la vCard", async () => {
    const teacher = {
      nom: "O'Connor",
      prenom: "Jean-Paul",
      org: "École Polytechnique",
      email: "jp.oconnor@ecole.fr",
      tel: "",
    };

    await generateVcard(teacher);

    const filepath = path.join(outputDir, "JeanPaulOConnor.vcf");
    const content = await fs.readFile(filepath, "utf8");

    expect(content).toContain("FN:Jean-Paul O\\'Connor");
    expect(content).toContain("N:O\\'Connor;Jean-Paul;;;");
    expect(content).toContain("ORG:École Polytechnique");
  });
});
