README - Projet GL02 - Sujet B
Gestionnaire d'examens en ligne

### Description: 

Ce projet propose une interface en ligne de commande permettant de :
- Charger une banque de questions
- Rechercher et afficher des questions
- Créer un examen et gérer ses questions
- Vérifier la validité d'un examen
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

node src/main.js

Le programme propose un menu permettant de :
- Rechercher une question
- Afficher une question
- Créer un examen
- Sélectionner un examen
- Ajouter une question à l'examen courant
- Retirer une question à l'examen courant
- Vérifier un examen
- Exporter en GIFT
- Générer un profil statistique
- Comparer un examen avec un corpus
- Sauvegarder / charger un examen

Les examens JSON sont automatiquement stockés dans le dossier : /exams



### Contributeurs : 

Nathan Julien, Elio Lafaye de Micheaux, Charlotte Noé

