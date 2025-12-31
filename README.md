# GIFT Exam Manager

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



## Installation:

### Prérequis

Pour installer ce projet, vous aurez besoin de [Node.js](https://nodejs.org/en/download) qui vous fournira la commande `npm`. Node.js est un environnement d'exécution JavaScript disponible notamment sur macOS, Linux et Windows.

### Téléchargement du dépôt et des dépendances

```bash
git clone https://github.com/malcolm-a/GL02_A25_La_derniere_equipe.git
cd GL02_A25_La_derniere_equipe
npm i
```

## Utilisation

Pour lancer le programme, utilisez la commande suivante : 

```bash
npm start
```

Si vous voulez lancer les tests, utilisez la commande suivante :
```bash
npm test
```

### Fonctionnalités


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


Les examens JSON sont automatiquement stockés dans le dossier : `/exams `

Les profils généré en html sont automatiquement stockés dans le dossier : `/html`


### Démarrage

À la première utilisation, des données sont présentes dans le répertoire `SujetB_data`. Des examens sont disponibles dans le répertoire `exams`, ceux-ci vous permettront de tester les fonctionnalités du programme, à commencer par le chargement d'un examen : cela vous évite d'avoir à créer un examen vous-même afin de pouvoir commencer à tester les fonctionnalités du programme. Vous pourrez ensuite afficher l'examen, le vérifier, le simuler, le sauvegarder au format JSON ou au format GIFT, ajouter/retirer des questions et générer un profil statistique. 

______________________________

## Contributeurs : 

Les contributeurs du projet original duquel ce projet est forké sont :

- Nathan Julien
- Elio Lafaye de Micheaux
- Charlotte Noé

Les améliorations ultérieures ont été apportées par l'équipe **Macrosoft**.