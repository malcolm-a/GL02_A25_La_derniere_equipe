import path from "path";
import fs from 'fs';

// teacher a les attributs nom, prenom, org, email, tel
export async function generateVcard (teacher) {
    let linebegin = "BEGIN:VCARD\nVERSION:4.0\n";
    let linefn = "FN:" + teacher.prenom + " " + teacher.nom + "\n";
    let linen = "N:"+ teacher.nom + ";" + teacher.prenom + ";;;\n";
    let lineorg = "ORG:" + teacher.org + "\n";
    let linemail = "EMAIL:" + teacher.email + "\n";
    let linetel = "TEL:" + teacher.tel + "\n";
    let lineend = "END:VCARD\n";
    let content = linebegin + linefn + linen + lineorg + linemail + linetel + lineend;
    
    let filename = `${teacher.prenom}${teacher.nom}.vcf`;
    fs.writeFile(path.join(teacher.pathname, filename), content, (err) => {
        if (err) throw err;
        console.log(`Fichier VCard enregistré avec succès vers ${path.join(teacher.pathname, filename)}.\n`);
    })
};

export function displayVcard () {

};