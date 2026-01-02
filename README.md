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
- Sauvegarder et charger des examens au format JSON

---

## Table des matières

- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Fonctionnalités](#-fonctionnalités)
- [Structure du projet](#-structure-du-projet)
- [Qualité du code](#-qualité-du-code)
- [Contributeurs](#-contributeurs)

---


## Installation :

### Prérequis

Pour installer ce projet, vous aurez besoin de [Node.js](https://nodejs.org/en/download), qui fournit la commande `npm`.  
Node.js est un environnement d'exécution JavaScript disponible sur macOS, Linux et Windows.

### Téléchargement du dépôt et des dépendances

```bash
# Cloner le projet
git clone https://github.com/malcolm-a/GL02_A25_La_derniere_equipe.git

# Accéder au dossier
cd GL02_A25_La_derniere_equipe

# Installer les dépendances
npm install
```

---

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


Le programme propose un menu interactif avec les fonctionnalités suivantes :

- **Gestion de contenu**
  - Recherche de questions par mot-clé ou par ID unique

- **Édition d'examen**
  - Ajout et suppression de questions dans un examen en cours

- **Simulation & Vérification**
  - Vérification de la conformité d'un examen
  - Simulation d'une session de passage

- **Export & Compatibilité**
  - Sauvegarde au format **JSON**
  - Export au format **GIFT** (compatible Moodle)
  - Génération de fiches d'identification enseignant au format **vCard**

- **Analyse de données**
  - Comparaison avec un corpus existant
  - Génération d'un profil statistique visuel (page HTML avec graphiques **Vega-Lite**)


Les examens JSON sont automatiquement stockés dans le dossier : `out/exams `
Les profils générés en HTML sont automatiquement stockés dans le dossier : `out/html`


### Structure du projet

- `out/exams/` – Fichiers d'examens au format JSON  
- `out/html/` – Profils statistiques et graphiques générés  
- `SujetB_data/` – Données sources et banques de questions initiales  
- `src/` – Code source de l'application (logique métier, parseur GIFT, etc.)

### Démarrage

À la première utilisation, des données sont présentes dans le répertoire `SujetB_data`. Des examens sont disponibles dans le répertoire `exams`, ceux-ci vous permettront de tester les fonctionnalités du programme, à commencer par le chargement d'un examen : cela vous évite d'avoir à créer un examen vous-même afin de pouvoir commencer à tester les fonctionnalités du programme. Vous pourrez ensuite afficher l'examen, le vérifier, le simuler, le sauvegarder au format JSON ou au format GIFT, ajouter/retirer des questions et générer un profil statistique. 

---

## Style de code

Ce projet utilise ESLint avec la configuration Prettier pour le formatage du code. Cela permet un style cohérent, lisible et universel. 

Pour formater le code, utilisez la commande suivante :
```bash
npm run format
```

--- 

## Contributeurs : 

Les contributeurs du projet original duquel ce projet est forké sont :

- Nathan Julien
- Elio Lafaye de Micheaux
- Charlotte Noé

Les améliorations ultérieures ont été apportées par l'équipe **Macrosoft**.