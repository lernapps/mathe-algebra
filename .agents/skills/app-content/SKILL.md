---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9); Kerncurriculum Mathematik Sekundarstufe I (Hessisches Kultusministerium, 2021). Die
  Zuordnung je Bundesland steht im Katalog (Lernlandkarte, `map/mathematik/curricula/`), nicht hier.
- Binomische Formeln: Klasse 8 (Einheit 8.1).
- Die App gehört zum Strang `mathematik/algebra` der Lernlandkarte (`strand` in `src/app.yaml`, Format 2). Jede
  Seite nennt in `competencies` die Bausteine, die sie übt: ids aus `map/mathematik.yaml` in lernapps/apps, nur aus
  diesem Strang. Ein neues Kapitel kommt nur dazu, wenn seine Bausteine im Strang `algebra` stehen; fehlt ein
  Baustein, wird er dem Katalog vorgeschlagen, nicht in der App erfunden.
- Die App entstand aus der Mathe-Karte (Kapitel `binom`); Seiten-ids und Adressen sind von dort übernommen.

## Competencies

Je Seite eine Kompetenz, Datei `src/<kapitel>/<seite>.yaml`.

- Binom (`src/binom/`): Ich kann zwei Klammern multiplizieren (`klammern-multiplizieren`), die erste, zweite und
  dritte binomische Formel anwenden (`erste-binomische`, `zweite-binomische`, `dritte-binomische`), rückwärts
  faktorisieren (`binome-rueckwaerts`) und damit im Kopf rechnen (`geschickt-rechnen`).
- Bausteine je Seite (`competencies`): jede Seite `klammern-binome` (der Baustein umfasst Klammern auflösen und die
  binomischen Formeln vorwärts und rückwärts).

## Content structure

Jede Seite hat diese Abschnitte, in dieser Reihenfolge und mit diesen ids (öffentlicher Vertrag, nie umbenennen):

1. `warum` – „Warum?“: ein Absatz aus dem Alltag oder der Klassenarbeit.
2. `regel` – „Regel“: `formula`-Blöcke, Fachbegriffe als `definition`, eine `note` „Merke“.
3. `beispiel` – „Beispiel“: eine `example`-Box mit `table` (gegeben, Rechnung, Ergebnis).
4. `bild` – „Bild“: das Beispielbild, ohne JavaScript sichtbar (siehe Figures).
5. `video` – „Video dazu“: ein `video`-Block (`youtube: <11 Zeichen nach watch?v=>`, `title` wie YouTube ihn zeigt,
   `channel: Lehrerschmidt`), danach der serlo-Link als Text, falls es einen geprüften gibt. Kein YouTube-Link im
   Text, kein Satz zu Kanal oder Datenschutz: das zeigt der Block selbst.
6. `uebung` – „Übung“: die Übungen (siehe Exercise patterns).

`description` und `summary` sind reiner Text ohne `$…$`.

## Ids, addresses and the tutor

- Seiten-, Abschnitts- und Übungs-ids und die Adresse `/<kapitel>/<seite>/?<übung>=<n>#<übung>` sind ein öffentlicher
  Vertrag: Der KI-Tutor und geteilte Links nennen sie. Nie umbenennen; eine Seite zieht nicht um.
- Die Regeln für den Tutor stehen in `src/app.yaml` (`tutor.rules`), nicht in den Seiten.

## Terminology

- Du-Anrede, kurze Sätze, Ton einer Lehrkraft, nicht der App („die App akzeptiert“ ist verboten). Kein „NICHT“ in
  Großbuchstaben, keine Verweise wie „Kompetenz 3“: ein Link mit Namen.
- Binom: „Glied“, „Mittelglied“, „Ausmultiplizieren“, „Faktorisieren“; Terme in der Eingabe mit `^` (`x^2+6x+9`).

## Exercise patterns

- Bezeichner: deutsche Fachbegriffe (`Grundwert`, `Pfad`), englisch nur für allgemeine Struktur. Jede Komponente
  trägt das Präfix ihres Kapitels (`Binom…`). Gemeinsamer Code steht einmal in
  `src/components/Zufallszahlen.ts` (mulberry32); nie in ein
  Kapitel kopieren.

- Je Seite eine Übungskomponente mit „Bild zur Aufgabe“, Tipp, Rechenweg und den typischen Fehlern der alten App:
  - Binom: `BinomTermAufgabe` mit Prop `art` (`klammern`, `erste`, `zweite`, `dritte`, `rueckwaerts`), Parser und
    Gleichwertigkeit in `BinomParser.ts`/`BinomTerm.ts`, Generatoren in `BinomFormeln.ts`; `BinomKopfrechnen` auf
    `geschickt-rechnen`.
- Dazu je Seite eine Übung, die keine Komponente ist (der explainer verlangt sie): eine `single-choice`-Frage zu
  einem typischen Fehler mit `info` je Option.
- Selbsteinschätzung (`selfAssessment` in `chapter.yaml`): so viele Seiten wie sinnvoll, je abgefragte Seite 2
  Aufgaben, Schritte zu 3, je Kapitel 12. Bevorzugt die Übungskomponente der Seite (sie zeigt ihre Aufgabe
  selbst und zieht jede Runde eine neue), dazu die `generated`-Übung, sonst die Komponente zweimal.
  - Binom: auf jeder Seite die Komponente zweimal (`BinomTermAufgabe`, `BinomKopfrechnen`); die `single-choice`-Fragen
    kann man raten.
- Text und Optionen einer Quiz-Frage sind reiner Text ohne `$…$` (die Laufzeit-Tests vergleichen ungesetzten Text):
  Hochzahlen als `²`, Malpunkt `·`.

## Figures

- Was kein Block zeichnet (Flächenbild, Baum, Urne), zeichnet die Komponente der Übung; das Beispielbild entsteht
  daraus als SVG (gerendert mit `scripts/bilder.mjs`, das bis `8b229e9` im Repo lag und in der Git-Historie steht;
  `<svg>` mit `viewBox`, sonst schneidet der Browser die Datei zu), auf der Seite ein `figure` mit
  `image: images/<kapitel>-<seite>.svg`, `alt` aus dem `aria-label`, `caption` mit der genauen Beschreibung,
  `source: Eigene Darstellung der Mathe-Karte`, `licence: MIT`. Nie von Hand gezeichnete SVGs.
- Farben: Mathe-Blau `#1d4ed8`, Hervorhebung Orange `#ff8f00`.

## Sources

- Videos: Kanal Lehrerschmidt (YouTube), je Seite geprüft über oEmbed (`author_name` und Titel passen); als `video`-Block,
  der den Player erst nach dem Klick von youtube-nocookie.com lädt.
- serlo.org: Artikel mit numerischer id (`https://de.serlo.org/mathe/<id>/<slug>`), per curl geprüft (Status 200, der
  Artikel selbst, passt zur Kompetenz). Kein schwacher Treffer; dann kein Link.
- Texte und Aufgaben sind eigene Arbeit (MIT), übernommen aus den alten Apps des Repos.

## Adding a chapter or round

1. Kompetenzen als „Ich kann …“ hier eintragen; Seiten-ids festlegen (nie wieder ändern).
2. `src/<kapitel>/chapter.yaml` und je Seite die YAML-Datei mit den sechs Abschnitten und `competencies` (Bausteine
   des Strangs); Kapitel in `src/app.yaml`.
3. Übungen nach den Mustern oben, Test zuerst (`src/components/<Name>.test.ts`).
4. Beispielbilder nach Figures.
5. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
6. `npx vp test run`, `npm run build`, `npx lernapps check`; dann Commit und Pull Request.

## Rules learned from mistakes

- Formeln in `description` erschienen roh im Inhaltsverzeichnis → reiner Text.
- Formeln in Quiz-Fragen ließen die Laufzeit-Tests scheitern und hatten keinen zugänglichen Namen → reiner Text.
- Bilder als Komponente waren ohne JavaScript unsichtbar → statische SVGs aus `scripts/bilder.mjs`.
- Videos als Textlink mit Satz „Der Link öffnet YouTube …“ wiederholten, was die Runtime kann → `video`-Block.
- Ein wählbares Feld mit sichtbarem Text braucht diesen Text am Anfang seines Namens (axe
  label-content-name-mismatch).
