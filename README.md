README - Projet GL02 - Sujet B
Gestionnaire d'examens en ligne

### Description: 

Ce projet propose une interface en ligne de commande permettant de :
- Charger une banque de questions
- Rechercher et afficher des questions
- Créer un examen et gérer ses questions
- Vérifier la validité d'un examen
- Simuler un examen
- Générer un fichier d'identification de l'enseignant (vCard)
- Exporter un examen au format GIFT
- Générer un profil statistique (HTML, graphe Vega-Lite)
- Comparer un examen (GIFT) avec un corpus (GIFT)
- Sauvegarder et charger des examens JSON


### Modules utilisés: 

- inquirer 8.2.5
- chalk
- vega-lite
- fs/promises
- ES Modules


### Installation:

npm install


### Utilisation:

cd src 

node main.js

-------------------------------------------------------------


Le programme propose un menu permettant de :
- Sélectionner un examen
- Créer un examen
- Afficher l'examen
- Rechercher une question par mot-clé
- Afficher une question par ID
- Ajouter une question à l'examen courant
- Retirer une question à l'examen courant
- Vérifier un examen
- Simuler l'examen
- Sauvegarder l'examen
- Exporter en GIFT
- Charger un examen
- Générer un profil statistique
- Comparer un examen avec un corpus
- Générer un fichier d'identification au format vCard


Les examens JSON sont automatiquement stockés dans le dossier : /exams 

Les profils généré en html sont automatiquement stockés dans le dossier : /html



### Contributeurs : 

Nathan Julien, Elio Lafaye de Micheaux, Charlotte Noé

