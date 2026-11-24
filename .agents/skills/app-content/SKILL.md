---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9); Kerncurriculum Mathematik Sekundarstufe I (Hessisches Kultusministerium, 2021). Die
  Zuordnung je Bundesland steht im Katalog (Lernlandkarte, `map/mathematik/curricula/`), nicht hier.
- Terme und Gleichungen: Klasse 5-6 (Rätsel mit Platzhaltern) und Klasse 7-8 (Terme, binomische Formeln, lineare
  Gleichungen und Ungleichungen, Bruchterme).
- Die App gehört zum Strang `mathematik/algebra` der Lernlandkarte (`strand` in `src/app.yaml`, Format 2). Jede
  Seite nennt in `competencies` die Bausteine, die sie übt: ids aus `map/mathematik.yaml` in lernapps/apps, nur aus
  diesem Strang. Ein neues Kapitel kommt nur dazu, wenn seine Bausteine im Strang `algebra` stehen; fehlt ein
  Baustein, wird er dem Katalog vorgeschlagen, nicht in der App erfunden.
- Die App entstand aus der Mathe-Karte (Kapitel `binom`); Seiten-ids und Adressen von `binom` sind von dort übernommen
  und bleiben.
- Regeln für alle Mathe-Explainer (Schreibweisen, Aufgaben, Quellen, Recaps): `docs/mathe-epic/regeln.md` in lernapps/apps.

## Competencies

Je Seite eine Kompetenz (ein Baustein), Datei `src/<kapitel>/<seite>.yaml`. Reihenfolge der Kapitel nach `requires` der Karte:

- `raetsel` (5-6): Recap „Vorrangregeln und Rechengesetze“; `einfache-gleichungen` auf `tabelle-probieren`,
  `zahlenraetsel-umkehren`, `waage-paeckchen`.
- `terme` (7-8): Recap „Rechnen mit negativen Zahlen“; `terme-variable` auf `terme-aufstellen`; `terme-umformen` auf
  `terme-zusammenfassen` und `klammern-aufloesen`.
- `binom` (8): `klammern-binome` auf `klammern-multiplizieren`, `erste-binomische`, `zweite-binomische`,
  `dritte-binomische`, `binome-rueckwaerts`, `geschickt-rechnen`.
- `gleichungen` (7-8): `lineare-gleichungen` auf `gleichungen-umformen`, `x-auf-beiden-seiten`;
  `gleichungen-aufstellen` auf `sachaufgaben`; `formeln-umstellen` auf `formeln-umstellen`; `ungleichungen` auf
  `ungleichungen-loesen`.
- `bruchterme` (7-8): Recap „Brüche kürzen und erweitern“ und „Bruchrechnung: Multiplikation und Division“;
  `bruchterme` auf `definitionsmenge`, `bruchterme-kuerzen`; `bruchgleichungen` auf `bruchgleichungen-loesen`.

## Content structure

- Seitenabschnitte nach dem, was die Seite lehrt (ids bleiben nach der Veröffentlichung); neue Seiten beginnen mit einer
  leichten ersten Aufgabe oder einem Bild, wechseln Schauen, Tun, Lesen und enden mit „Das kannst du jetzt: …“. Die
  Seiten von `binom` haben die Abschnitte `warum`, `regel`, `beispiel`, `bild`, `uebung`.
- Erst das Wozu, dann das Wie: Jede Seite, jeder Abschnitt und jedes Verfahren beginnt in ein bis zwei Sätzen mit dem Anlass
  (Welche Frage löst es?), erst danach kommt die Methode. Buttons eigener Komponenten haben eine sichtbare Wirkung und die
  Gestaltung der Laufzeit (`--page-*`).
- Eine neue Darstellung oder Rechenart wird vor der ersten Aufgabe in Worten mit ihrem Modell eingeführt; Texte und
  Aufgaben verweisen nur auf Sichtbares („die Tabelle darüber“ nur, wenn das Werkzeug direkt davor steht).
- Recap-Seite (`recap:`, nur beschreibende Blöcke): Kopf „Das brauchst du für dieses Kapitel“, je Baustein eine
  Überschrift, Fachbegriffe als `definition` (kommen ins Glossar), ein Beispiel, höchstens zwei Übungen (`single-choice`, sofortige
  Rückmeldung mit Grund, nicht zu leicht für die Stufe) und der Satz mit dem Namen des Bausteins und seiner Kartenseite;
  Schluss „Du bist bereit, wenn du …“ als Liste. Wiederholungen stehen nur auf Recap-Seiten.
- Keine Videos, keine Links auf fremde Seiten (auch nicht serlo oder Wikipedia), keine `links:` an Aufgaben.
- `description` und `summary` sind reiner Text ohne `$…$`.

## Ids, addresses and the tutor

- Seiten-, Abschnitts- und Übungs-ids und die Adresse `/<kapitel>/<seite>/?<übung>=<n>#<übung>` sind ein öffentlicher
  Vertrag: Der KI-Tutor und geteilte Links nennen sie. Nie umbenennen; eine Seite zieht nicht um.
- Die Regeln für den Tutor stehen in `src/app.yaml` (`tutor.rules`), nicht in den Seiten.

## Terminology

- Du-Anrede, kurze Sätze, Ton einer Lehrkraft, nicht der App („die App akzeptiert“ ist verboten). Kein „NICHT“ in
  Großbuchstaben, keine Verweise wie „Kompetenz 3“: ein Link mit Namen.
- Binom: „Glied“, „Mittelglied“, „Ausmultiplizieren“, „Faktorisieren“; Terme in der Eingabe mit `^` (`x^2+6x+9`).

## Exercise patterns

- Bezeichner: deutsche Fachbegriffe, englisch nur für allgemeine Struktur. Jede Komponente trägt das Präfix ihres
  Kapitels (`Raetsel…`, `Terme…`, `Binom…`, `Gleichungen…`, `Bruchterm…`; `GleichungWaage` und `Kurztest` sind
  kapitelübergreifend). Gemeinsamer Code steht einmal: `Zufallszahlen.ts` (mulberry32), `BinomParser.ts` und
  `BinomTerm.ts` (Terme lesen, Gleichwertigkeit); nie in ein Kapitel kopieren.
- **Werkzeuge** (keine Aufgaben, `nojs`, nichts wird geprüft): `RaetselTabelle` (Tabelle zum Probieren, a · x + b = c),
  `GleichungWaage` (Waage mit Päckchen und Gewichten, auf beiden Seiten dasselbe tun), `GleichungenTabelle`,
  `GleichungenWaage` (x auf beiden Seiten), `GleichungenGerade` (Lösungsmenge auf der Zahlengerade), `TermeTabelle`
  (zwei Terme vergleichen), `BruchtermTabelle` (Lücke bei Nenner 0), `BruchtermRechteck`, `BruchgleichungTabelle`.
- **Übungskomponenten** (Eingabe, Prüfung durch den explainer, Rückmeldung mit Fehlertyp): `BinomTermAufgabe`
  (Prop `art`), `BinomKopfrechnen`, `TermeAufstellen`, `TermeUmformen`, `GleichungenFormel`.
- Sonst `generated` (Zufallswerte, `mistakes` je typischem Fehler, `hint`, `steps`, ganzzahlig über `where`),
  `number`, `single-choice` (mit `info` je Option), `ordering`, `matching`. Mindestens drei Aufgaben je Baustein, die
  erste nicht ohne Gedanken im Kopf lösbar, steigende Schwierigkeit.
- Text und Optionen einer Quiz-Frage sind reiner Text ohne `$…$` (die Laufzeit-Tests vergleichen ungesetzten Text):
  Hochzahlen als `²`, Malpunkt `·`, Minus `−`.
- Selbsteinschätzung (`selfAssessment` in `chapter.yaml`): je Kapitel zwei bis drei Schritte zu 3 Aufgaben, bevorzugt
  `generated` und Übungskomponenten, je Seite zwei Aufgaben; Recap-Seiten sind nie dabei.

## Figures

- Was kein Block zeichnet (Flächenbild, Baum, Urne), zeichnet die Komponente der Übung; das Beispielbild entsteht
  daraus als SVG (gerendert mit `scripts/bilder.mjs`, das bis `8b229e9` im Repo lag und in der Git-Historie steht;
  `<svg>` mit `viewBox`, sonst schneidet der Browser die Datei zu; neue Bilder erzeugt ein Skript außerhalb des Repos), auf der Seite ein `figure` mit
  `image: images/<kapitel>-<seite>.svg`, `alt` aus dem `aria-label`, `caption` mit der genauen Beschreibung,
  `source: Eigene Darstellung der Mathe-Karte`, `licence: MIT`. Nie von Hand gezeichnete SVGs.
- Farben: Mathe-Blau `#1d4ed8`, Hervorhebung Orange `#ff8f00`.

## Sources

- Texte, Aufgaben und Bilder sind eigene Arbeit (MIT); die Seiten von `binom` stammen aus den alten Apps des Repos.
- Lernlandkarte, KMK-Bildungsstandards (2022) und das Hessische Kerncurriculum sind die einzigen Quellen. Keine Videos,
  keine Dritt-Inhalte (`thirdParty: none`), kein serlo, kein Wikipedia im Explainer.

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
- Videos und serlo-Links sind raus (Regeln für alle Mathe-Explainer, Abschnitt 4).
- Ein wählbares Feld mit sichtbarem Text braucht diesen Text am Anfang seines Namens (axe
  label-content-name-mismatch).
