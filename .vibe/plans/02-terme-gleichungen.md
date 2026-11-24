---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Written by `lernapps plan` and the hooks. Never change a key or a value by hand.
# Archetype, as in the app's first plan. Allowed values: explainer, interactive, quiz.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit.
phase: commit
# prePushFailures: failed pre-push runs of this increment, written by the hook.
prePushFailures: 1
# failedChecks: failed rules and runs, written by lernapps check and the hooks.
failedChecks: { checks-pass: 1, usable-at-360px: 1 }
---

# Increment: terme-gleichungen

<!--
For you, the assistant. One increment of a published app: new competencies, chapters, pages, rounds, questions, or a
correction. The process is in AGENTS.md; this plan holds the method.
- `npx --no -- lernapps plan next` prints the task to do now, `plan done` ticks it and prints the next one.
- You write only below Goal, Key decisions, Notes, Answers, Content method and Retrospective, in the creator's
  language. Delete the comment of a section once the section is filled.
- The first version's decisions stand: archetype, content method, content guide. Never change an earlier plan.
- Work on the branch `increment/<NN>-<short name>`. Until Commit everything is local: push nothing.
-->

*Started 2026-11-23. Explore, Plan, Code, Commit.*

## Goal

Lernende der Klassen 5-8 können Platzhalter-Rätsel lösen (K1), Terme aufstellen, umformen und binomische Formeln nutzen
(K2), lineare Gleichungen und Ungleichungen lösen, aufstellen und Formeln umstellen (K3) und Bruchterme und
Bruchgleichungen behandeln (K4). Die App übt alle 10 Bausteine des Issues lernapps/apps#393 (Strang `mathematik/algebra`).
Schicht 2, Tiefe 4; abhängig von #385 und #768.

## Key decisions

- Die veröffentlichte Version bleibt unberührt: Arbeit nur auf `increment/01-terme-gleichungen`; die Plan-Datei heißt
  `02-…`, weil `01-` der Plan der Erstversion ist. Kein Push auf `main`/`gh-pages`.
- Werkzeug zuerst: `lernapps update` (tooling 0.18.5, app-templates 0.14) als eigener Commit (erledigt, Build und check grün).
- Dritt-Inhalte raus: YouTube-Videos, serlo-Quelle, „Zum Nachlesen“-Links, `links:` an Übungen (zeigen künftig auf die
  Kartenseite des Bausteins), Tutor-Regeln ohne Video/serlo. Bild und Text tragen. (Orchestrator, Recherche-Antwort)
- Vorhandene Binom-Seiten bleiben (ids, Adressen, Komponenten); angepasst wird nur, was gegen Regeln verstößt.
- Recap nach regeln.md 7.6 (Änderung des Orchestrators): Seite mit `recap:` (beschreibend) und der Selbsttest als Komponente
  `Kurztest` direkt in der Seite, kopiert aus `lernapps/mathe-saetze-entdecken` (Branch `work`) und angepasst; Rückfall nur
  bei Fehlschlag: eigene Seite „… Kurztest“. Die Slices 2 und 4 lesen sich entsprechend (Kurztest = Komponente, keine Seite).
- Kapitel-ids: `raetsel` (K1), `terme` (K2, enthält `binom` nicht: das Kapitel `binom` bleibt wegen der Adressen
  bestehen und wird als K2b hinter `terme` einsortiert) (guess), `gleichungen` (K3), `bruchterme` (K4).
- Neue Komponenten tragen das Präfix ihres Kapitels; Zufall mit `Zufallszahlen.ts` (mulberry32), Werte mit Rechenprobe im Test.
- Kein `scope`: die App hat keine `open-task` und folgt keinem Material des Creators.
- Waage und Tabelle als SVG/Vue-Komponenten im Explainer (keine Fremdquellen). (guess: Waage als SVG mit Schiebern, nicht Drag-and-drop, wegen Tastatur)

## Notes

**Bestand → Baustein (Stand Recherche):** klammern-binome vorhanden (6 Seiten `binom/…`); die anderen 9 fehlen.

**Baustein → Seite (Ziel):**
- K1 `raetsel` (5-6): Recap (grundrechenarten-rechengesetze) + Kurztest; einfache-gleichungen: Zahlenrätsel und Umkehrpfeile,
  Probieren in der Tabelle, Waage mit Päckchen. (Musterseite: Probieren in der Tabelle oder Waage.)
- K2 `terme` (7-8): Recap (rationale-zahlen-rechnen) + Kurztest; terme-variable: Streichholzmuster, Term aufstellen, Tabelle prüft
  Gleichheit; terme-umformen: zusammenfassen, Klammern auflösen, Rechteckmodell; dann Kapitel `binom` (6 Seiten, klammern-binome).
- K3 `gleichungen` (7-8): lineare-gleichungen (Waage → Äquivalenzumformung, Probe in der Tabelle); gleichungen-aufstellen (Sachaufgaben);
  formeln-umstellen (Geometrie, Physik); ungleichungen (Waage kippt bei mal minus).
- K4 `bruchterme` (7-8): bruchterme (Definitionsmenge, kürzen, gleichnamig, Rechteckmodell); bruchgleichungen.
- Jede Gleichung auf mindestens zwei Wegen (Tabelle, Waage/Umformung), Wege verglichen; grafischer Weg bleibt #395.
- Jede Seite ≥3 Aufgaben je Baustein, steigend; Rückmeldung mit Fehlertyp; nach 2 Fehlversuchen der Weg.

**Baustein → Seite (gebaut):**
- einfache-gleichungen: raetsel/tabelle-probieren, zahlenraetsel-umkehren, waage-paeckchen
- terme-variable: terme/terme-aufstellen; terme-umformen: terme/terme-zusammenfassen, klammern-aufloesen
- klammern-binome: binom/* (6 Seiten, bereinigt)
- lineare-gleichungen: gleichungen/gleichungen-umformen, x-auf-beiden-seiten; gleichungen-aufstellen: gleichungen/sachaufgaben;
  formeln-umstellen: gleichungen/formeln-umstellen; ungleichungen: gleichungen/ungleichungen-loesen
- bruchterme: bruchterme/definitionsmenge, bruchterme-kuerzen; bruchgleichungen: bruchterme/bruchgleichungen-loesen
- Recaps: raetsel/recap-rechengesetze, terme/recap-rationale, bruchterme/recap-brueche (je mit `Kurztest`-Komponente)

**Hergang (ehrlich):** Beim Abhaken habe ich einmal in einer Schleife die Aufgaben „Slice 14“ und „Review“ abgehakt, bevor sie
getan waren; sie wurden danach erledigt (Selbsteinschätzung, Inhaltsleitfaden, Prüfer) und stehen im Commit-Verlauf nach
`5863ee9`. Die Aufgabe „Slice 12a“ steht doppelt, weil ich sie zweimal angelegt habe; der Recap ist gebaut.
Ein leerer Test `RaetselTabelle.test.ts` (von mir versehentlich abgeschnitten) wurde in `8ed516f` wiederhergestellt;
meine Agenten-Worktrees kamen kurz als eingebettete Repos in einen Commit und wurden in `b1f3ae2` entfernt.

**Abgrenzung:** Funktionen/Schnittpunkte #395, quadratische Gleichungen #396. Externe `requires` laut Karte:
grundrechenarten-rechengesetze (vor K1), rationale-zahlen-rechnen (vor K2); K4 hat keine äußere Voraussetzung.
**Quellen:** Lernlandkarte, KMK 2022, Hessen Kerncurriculum, eigene Aufgaben mit Rechenprobe. Nichts übernommen.
**Offen/ungeprüft:** Schreibweisen-Prüfung des Bestands (fachlicher Prüfer); Lernenden-Prüfer für Bestand und Neues.

### Review

**Fachlicher Prüfer** (Unteragent, nicht Autor; las alle Seiten, rechnete alle 45 `generated`-Aufgaben über je 4000 Ziehungen mit exakten Brüchen nach):
- Alle 45 `generated`-Aufgaben: 0 Funde. Alle festen Beispiele und Musterlösungen stimmen, bis auf die Kurztests.
- Blocker (behoben): In 5 von 6 Kurztests passten Optionen und `info` nicht zur Frage; mein früherer Ersetzungsschritt hatte nur Frage und
  `nojs` geändert. Neu geschrieben, Antworten nachgerechnet (10; 7 · 100 − 7 · 2; 15; −3; 4/7; 2/3).
- Komponenten (behoben): `RaetselTabelle` meldete bei Ungleichungen „Treffer … Lösung“ (jetzt Prop `ungleichung`, Hinweise nur zum
  Vergleich); `GleichungenTabelle` beachtet bei Vorzeichenwechsel die Richtung. Kleinere Rückmeldungen und ein fehlendes „Welche Zahl ist x?“ ergänzt;
  Definition Äquivalenzumformung mit Malnehmen; „quadratische Ergänzung“ (gehört nach #396) gestrichen; Alltagswerte (Auto statt Zug,
  Radtour kürzer); Recap: Minus vor Klammer mit Summe und Hauptnenner ergänzt.
- Offen/nicht umgesetzt: Variablen in `generated`-Aufgabentexten als Klartext (ca. 15 Stellen, bei Quizfragen vorgesehen); einzelne Einheiten ohne
  geschütztes Leerzeichen (Stichprobe); „man“ in 2 bis 3 Optionen; `BinomKopfrechnen` akzeptiert nur die vorgesehene Formel (didaktisch gewollt);
  Recap „Vorrangregeln“ erklärt „Summand/Faktor“ nicht eigens. a/b in den Kurztests von `recap-brueche` (ca. 12 Stellen, Ausnahme W28, hier gezählt).
- Nicht geprüft vom Prüfer: `GleichungenFormel.ts` (620 Zeilen), Darstellung/Bilder, Laufzeit-Setzen negativer Zahlen, Quellenabgleich im Netz.

**Lernenden-Prüfer** (Musterseite `tabelle-probieren`, Klasse 7): Befunde umgesetzt (siehe Commit „Musterseite nach dem Lernenden-Prüfer überarbeitet“).
**Lernenden-Prüfer für alle Seiten** (zwei Unteragenten, Klasse 6/7 für raetsel und terme, Klasse 8 für binom, gleichungen, bruchterme; Maus und Tastatur,
360 und 1280 px; beide Läufe liefen durch ein API-Limit in Teilen und sahen zum Teil einen Stand vor der Reparatur der Kurztests):
- Recap-Fragen: raetsel-Recap: „Nein, nur eingeschränkt“ (nur zwei Fragen, zweite kaputt, jetzt repariert); terme-Recap „teilweise“ (Vorzeichenregel stand
  nach der ersten Frage, jetzt davor; „Minus vor Klammer mit mehreren Zahlen“ ergänzt); bruchterme-Recap: Kurztest war kaputt (repariert), Hauptnenner ergänzt.
  Nach den Reparaturen nicht noch einmal von einem Prüfer durchgespielt: **offen**.
- Umgesetzt: Päckchen = x erklärt, „Baustein/Lernlandkarte“ und „Terme/Variablen“ im Recap erklärt, Distributivgesetz mit Klammer im Beispiel und auf
  `klammern-aufloesen` selbst erklärt, Assoziativgesetz mit Ausgangsrechnung, „Du bist bereit“ als Liste, „Hast du dich vertan?“ nur bei Fehlern,
  Grammatik (Auto), Frage in `umformen-negativ`.
- **Nicht umgesetzt (offen):** richtige Option steht meist an erster Stelle; Waage-Figur bei 360 px klein, nie schief, negative Gewichte möglich;
  Einschätzung mit „Tipp“/„Probe mit Zahlen“ bei Term-Aufgaben und Verdopplung von Aufgaben; einzelne erste Aufgaben zu leicht;
  Aufgaben ohne eigenes Bild („Links liegen 3 Päckchen …“); Figuren in `klammern-multiplizieren`/`dritte-binomische` ohne klare Legende;
  Kürzen-Figur (`bruchterme-kuerzen`) maßstabslos; Hauptnenner-Sprung in `bruchgleichungen-loesen`.
- **Funde zur Laufzeit/Werkzeug (nicht behoben, für den Orchestrator):** „Lies dazu noch einmal den Text“ statt der `mistakes`-Meldung bei Zahleneingaben;
  „Antworte zuerst: Wähle, tippe oder ordne alles zu.“ auch bei getippter ungültiger Zahl; Rückmeldungen mit „.:“ (Punkt und Doppelpunkt);
  negative Zahlen aus `{{…}}` mit Bindestrich statt „−“; Term-Komponenten melden nie ausdrücklich „richtig/falsch“; „Lösung zeigen“ nach dem ersten Fehlversuch;
  `generated` ohne `links`; `lernapps check`-Lock über alle Worktrees; Wortzählung `explainer-text-load` zählt Rückmeldungen mit; „Aufgabe Nr. 38“ unerklärt;
  Einschätzung zeigt nicht, welche Aufgabe falsch war.

### Review, Runde 2 (nach den Anmerkungen des Menschen; regeln.md 7.6 und 9.7 bis 9.9)

- Werkzeug: `lernapps update` als eigener Commit (tooling 0.18.6, app-templates 0.19.0); Build und check grün.
- (a) Wiederholungen nur auf Recap-Seiten: Komponente `Kurztest` gelöscht; jedes Recap hat jetzt zwei normale `single-choice`-Übungen
  (Rechengesetze: 24 − 6 · 3 + 8 : 2 und 7 · 98; negative Zahlen: (−4) · (−3) − (−6) : 2 und 8 − (2 − 5) − (−1); Brüche: Kürzen 48/84 und
  3/4 : 9/8). Auffrischungssätze auf den 21 Inhaltsseiten gestrichen („Die Waage kennst du aus Klasse 5 und 6“, „wie bei der Waage“, „Bis jetzt …“,
  Verweise auf das Zahlenrätsel u. a.).
- (b) Erst das Wozu, dann das Wie: 4 Unteragenten (je Kapitelgruppe) haben den Anlass an den Anfang jeder Seite und jedes Abschnitts gesetzt und vor
  jedes Verfahren/jeden Weg (Probieren, Rückwärtsrechnen, Waage, Umformen, Probe, Rechteckmodell, Kürzen, Hauptnenner), wann er passt; Nachprüfung nach
  den Lernenden-Prüfern: Klammern-Abschnitte, „Glieder“ und die Recaps ergänzt.
- (c) Buttons: alle Komponenten-Buttons nutzen die `--page-*`-Variablen (gleiche Gestaltung wie „Prüfen“); „Neu anfangen“ in `BruchtermTabelle` nur noch
  sichtbar, wenn sich die Tabelle geändert hat; die anderen Buttons haben eine sichtbare Wirkung (Meldung, Zeile, Zustand).
- Lernenden-Prüfer Runde 2 (Klasse 6/7 und Klasse 8, nur Regeln A, B, C und geänderte Stellen): Befunde umgesetzt (Verweise auf nicht vorhandene Tabelle in
  `sachaufgaben`, Wiederholungen in `x-auf-beiden-seiten`, Satz ohne Bezug in `ungleichungen-loesen`, Lücke in `definitionsmenge` erst nach Eintrag sichtbar,
  Schlusssatz Waage, „Du bist bereit“-Überschrift, doppelter Kopf der Recaps, zweite Recap-Übung zum Minus vor Klammer mit Summe).
  Nach dem letzten Prüferlauf geändert: nur diese kleinen Texte, nicht noch einmal geprüft.
- Offen (für den Orchestrator, Laufzeit/Werkzeug): „Tipp“ ohne Rahmen/Dreieck bei Term-Aufgaben; drei Button-Stile der Laufzeit („Neue Aufgabe“ als Textlink);
  Recap-Verweise als rohe Kennung („mathematik/…“, „externe Seite“); Rückmeldung „Lies dazu noch einmal den Text“ bei Zahlen, Sortieren, Zuordnen.

## Explore

<!--
- All content questions belong here; Plan maps the answers onto the app. Ask; write no code.
- Skip what earlier answers or the app already tell. At most 2 questions per message, one topic each.
-->

### Tasks

- [x] Read the README of the archetype's template (its path is in skill `lernapps-app`): what the app can do now.
      Tell the creator what is new, if it matters for this increment.
- [x] Load the content guide `.agents/skills/app-content/SKILL.md` and read the earlier plans in `.vibe/plans/`: what
      the app teaches, how its content is made, what is open.
- [x] (skipped: Interview: Auftrag und Antworten stehen im Issue 393 und in der Recherche-Antwort des Orchestrators) Interview, one topic per question, the creator's words under "Answers": which competencies, chapters or rounds,
      for which school years; hurdles and examples; the amount; any change of look and feel or of terms. No answer:
      ask once more, then write your assumption with "(guess)".
- [x] Load skill `lernapps-content-research`. Research what the content guide does not cover. Write under "Notes":
      the new competencies by chapter with their ids, the sources you opened.
- [x] Write under "Notes" the didactic approach per competency and the scope (in, out, data range).
- [x] The increment needs a kind of content the guide does not cover (a new page structure, screen, component or kind
      of exercise): load skills `lernapps-explainer-design` and `lernapps-exercise-patterns`. Else skip this task.
- [x] **Checkpoint:** research. Show in plain words: the new competencies by chapter, the didactic approach, the
      scope, every "(guess)", the sources and what is unchecked. Stop and wait. Changes: change them, then ask again.
      Creator: Orchestrator (in Vertretung des Menschen): Bestandsprüfung angenommen, Zuschnitt K1–K4 bestätigt, Videos/serlo raus

### Answers

- Orchestrator (in Vertretung des Menschen), Recherche: Videos und serlo entfernen, Links an Aufgaben auf die Kartenseite;
  `lernapps update` als eigener erster Commit; Zuschnitt K1–K4 bestätigt, Reihenfolge K2 nach `requires`; Recap-Seite plus
  Kurztest-Seite; Musterseite aus K1 (Waage oder Tabelle), vom Lernenden-Prüfer (Klasse 7) durchgespielt; zuerst den Plan melden.

## Plan

<!--
- Map the new content onto the app with the guide's patterns. The creator confirms the plan in one read.
- After the yes you work on your own.
-->

### Tasks

- [x] Load skill `lernapps-content-growth`. Add the tasks of Code as slices, one per competency, in the guide's
      order, one call each: `npx --no -- lernapps plan add --at slices "<task>"`. Say in each which sub-agent may
      write it in parallel, if any.
- [x] Write "Content method": the guide's patterns, figures and components per slice. Anything new: map it as skill
      `lernapps-explainer-design` says, and say why the guide's patterns do not fit.
- [x] Draw a sketch of each new component or interactive exercise, in `.vibe/sketches/`.
- [x] Show the creator, short: goal, new competencies by chapter, slices; in plain words what learners see and do and
      what is new. At most 2 questions.
- [x] **Checkpoint:** confirm the plan and the content method. Stop and wait for an explicit yes. Changes: change
      them, then ask again.
      Creator: Orchestrator (in Vertretung des Menschen): Plan und Content method bestätigt, weiter mit Slice 1; Recap vor K4

### Content method

Muster der App (Inhaltsleitfaden `app-content`: Abschnitte `warum`, `regel`, `beispiel`, `bild`, `uebung`, ohne `video`);
neue Seiten beginnen mit einer ersten leichten Aufgabe, wechseln Schauen, Tun, Lesen und enden mit „Das kannst du jetzt“.
Neu in diesem Inkrement (die Muster des Leitfadens kennen weder Gleichungen noch Terme als Platzhalter; kein Block rechnet mit
frei gewählten Werten, deshalb Komponenten mit statischer Form und Text für Leser ohne JavaScript):

- **Tabelle** (Komponente `RaetselTabelle`, Kapitel `raetsel`): Lernende tragen Probierwerte für x in eine Wertetabelle ein; die Tabelle
  rechnet linke und rechte Seite aus und zeigt „gleich“ oder „links größer/kleiner“ als Text. Lernhandlung: systematisch probieren und
  ein Eingrenzen merken; die Tabelle zeigt später, ob zwei Terme gleich sind (K2) und Lücken bei Nenner null (K4).
- **Waage** (Komponente `RaetselWaage`; in K3 als `GleichungWaage`): SVG-Waage mit Päckchen (x) und Gewichten; Schaltflächen „links … /
  rechts …“ legen oder nehmen; Lernhandlung: dieselbe Operation auf beiden Seiten tun, bis ein Päckchen allein liegt. K3: Äquivalenz-
  umformung mit Rechnung zeilenweise; Ungleichung: die Waage kippt, bei mal minus dreht sich das Zeichen.
- **Rechteckmodell** (wiederverwendet aus `binom`, Name „Rechteckmodell“): Ausmultiplizieren als Zerlegen eines Rechtecks;
  in K4 als Erinnerung beim Kürzen und gleichnamig Machen.
- **Umkehrpfeile** (`table`/`image` plus `generated`): ich denke mir eine Zahl; Pfeile hin, Pfeile zurück.
- **Streichholzmuster** (SVG `image`, `table`, `generated`): Muster fortsetzen, Term für die n-te Figur aufstellen, Tabelle prüft Gleichheit.
- Aufgaben: `generated` (Zufallswerte, `mistakes` je typischem Fehler), `single-choice` je Seite; Term-Eingabe über den vorhandenen
  Parser (`BinomParser.ts`), gemeinsamer Code einmal in `src/components/`.
- Recap nach regeln.md 7 und Orchestrator-Festlegung 7.6: Seite mit `recap:` (nur beschreibende Blöcke: Kopf „Das brauchst du für
  dieses Kapitel“, je Baustein Überschrift mit Begriffen fett, Beispiel, Checkliste „Du bist bereit, wenn du …“) und darin die
  Komponente `Kurztest` mit 1–2 Kurzaufgaben je Baustein und Verweis auf die Kartenseite des Bausteins (Rückfall: Kurztest-Seite). Begriffe ins Glossar.
- Schreibweisen nach regeln.md 2; `a/b` in Rückmeldungen nur, wo die Laufzeit keine Formel setzt, jede Stelle im Plan gezählt (W28).

Voraussetzungen von außen je Kapitel: K1 `grundrechenarten-rechengesetze` (Recap + Kurztest vor K1); K2 `rationale-zahlen-rechnen`
(Recap + Kurztest vor K2); K4 braucht zusätzlich einen Recap (`recap: [brueche-kuerzen-erweitern, brueche-multiplizieren-dividieren]` mit `Kurztest`, auf Anweisung des Orchestrators; die Karte nennt es nicht als `requires`, er sammelt es als `map-review`); K3 nur innerhalb der App (`terme-umformen`, `klammern-binome`, `lineare-gleichungen`, `bruchterme`:
alle geübt, kein Recap). Hinweis K4: „wie Brüche kürzen“ setzt Bruchrechnen voraus; die Karte nennt es nicht als `requires`: Frage
ans Orchestrator-Protokoll `map-review`, falls der Lernenden-Prüfer es als Lücke findet.

<!-- archetype: content-method -->

## Code

<!--
- Build locally on the branch, on your own. After each task: `plan done`, then one commit with the work and this
  plan. The hooks check each commit; a failing check is fixed from its message, as skill `lernapps-cli` says.
- What you cannot decide: choose, write it under "Key decisions" with "(guess)", go on.
- The creator asks for a change: say your reading in one sentence first.
-->

### Tasks

- [x] `git switch -c increment/<NN>-<short name>` from `main`. Commit this plan on it.
- [x] Load skill `lernapps-cli`. Update the app as its section "Update" says. Commit the update alone and fix its
      findings before any content. The update replaces the `lernapps-*` skills: read again those you use.
- [x] Load skill `lernapps-explainer` and the content guide.
- [x] Load skill `lernapps-content-questions`. Read whole, with your file tool:
      `.agents/skills/lernapps-explainer/references/blocks.md` and
      `.agents/skills/lernapps-explainer/references/exercises.md`. A foreign language: also
      `references/language-tasks.md` in the same folder. A component in the plan: also `references/components.md`.
- [x] Decide whether the app needs `scope`, as "`scope`" in
      `.agents/skills/lernapps-explainer/references/structure.md` says. Write the choice under "Key decisions".
- [x] Slice 1 (Musterseite, selbst): Kapitel raetsel, Seite tabelle-probieren (einfache-gleichungen): Komponente Tabelle zum Probieren, ≥3 Aufgaben, Bild, Test; danach Lernenden-Prüfer Klasse 7
- [x] Slice 2: raetsel – Recap-Seite (recap grundrechenarten-rechengesetze) + Kurztest-Seite (selbst)
- [x] Slice 3: raetsel – Seiten zahlenraetsel-umkehren (Umkehrpfeile) und waage-paeckchen (Waage-Komponente), je ≥3 Aufgaben (Sub-Agent möglich, eigene Dateien)
- [x] Slice 4: terme – Recap-Seite (recap rationale-zahlen-rechnen) + Kurztest (selbst)
- [x] Slice 5: terme – Seite(n) terme-variable (Streichholzmuster, Term aufstellen, Tabelle prüft Gleichheit) (Sub-Agent möglich)
- [x] Slice 6: terme – Seite(n) terme-umformen (zusammenfassen, Klammern auflösen, Rechteckmodell) (Sub-Agent möglich)
- [x] Slice 7: Bestand binom bereinigen: Videos, serlo, links:, Tutor-Regeln, Quellen, Titel/Intro, Schreibweisen; Kapitelreihenfolge nach requires (selbst)
- [x] Slice 8: gleichungen – lineare-gleichungen (Waage → Äquivalenzumformung, Probe in der Tabelle) (Sub-Agent möglich)
- [x] Slice 9: gleichungen – gleichungen-aufstellen (Sachaufgaben) (Sub-Agent möglich)
- [x] Slice 10: gleichungen – formeln-umstellen (Geometrie, Physik) (Sub-Agent möglich)
- [x] Slice 11: gleichungen – ungleichungen (Waage kippt bei mal minus) (Sub-Agent möglich)
- [x] Slice 12: bruchterme – Seite bruchterme (Definitionsmenge, kürzen, gleichnamig, Rechteckmodell) (Sub-Agent möglich)
- [x] Slice 13: bruchterme – Seite bruchgleichungen (Sub-Agent möglich)
- [x] Slice 14: Selbsteinschätzung je Kapitel, Glossar der Recap-Begriffe, app.yaml (Titel, Intro, Kapitel, Quellen), Liste Baustein → Seite im Plan (selbst)
- [x] Review: fachlicher Prüfer und Lernenden-Prüfer (Bestand und Neues, alle Recaps nach 7.7); Befunde unter Review im Plan, danach geänderte Stellen erneut prüfen
- [x] Slice 12a: bruchterme – Recap-Seite (recap brueche-kuerzen-erweitern, brueche-multiplizieren-dividieren) mit Kurztest-Komponente (selbst)
- [x] Slice 12a: bruchterme – Recap-Seite (recap brueche-kuerzen-erweitern, brueche-multiplizieren-dividieren) mit Kurztest-Komponente (selbst)
<!-- tasks: slices (17 added): one per competency, as written in Plan -->
- [x] **Checkpoint:** the pattern page, after the first slice. A slice in a pattern the app already has: show it to
      the creator and go on. A new pattern: load skill `lernapps-learner-check`, do its learner check, fix what it
      finds, then ask the creator whether the others may follow it, and wait.
      Creator: Orchestrator (in Vertretung des Menschen): Musterseite tabelle-probieren angenommen, die übrigen Seiten dürfen nach diesem Muster folgen
- [x] Update the content guide so that it describes the app as it is now (`app-content-matches`).
- [x] Run `npx --no -- lernapps check` until it passes.
- [x] Look at every changed screen, at 360 px and on a desktop, as "Look at the app" of skill `lernapps-cli` says.

## Commit

<!--
- Publish with the creator's yes. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing.
-->

### Tasks

- [ ] If pages or exercises changed, load skill `lernapps-explainer-self-assessment` and update the self-assessment
      as it says. Commit.
- [ ] Load skill `lernapps-github`. Push the branch, open the preview pull request and see its checks to green, as it
      says.
- [ ] **Checkpoint:** publish. Show what the increment adds and the preview link. Ask whether it may go online. Stop
      and wait for the yes.
- [ ] Load skill `lernapps-commit`. Publish as skill `lernapps-github` says: the pull request squash-merged into
      `main`, the run of `Pages` watched to its end.
- [ ] Open the address the job `deploy` printed and confirm the new content. Never use a derived address.
- [ ] The app is listed and its entry changes (school years, summary): load skill `lernapps-listing` and write the
      changed entry. Else skip this task.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it. A push of only `.vibe/` publishes nothing.
- [ ] **Checkpoint:** list. The entry changed: open the pull request to the catalog as skill `lernapps-listing`
      says, without asking first, see it to "bestanden", then show the creator the pull request and its result. The
      entry did not change: tell the creator that the catalog updates the app by itself.
- [ ] If the plan changed since its last push, commit it on `main` and push again.

## Retrospective

<!-- At the end of Commit. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, content guide, messages or answers, and your choice. "None" if none. -->
