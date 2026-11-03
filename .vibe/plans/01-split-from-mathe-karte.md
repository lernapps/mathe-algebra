---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype as in the app's first plan; set it when you start. Never changes.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: commit
# prePushFailures: failed pre-push runs of this increment, written by the hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Plan: mathe-algebra aus der Mathe-Karte

*Begonnen 2026-11-03. Explore, Plan, Code, Commit.*

## Goal

Die Mathe-Karte (lernapps/mathe-karte) deckte drei Stränge der Lernlandkarte ab. Eine App hat aber genau einen Strang
(KD-07 in lernapps/apps, `.vibe/development-plan-feat-learning-map.md`, Schritt H). Diese App übernimmt das Kapitel
`binom` (Binomische Formeln) und steht im Strang `mathematik/algebra`. Sie soll entlang des Strangs Algebra wachsen.

## Key decisions

- Ein Repo je Strang: `mathe-arithmetik` (Prozent), `mathe-algebra` (Binom), `mathe-stochastik` (Zufall).
- Explainer Format 2: `format: 2`, `strand: mathematik/algebra` in `src/app.yaml`; jede Seite nennt `competencies`
  (6 Seiten, alle mit `klammern-binome`). Die ids stammen aus `map/mathematik.yaml` in lernapps/apps und gehören alle zum Strang `algebra`.
- Kapitel- und Seiten-ids bleiben wie in der Mathe-Karte (`binom/<seite>/`); die Adresse ist neu:
  <https://lernapps.net/mathe-algebra/>.
- `@lernapps/app-templates` auf 66eb4dc gepinnt (Format 2 gibt es bisher nur dort); `vite-plus` dafür auf 1.4.0
  (Peer-Abhängigkeit von app-templates 66eb4dc). `@lernapps/tooling` wie in der Mathe-Karte.
- Nur die Komponenten, Bilder und Tests, die das Kapitel braucht; Texte, Übungen und Selbsteinschätzung unverändert.
- Die Mathe-Karte bleibt, wie sie ist (Format 1). Offen: die alte Adresse und der Fortschritt der Lernenden (die
  Mathe-Karte speichert nur die Wahl des Tutors, die Video-Wahl und die letzte Selbsteinschätzung).

## Explore

### Completed

- [x] Vertrag gelesen: `docs/learning-map-contract.md` (Abschnitt 3, Format 2) in lernapps/apps.
- [x] Kompetenz-ids je Seite aus lernapps/apps#115 gegen `map/mathematik.yaml` geprüft: alle vorhanden, alle im
      Strang `algebra`.

## Plan

### Completed

- [x] Aufteilung: Kapitel `binom` mit seinen Komponenten (per Import-Graph), Bildern, Unit-Tests und dem E2E-Test des
      explainers; Konfiguration, Workflow, Skills und Lizenz aus der Mathe-Karte.

## Code

### Completed

- [x] Kapitel, Komponenten und Bilder kopiert; Schema-Kommentare auf `explainer.v2.schema.json`.
- [x] `src/app.yaml`: Format 2, Strang, Titel, Einleitung, Quellen und Tutor-Regeln nur für dieses Kapitel.
- [x] `competencies` auf jeder Seite.
- [x] `package.json` (Name, Beschreibung, Pins), `npm install`.
- [x] README, Inhaltsleitfaden `.agents/skills/app-content/` auf dieses Kapitel gekürzt.
- [x] `npm run build`, `npx vp test run`, `npx lernapps check`.

## Commit

### Tasks

- [ ] Push des Branches `claude/vibrant-faraday-5qg8eu`; Pull Request und Veröffentlichung erst nach dem Merge von
      Format 2 in lernapps/app-templates.
- [ ] Repo-Einstellungen (GitHub Pages aus `gh-pages`) und Eintrag im Katalog mit `strand: mathematik/algebra`.

### Completed

## Retrospective

### Where I had to guess

- Titel der App „Mathe: Algebra – Binomische Formeln“ und die Einleitung.
