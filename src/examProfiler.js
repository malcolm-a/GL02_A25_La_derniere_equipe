import fs from "fs";

export function computeExamProfile(exam){
    const profile = {
        titre: exam.titre,
        total: exam.questions.length,
        type: {},
        autoCorrection: 0,
        pourcentage: {}
    };

    for (const question of exam.questions){
        const type = question.type;
        if(!profile.type[type]){
            profile.type[type] = 1;
        }else{
            profile.type[type]++;
        }

        if (type == "true_false" || type == "numeric" || type == "matching" || type == "short_answer" || type == "multiple_choice"){
            profile.autoCorrection++;
        }
    }

    for (const [type, count] of Object.entries(profile.type)){
        profile.pourcentage[type] = ((count/profile.total)*100).toFixed(1) + "%";
    }

    return profile;
}




export function saveProfileChart(profile, path = "profil.html"){
    const chart = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Profil de l'examen",
        "data": {
            "values": Object.entries(profile.type).map(([type, count]) => ({
                type,
                count
            }))
        },
        "mark": "bar",
        "encoding": {
            "x": { "field": "type", "type": "nominal" },
            "y": { "field": "count", "type": "quantitative" }
        }
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

    fs.writeFileSync(path, html, "utf-8");
    console.log("Graphique généré :" + path);
}


export function compareProfiles (profil1, profil2){
    if (!profil1 || !profil2){
        return null;
    }

    const comparaison = {
        exam1: profil1.titre,
        exam2: profil2.titre,
        totalDifference: profil1.total-profil2.total,
        typeDifferent: {},
        autoCorrectionDiff: profil1.autoCorrection-profil2.autoCorrection
    };

    const types = [];
    for (const type in profil1.type){
        if(!types.includes(type)){
            types.push(type);
        }
    }
    for (const type in profil2.type){
        if(!types.includes(type)){
            types.push(type);
        }
    }

    for (const type of types){
        const v1 = profil1.type[type] || 0;
        const v2 = profil2.type[type] || 0;
        comparaison.typeDifferent[type] = v1-v2;
    }

    return comparaison;
    
}

export function displayComparaison(comparaison){
    console.log("Comparaison de profils d'examens \n");

    console.log("Comparaison entre :");
    console.log("-" + comparaison.exam1);
    console.log("-" + comparaison.exam2 + "\n");

    console.log("Nombre total de questions :");
    if (comparaison.totalDifference>0){
        console.log(`Il y a ${comparaison.totalDifference} question(s) en plus dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
    }else if (comparaison.totalDifference<0){
        console.log(`Il y a ${Math.abs(comparaison.totalDifference)} question(s) en moins dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
    }else{
        console.log("Il y a le même nombre de question");
    }

    console.log("\nDifférences par type :");
    for (const [type, diff] of Object.entries(comparaison.typeDifferent)){
        if (diff>0){
            console.log(`Il y a ${diff} question(s) ${type} en plus dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
        }else if (diff<0){
            console.log(`Il y a ${diff} question(s) ${type} en moins dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
        }else{
            console.log(`Il y a le même nombre de question ${type}`);
        }
    }

    console.log("\nQuestion auto-corrigées :");
    if (comparaison.autoCorrectionDiff>0){
        console.log(`Il y a ${comparaison.autoCorrectionDiff} question(s) auto-corrigée(s) en plus dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
    }else if (comparaison.autoCorrectionDiff<0){
        console.log(`Il y a ${Math.abs(comparaison.autoCorrectionDiff)} question(s) auto-corrigée(s) en moins dans ${comparaison.exam1} que dans ${comparaison.exam2}`);
    }else{
        console.log("Il y a le même nombre de question auto-corrigée");
    }
}