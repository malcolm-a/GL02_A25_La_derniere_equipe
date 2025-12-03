import path from "path";
import { writeFileUtf8 } from "./utils/io.js";
import { showError, showSuccess } from "./utils/show.js";

// teacher a les attributs nom, prenom, org, email, tel, filepath
export async function generateVcard (teacher) {
    if (!teacher.nom || !teacher.prenom) {
        showError('Nom et/ou prénom non valides');
        return;
    } else {
        let linebegin = "BEGIN:VCARD\nVERSION:4.0\n";
        let linefn = "FN:" + teacher.prenom + " " + teacher.nom + "\n";
        let linen = "N:"+ teacher.nom + ";" + teacher.prenom + ";;;\n";
        let lineorg = "ORG:" + teacher.org + "\n";
        let linemail = "EMAIL:" + teacher.email + "\n";
        let linetel = "TEL:" + teacher.tel + "\n";
        let lineend = "END:VCARD\n";
        let content = linebegin + linefn + linen + lineorg + linemail + linetel + lineend;
        
        let filename = `${teacher.prenom}${teacher.nom}.vcf`;
        await writeFileUtf8(path.join(teacher.filepath, filename), content);
        showSuccess(`Fichier enregistré vers ${path.join(teacher.filepath, filename)}.\n`);
    }
};