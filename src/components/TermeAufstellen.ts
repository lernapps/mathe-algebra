// Die Logik der Übung TermeAufstellen.vue (Kapitel terme): eine Aufgabe zur Aufgabennummer (seed), bei der man einen Term
// mit n aufstellt, ihre Prüfung per Gleichwertigkeit, die typischen Fehler mit ihrer Meldung, Lösung, die Beschreibung
// für Tutor und Seite ohne JavaScript und was die Übung ist (about). Terme liest und vergleicht BinomTerm.ts.
// Zwei Arten: "kette" (eine Kette aus Vielecken aus Streichhölzern: (Ecken − 1) · n + 1 Hölzer) und "preis"
// (Grundgebühr plus Preis je Stunde: Preis · n + Grundgebühr).
import { leseTerm } from "./BinomParser.ts";
import { sindGleichwertig } from "./BinomTerm.ts";
import { mulberry32, zufallAusFolge, type Zufall } from "./Zufallszahlen.ts";
import { zahlText } from "./RaetselTabelle.ts";
import { leseTermN, wert } from "./TermeTabelle.ts";

export type Art = "kette" | "preis";

export interface Fehler {
  /** Nummer in about.mistakes. */
  nr: number;
  kandidat: string;
  meldung: string;
}

export interface Aufgabe {
  art: Art;
  /** Die Aufgabe, wie das Kind sie liest. */
  text: string;
  /** Beschriftung des Eingabefelds. */
  feld: string;
  /** Der richtige Term, getippt (3n+1). */
  loesung: string;
  /** Der richtige Term gesetzt (3n + 1). */
  anzeige: string;
  latex: string;
  /** Der richtige Term ist a · n + b. */
  a: number;
  b: number;
  fehler: Fehler[];
  tipp: string;
  schritte: string[];
}

export interface Props {
  art: Art;
}

const FORMEN = [
  { ecken: 3, einzahl: "Dreieck", mehrzahl: "Dreiecken" },
  { ecken: 4, einzahl: "Quadrat", mehrzahl: "Quadraten" },
  { ecken: 5, einzahl: "Fünfeck", mehrzahl: "Fünfecken" },
  { ecken: 6, einzahl: "Sechseck", mehrzahl: "Sechsecken" },
] as const;

/** Der Zufall einer Aufgabennummer: ein eigener Startwert je Kapitel, damit die Aufgaben anderer Kapitel unberührt bleiben. */
export function erzeugeZufall(seed: number): Zufall {
  return zufallAusFolge(mulberry32((Math.imul(seed, 2246822519) + 3266489917) >>> 0));
}

/** a · n + b als getippter Term: "3n+1". */
const tippe = (a: number, b: number): string => `${a}n+${b}`;

function kette(z: Zufall): Aufgabe {
  const form = z.wahl(FORMEN);
  const s = form.ecken;
  const dazu = s - 1;
  const { einzahl, mehrzahl } = form;
  return {
    art: "kette",
    text: `Aus Streichhölzern wird eine Kette aus ${mehrzahl} gelegt. Das erste ${einzahl} braucht ${s} Hölzer. Jedes weitere ${einzahl} teilt eine Seite mit seinem Nachbarn und braucht darum nur ${dazu} Hölzer dazu. Schreib einen Term für die Zahl der Hölzer bei n ${mehrzahl}.`,
    feld: `Hölzer bei n ${mehrzahl} =`,
    loesung: tippe(dazu, 1),
    anzeige: `${dazu}n + 1`,
    latex: `${dazu} \\cdot n + 1`,
    a: dazu,
    b: 1,
    fehler: [
      {
        nr: 0,
        kandidat: `${s}n`,
        meldung: `Du hast für jedes ${einzahl} ${s} Hölzer gezählt. Aber nur das erste braucht ${s}: Jedes weitere teilt eine Seite und braucht nur ${dazu}.`,
      },
      {
        nr: 1,
        kandidat: `${dazu}n`,
        meldung: `Das erste ${einzahl} braucht ein Holz mehr als die anderen. Zu ${dazu} · n fehlt noch ein einzelnes Holz.`,
      },
      {
        nr: 2,
        kandidat: `n+${dazu}`,
        meldung: `Bei jedem weiteren ${einzahl} kommen ${dazu} Hölzer dazu, nicht nur eines. Darum muss n mit ${dazu} malgenommen werden.`,
      },
    ],
    tipp: `Zähle für n = 1, 2 und 3 und schau, wie viele Hölzer jedes weitere ${einzahl} dazubringt. Stimmt dein Term für n = 3?`,
    schritte: [
      `Das erste ${einzahl} braucht ${s} Hölzer.`,
      `Jedes weitere ${einzahl} braucht ${dazu} Hölzer dazu. Bei n ${mehrzahl} sind das n − 1 weitere: ${dazu} · (n − 1).`,
      `Zusammen: ${s} + ${dazu} · (n − 1) = ${dazu}n + 1.`,
    ],
  };
}

function preis(z: Zufall): Aufgabe {
  const grund = z.ganzzahl(2, 9);
  let je = z.ganzzahl(2, 6);
  if (je === grund) je = je === 6 ? 5 : je + 1;
  return {
    art: "preis",
    text: `Ein Fahrradverleih nimmt ${grund} € Grundgebühr, die du einmal zahlst, und ${je} € für jede Stunde. Schreib einen Term für den Preis in Euro bei n Stunden.`,
    feld: "Preis in Euro bei n Stunden =",
    loesung: tippe(je, grund),
    anzeige: `${je}n + ${grund}`,
    latex: `${je} \\cdot n + ${grund}`,
    a: je,
    b: grund,
    fehler: [
      {
        nr: 2,
        kandidat: `${grund}+${je}+n`,
        meldung: `Du hast nur addiert. Jede Stunde kostet ${je} €, bei n Stunden also ${je} · n.`,
      },
      {
        nr: 3,
        kandidat: tippe(grund, je),
        meldung: `Du hast die Zahlen vertauscht: ${je} € kostet jede Stunde, ${grund} € ist die Grundgebühr, die nur einmal kommt.`,
      },
      {
        nr: 4,
        kandidat: `(${je}+${grund})n`,
        meldung: `Die Grundgebühr von ${grund} € zahlst du nur einmal, nicht bei jeder Stunde. Sie gehört nicht in die Klammer mit n.`,
      },
      {
        nr: 5,
        kandidat: `${je}n`,
        meldung: `Die Grundgebühr von ${grund} € fehlt noch: Sie kommt einmal zu den Stunden dazu.`,
      },
    ],
    tipp: "Wie viel zahlst du für 1 Stunde, wie viel für 2, wie viel für 3? Was bleibt immer gleich, was wächst mit n?",
    schritte: [
      `Die Grundgebühr zahlst du einmal: ${grund} €.`,
      `Jede Stunde kostet ${je} €, n Stunden kosten ${je} · n €.`,
      `Zusammen: ${je} · n + ${grund}.`,
    ],
  };
}

/** Der Wert des richtigen Terms für n: die Probe der Aufgabe. */
export const wertFuer = (aufgabe: Aufgabe, n: number): number => aufgabe.a * n + aufgabe.b;

export function generate(seed: number, props: Props): Aufgabe {
  const z = erzeugeZufall(seed);
  return props.art === "preis" ? preis(z) : kette(z);
}

const MELDUNG_LEER = "Schreib einen Term mit n, zum Beispiel 3n + 1.";

/** Die Eingabe als Term mit höchstens n; sonst die Meldung, was nicht geht. */
function lies(antwort: string): string {
  const gelesen = leseTermN(antwort);
  return gelesen.meldung;
}

export function check(aufgabe: Aufgabe, antwort: string): boolean {
  return lies(antwort) === "" && sindGleichwertig(antwort, aufgabe.loesung);
}

/** Der erste Wert von n (1 bis 4), bei dem die Antwort etwas anderes ergibt als die Aufgabe. */
function abweichung(aufgabe: Aufgabe, antwort: string): string {
  const term = leseTerm(antwort);
  for (const n of [3, 1, 2, 4]) {
    const meins = wert(term, n);
    const richtig = wertFuer(aufgabe, n);
    if (meins !== undefined && meins !== richtig) {
      return ` Bei n = ${n} gibt dein Term ${zahlText(meins)}, gezählt sind es ${richtig}.`;
    }
  }
  return "";
}

/** Warum die Antwort nicht stimmt: Lesefehler, falscher Buchstabe oder der passende typische Fehler; "" bei einer richtigen. */
export function grund(aufgabe: Aufgabe, antwort: string): string {
  if (check(aufgabe, antwort)) return "";
  const meldung = lies(antwort);
  if (meldung !== "") return meldung;
  const gelesen = leseTerm(antwort);
  if (gelesen.fehler === undefined && !gelesen.variablen.includes("n")) {
    return "In deinem Term kommt n gar nicht vor. Die Zahl der Hölzer ändert sich aber mit n.";
  }
  const fehler = aufgabe.fehler.find((f) => sindGleichwertig(antwort, f.kandidat));
  if (fehler !== undefined) return fehler.meldung;
  return `Das stimmt noch nicht.${abweichung(aufgabe, antwort)} Rechne für n = 1, 2 und 3 nach und vergleiche.`;
}

/** Die Antwort aus dem Feld; undefined, solange es leer ist. */
export const antwortAus = (getippt: string): string | undefined => (getippt.trim() === "" ? undefined : getippt);

/** Was die Übung aus der Eingabe gelesen hat: "Gelesen: 3n + 1", eine Meldung bei Lesefehlern, sonst "". */
export function vorschau(antwort: string): string {
  if (antwort.trim() === "") return "";
  const gelesen = leseTerm(antwort);
  return gelesen.fehler === undefined ? `Gelesen: ${gelesen.text}` : gelesen.meldung || MELDUNG_LEER;
}

export const eingabeHinweis =
  "Schreib den Term mit n, zum Beispiel 3n + 1 oder 2*n + 5. Klammern und Minus sind erlaubt.";

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: Aufgabe, antwort: string, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

export function solution(aufgabe: Aufgabe): string {
  return aufgabe.loesung;
}

/** Ein typischer Fehlterm der Aufgabe. */
export function wrong(aufgabe: Aufgabe): string {
  return aufgabe.fehler[0]?.kandidat ?? `${aufgabe.loesung}+1`;
}

/** Die Aufgabe, wie das Kind sie liest, mit {Aufgabe}. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Aufgabe} Das Kind tippt einen Term mit n (zum Beispiel 3n+1); jeder Term, der für jedes n dasselbe ergibt, zählt.";

/** Was eine Aufgabe festlegt: ihr Text. */
export const params = (aufgabe: Aufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Aufgabe: aufgabe.text,
});

/** Eine Antwort als Text: der Term, wie die Übung ihn gelesen hat (3n + 1), sonst wie getippt. */
export function show(antwort: string, _aufgabe?: Aufgabe, _props?: unknown, _lang?: string): string {
  const gelesen = leseTerm(antwort);
  return gelesen.fehler === undefined ? gelesen.text : antwort.trim();
}

/** Die Antwort jedes typischen Fehlers aus about.mistakes, den es bei dieser Aufgabe gibt; undefined für die anderen. */
export function mistakes(aufgabe: Aufgabe, _props?: unknown): (string | undefined)[] {
  return about.mistakes.map((_text, nr) => aufgabe.fehler.find((f) => f.nr === nr)?.kandidat);
}

export function describe(aufgabe: Aufgabe, _props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: `${aufgabe.text} Gib den Term ein.`,
    solution: [`$${aufgabe.latex}$`, ...aufgabe.schritte.map((s) => `- ${s}`)].join("\n"),
  };
}

export const about = {
  task: "Du stellst einen Term mit n auf: bei einer Kette aus Vielecken aus Streichhölzern für die Zahl der Hölzer bei n Vielecken, bei einem Fahrradverleih für den Preis bei n Stunden.",
  answer:
    "Ein Term mit n, getippt zum Beispiel als 3n+1 oder 3*n+1; dann „Prüfen“ unter der Aufgabe. Unter dem Feld steht, wie die Übung den Term gelesen hat; nach einer falschen Antwort gibt es „Lösung zeigen“.",
  correct:
    "Jeder Term, der für jedes n dasselbe ergibt wie der richtige, auch wenn er anders aufgebaut ist: 3n + 1 und 4 + 3 · (n − 1) zählen beide. Die Reihenfolge der Glieder ist egal.",
  mistakes: [
    "Kette: für jedes Vieleck alle Hölzer gezählt (Ecken · n), obwohl Nachbarn eine Seite teilen.",
    "Kette: das einzelne Holz zu Beginn vergessen (nur (Ecken − 1) · n).",
    "n addiert statt mit der Zahl malgenommen (n + Zahl, oder alles addiert).",
    "Preis: Grundgebühr und Preis je Stunde vertauscht.",
    "Preis: die Grundgebühr mit n malgenommen, obwohl sie nur einmal anfällt.",
    "Preis: die Grundgebühr vergessen.",
  ],
};
