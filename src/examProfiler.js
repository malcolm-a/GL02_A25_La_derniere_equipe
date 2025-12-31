import fs from "fs";
import { importBank } from "./questionBank.js";

export function computeExamProfile(exam) {
  const profile = {
    titre: exam.titre,
    total: exam.questions.length,
    type: {},
    autoCorrection: 0,
    pourcentage: {},
  };

  for (const question of exam.questions) {
    const type = question.type;
    if (!profile.type[type]) {
      profile.type[type] = 1;
    } else {
      profile.type[type]++;
    }

    if (
      type == "true_false" ||
      type == "numeric" ||
      type == "matching" ||
      type == "short_answer" ||
      type == "multiple_choice"
    ) {
      profile.autoCorrection++;
    }
  }

  for (const [type, count] of Object.entries(profile.type)) {
    profile.pourcentage[type] =
      ((count / profile.total) * 100).toFixed(1) + "%";
  }

  return profile;
}

function computeGiftProfile(questions) {
  const profile = {
    total: questions.length,
    type: {},
    pourcentage: {},
  };

  for (const question of questions) {
    const type = question.type;
    if (!profile.type[type]) {
      profile.type[type] = 1;
    } else {
      profile.type[type]++;
    }
  }

  for (const [type, count] of Object.entries(profile.type)) {
    profile.pourcentage[type] =
      ((count / profile.total) * 100).toFixed(1) + "%";
  }

  return profile;
}

export function saveProfileChart(profile, path = "profil.html") {
  const chart = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Profil de l'examen",
    data: {
      values: Object.entries(profile.type).map(([type, count]) => ({
        type,
        count,
      })),
    },
    mark: "bar",
    encoding: {
      x: { field: "type", type: "nominal" },
      y: { field: "count", type: "quantitative" },
    },
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
    </head>
    <body>
    <div id="chart"></div>
    <script>
        vegaEmbed('#chart', ${JSON.stringify(chart)});
    </script>
    </body>
    </html>`;

  const filepath = "./out/html/" + path;
  fs.writeFileSync(filepath, html, "utf-8");
  console.log("Graphique généré :" + path);
}

export function compareProfiles(examProfile, corpusProfile) {
  if (!examProfile || !corpusProfile) {
    return null;
  }

  const comparaison = {
    typeDifferent: {},
    divergence: 0,
  };

  const types = [];
  for (const type of Object.keys(examProfile.type)) {
    if (!types.includes(type)) types.push(type);
  }
  for (const type of Object.keys(corpusProfile.type)) {
    if (!types.includes(type)) types.push(type);
  }

  for (const type of types) {
    const pExam = parseFloat(examProfile.pourcentage[type]) || 0;
    const pCorpus = parseFloat(corpusProfile.pourcentage[type]) || 0;

    const diff = pExam - pCorpus;

    comparaison.typeDifferent[type] = {
      exam: pExam,
      corpus: pCorpus,
      diff: diff,
    };

    comparaison.divergence += Math.abs(diff);
  }

  return comparaison;
}

export function displayComparaisonTable(results) {
  console.log("\n=== COMPARAISON EXAMEN / CORPUS ===\n");
  console.log(
    "Type" + " ".repeat(12) + "| Exam (%) | Corpus (%) | ∆ (pp) | Histogramme",
  );
  console.log("-".repeat(80));

  for (const [type, data] of Object.entries(results.typeDifferent)) {
    const pExam = data.exam.toFixed(1);
    const pCorpus = data.corpus.toFixed(1);
    const pDiff = data.diff.toFixed(1);

    let signe;
    const barre = "■".repeat(Math.abs(Math.round(data.diff) / 2));
    if (data.diff >= 0) {
      signe = "+";
    } else {
      signe = "-";
    }

    console.log(
      `${type.padEnd(15)} | ${pExam.padStart(8)} | ${pCorpus.padStart(10)} | ${pDiff.padStart(6)} | ${signe}${barre}`,
    );
  }
  console.log(`\nIndice de divergence L1 : ${results.divergence.toFixed(2)}`);
}

export async function compareGift(examPath, corpusPath) {
  const examBank = await importBank(examPath);
  examBank.questions = examBank.questions.filter((q) => q.text.trim() !== "");
  if (!examBank || examBank.questions.length === 0) {
    throw new Error("Examen non valide.");
  }

  const corpusBank = await importBank(corpusPath);
  corpusBank.questions = corpusBank.questions.filter(
    (q) => q.text.trim() !== "",
  );
  if (!corpusBank || corpusBank.questions.length === 0) {
    throw new Error("Corpus non valide.");
  }

  const examProfile = computeGiftProfile(examBank.questions);
  const corpusProfile = computeGiftProfile(corpusBank.questions);

  const comparaison = compareProfiles(examProfile, corpusProfile);

  displayComparaisonTable(comparaison);
}
