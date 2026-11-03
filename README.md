# Mathe: Algebra

Binomische Formeln für Klasse 8: <https://lernapps.net/mathe-algebra/>. Teil von [lernapps.net](https://lernapps.net/).

Die App gehört zum Strang **Algebra** der Lernlandkarte Mathematik (`strand: mathematik/algebra`) und
soll entlang dieses Strangs wachsen. Bisher hat sie ein Kapitel, Binomische Formeln (`src/binom/`): zwei Klammern multiplizieren; die erste, zweite und dritte binomische Formel; rückwärts faktorisieren; geschickt im Kopf rechnen.
Jede Seite nennt die Bausteine der Lernlandkarte, die sie übt (`competencies`).

Jede Seite erklärt eine Sache mit Regel, Beispiel und Bild und endet mit Übungsaufgaben, die sofort sagen, ob das
Ergebnis stimmt. Jede Seite ist ohne JavaScript lesbar, Text und Bild. Kein Server, kein Tracking, keine Anfrage an
fremde Server vor einem Klick; ein Video lädt erst, wenn du es startest.

Die App entstand aus der [Mathe-Karte](https://github.com/lernapps/mathe-karte), die drei Stränge in einer App hatte. Die
Seiten haben dieselben Adressen wie dort (`binom/<seite>/`), nur unter `https://lernapps.net/mathe-algebra/`.

Die Seiten sind ein _explainer_ von lernapps.net ([`@lernapps/app-templates`](https://github.com/lernapps/app-templates)),
Format 2: Der Inhalt steht als YAML in [`src/`](src/), Übungen sind deklarierte Aufgaben oder Vue-Komponenten in
[`src/components/`](src/components/).

```bash
npm ci                 # Abhängigkeiten installieren (lernapps-Pakete von GitHub, auf einen Commit gepinnt)
npx vp test run        # Unit-Tests der Komponenten
npm run build          # _site/ bauen; bricht bei Regelverstößen ab
npm run dev            # explainer lokal ansehen
npx lernapps check     # alle Prüfungen von lernapps.net samt Browser-Tests
```

## Architektur

Die App hat keine eigene Architektur. Für jeden explainer gilt die gemeinsame Architektur von lernapps.net:
[arc42 des explainers](https://github.com/lernapps/app-templates/tree/main/explainer/docs/arc42) in
`lernapps/app-templates`, dazu die Regeln von [lernapps.net](https://lernapps.net/tooling/rules/). Kürzel wie `QZ-3`
oder `R-025` in Kommentaren und Tests stammen aus der früheren arc42-Doku der Mathe-Karte (in deren Git-Historie).

Videos sind `video`-Blöcke der Runtime: Vor dem Klick lädt nichts von YouTube, erst der Klick lädt den Player von
youtube-nocookie.com. Die Flächenbilder in `src/images/` sind aus den Übungskomponenten gerenderte SVGs (`scripts/bilder.mjs`, in der Git-Historie der Mathe-Karte bis `8b229e9`).

Geprüft und veröffentlicht wird mit dem Werkzeug von lernapps.net, wie bei jeder App aus dem Generator:
`.github/workflows/pages.yml` führt `lernapps check` bei jedem Push und Pull Request aus, stellt jeden Pull Request
als Vorschau unter `…/mathe-algebra/pr-preview/pr-<Nummer>/` bereit und veröffentlicht `main` auf dem Branch `gh-pages`.

Wie man eine Seite oder ein Kapitel anlegt, steht im Inhaltsleitfaden
[`.agents/skills/app-content/`](.agents/skills/app-content/SKILL.md).

## Lizenz

[MIT](LICENSE), für den Code und die Texte in diesem Repo. Inhalte Dritter (z. B. Zitate aus Lehrplänen) behalten ihre eigene Lizenz.
