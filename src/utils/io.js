import fs from "fs/promises"; // Module intégré de Node.js pour les opérations de fichiers asynchrones
import path from "path"; // Module intégré de Node.js permet de manipuler les chemins de fichiers

// mot clef export des fonctions pour les utiliser dans d'autres fichiers

export async function readFileUtf8(filepath) {
  const p = path.resolve(filepath); // resolve : obtenir le chemin absolu
  return await fs.readFile(p, "utf8"); //readFile : lire le contenu du fichier en UTF-8 c'est à dire du texte lisible
}

export async function writeFileUtf8(filepath, content) {
  const p = path.resolve(filepath);
  await fs.writeFile(p, content, "utf8"); // écrit dans le fichier si le fichier existe il est écrasé sinon il est créé
}

// lire tous les fichiers d'un dossier avec une extension donnée
export async function readDirFilesUtf8(dirOrFile, extFilter = null) {
  //extFilter : filtre par extension de fichier

  /*const files = await fs.readdir(dir, { withFileTypes: true }); //withFileTypes : obtenir des objets qui sait si l'entrée est un fichier ou un dossier
  const results = [];
   
  for (const f of files) {
    if (f.isFile()) { // isFile() : vérifier si l'entrée est un fichier
      const ext = path.extname(f.name).toLowerCase();
      if (!extFilter || ext === extFilter) {
        const content = await fs.readFile(path.join(dir, f.name), "utf8");
        results.push({ filename: f.name, content });
      }
    }
  }
  return results;*/

  const resolved = path.resolve(dirOrFile);

  try {
    const stat = await fs.stat(resolved);

    // Si c'est un fichier
    if (stat.isFile()) {
      if (!extFilter || path.extname(resolved).toLowerCase() === extFilter) {
        const content = await fs.readFile(resolved, "utf8");
        return [{ filename: path.basename(resolved), content }];
      } else return [];
    }

    // Si c'est un dossier
    const files = await fs.readdir(resolved, { withFileTypes: true });
    const results = [];

    for (const f of files) {
      if (f.isFile()) {
        const ext = path.extname(f.name).toLowerCase();
        if (!extFilter || ext === extFilter) {
          const content = await fs.readFile(
            path.join(resolved, f.name),
            "utf8",
          );
          results.push({ filename: f.name, content });
        }
      }
    }

    return results;
  } catch (err) {
    console.error("Erreur readDirFilesUtf8:", err.message);
    return [];
  }
}
