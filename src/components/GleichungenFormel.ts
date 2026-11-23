// Die Logik der Übung GleichungenFormel.vue: eine Formel nach einer Größe umstellen. Das Kind tippt die rechte Seite
// der umgestellten Formel (oder "a = …"). Geprüft wird nicht der Wortlaut, sondern die Gleichwertigkeit an festen
// Werten (BinomTerm.sindGleichwertig): jede richtige Schreibweise zählt. Typische Fehler (nur ein Glied geteilt,
// Vorzeichen, mal statt geteilt, ein Schritt vergessen, Zähler und Nenner vertauscht) haben ihre eigene Meldung.
// Parser und Gleichwertigkeit stammen aus dem Kapitel binom (BinomParser.ts, BinomTerm.ts), der Zufall aus
// Zufallszahlen.ts. Der Parser kennt nur kleine Buchstaben: Großbuchstaben der Formel (U, A, F) tauschen wir vor dem
// Lesen gegen einen freien kleinen Buchstaben und zeigen sie danach wieder als Großbuchstaben.
import { leseTerm } from "./BinomParser.ts";
import { erzeugeZufall, sindGleichwertig } from "./BinomTerm.ts";

export type Art = "einfach" | "zwei" | "schwer";

export interface Fehler {
  /** Nummer des Fehlertyps in about.mistakes. */
  nr: number;
  /** Eine falsche rechte Seite, die so aus dem Fehler entsteht. */
  kandidat: string;
  meldung: string;
}

/** Eine Rechnung: Text vorn, dann die Rechnung (Unicode wie "U − 2b = 2a"). */
export type Schritt = [text: string, rechnung: string];

export interface FormelAufgabe {
  art: Art;
  /** Die Aufgabe als Satz, mit der Formel im Alltag. */
  frage: string;
  /** Die Formel, wie sie dasteht: "U = 2a + 2b". */
  formel: string;
  /** Die gesuchte Größe: "a". */
  ziel: string;
  /** Die rechte Seite der richtigen Lösung in Eingabeform: "(U-2b)/2". */
  loesung: string;
  /** Die umgestellte Formel zum Lesen: "a = (U − 2b) : 2". */
  ergebnis: string;
  schritte: Schritt[];
  fehler: Fehler[];
  /** Der Auftrag: "Stelle U = 2a + 2b nach a um." */
  auftrag: string;
  /** Der Tipp: eine Frage, kein Ergebnis. */
  tipp: string;
}

type Eintrag = Omit<FormelAufgabe, "art" | "auftrag" | "tipp">;

const MAL_GETEILT =
  "Du hast mal und geteilt verwechselt. Das Gegenteil von mal ist geteilt, das Gegenteil von geteilt ist mal.";

const EINFACH: Eintrag[] = [
  {
    frage: "Die Gewichtskraft F eines Körpers mit der Masse m ist F = m · g.",
    formel: "F = m · g",
    ziel: "m",
    loesung: "F/g",
    ergebnis: "m = F : g",
    schritte: [
      ["Die Formel: ", "F = m · g"],
      ["m wird mit g multipliziert, also teilst du beide Seiten durch g: ", "F : g = m · g : g"],
      ["Rechts kürzt sich g: ", "m = F : g"],
    ],
    fehler: [
      { nr: 2, kandidat: "F*g", meldung: MAL_GETEILT },
      { nr: 4, kandidat: "g/F", meldung: "Zähler und Nenner sind vertauscht: Du suchst m, also steht F im Zähler." },
    ],
  },
  {
    frage: "Die Gewichtskraft F eines Körpers mit der Masse m ist F = m · g.",
    formel: "F = m · g",
    ziel: "g",
    loesung: "F/m",
    ergebnis: "g = F : m",
    schritte: [
      ["Die Formel: ", "F = m · g"],
      ["g wird mit m multipliziert, also teilst du beide Seiten durch m: ", "F : m = m · g : m"],
      ["Rechts kürzt sich m: ", "g = F : m"],
    ],
    fehler: [
      { nr: 2, kandidat: "F*m", meldung: MAL_GETEILT },
      { nr: 4, kandidat: "m/F", meldung: "Zähler und Nenner sind vertauscht: Du suchst g, also steht F im Zähler." },
    ],
  },
  {
    frage: "Die Geschwindigkeit v ist der Weg s geteilt durch die Zeit t: v = s : t.",
    formel: "v = s : t",
    ziel: "s",
    loesung: "v*t",
    ergebnis: "s = v · t",
    schritte: [
      ["Die Formel: ", "v = s : t"],
      ["s wird durch t geteilt, also multiplizierst du beide Seiten mit t: ", "v · t = s : t · t"],
      ["Rechts kürzt sich t: ", "s = v · t"],
    ],
    fehler: [
      { nr: 2, kandidat: "v/t", meldung: MAL_GETEILT },
      { nr: 2, kandidat: "v-t", meldung: "Das Gegenteil von „geteilt durch t“ ist „mal t“, nicht „minus t“." },
    ],
  },
  {
    frage: "Die Geschwindigkeit v ist der Weg s geteilt durch die Zeit t: v = s : t.",
    formel: "v = s : t",
    ziel: "t",
    loesung: "s/v",
    ergebnis: "t = s : v",
    schritte: [
      ["Die Formel: ", "v = s : t"],
      ["Beide Seiten mal t, damit t aus dem Nenner kommt: ", "v · t = s"],
      ["Beide Seiten durch v: ", "t = s : v"],
    ],
    fehler: [
      { nr: 4, kandidat: "v/s", meldung: "Zähler und Nenner sind vertauscht: Du suchst t, also steht s im Zähler." },
      { nr: 2, kandidat: "s*v", meldung: MAL_GETEILT },
    ],
  },
  {
    frage: "Die Fläche eines Rechtecks mit den Seiten a und b ist A = a · b.",
    formel: "A = a · b",
    ziel: "a",
    loesung: "A/b",
    ergebnis: "a = A : b",
    schritte: [
      ["Die Formel: ", "A = a · b"],
      ["a wird mit b multipliziert, also teilst du beide Seiten durch b: ", "A : b = a · b : b"],
      ["Rechts kürzt sich b: ", "a = A : b"],
    ],
    fehler: [
      { nr: 2, kandidat: "A*b", meldung: MAL_GETEILT },
      { nr: 4, kandidat: "b/A", meldung: "Zähler und Nenner sind vertauscht: Du suchst a, also steht A im Zähler." },
    ],
  },
  {
    frage: "Die Fläche eines Rechtecks mit den Seiten a und b ist A = a · b.",
    formel: "A = a · b",
    ziel: "b",
    loesung: "A/a",
    ergebnis: "b = A : a",
    schritte: [
      ["Die Formel: ", "A = a · b"],
      ["b wird mit a multipliziert, also teilst du beide Seiten durch a: ", "A : a = a · b : a"],
      ["Rechts kürzt sich a: ", "b = A : a"],
    ],
    fehler: [
      { nr: 2, kandidat: "A*a", meldung: MAL_GETEILT },
      { nr: 4, kandidat: "a/A", meldung: "Zähler und Nenner sind vertauscht: Du suchst b, also steht A im Zähler." },
    ],
  },
];

const ZWEI: Eintrag[] = [
  {
    frage: "Der Umfang U eines Rechtecks mit den Seiten a und b ist U = 2a + 2b.",
    formel: "U = 2a + 2b",
    ziel: "a",
    loesung: "(U-2b)/2",
    ergebnis: "a = (U − 2b) : 2",
    schritte: [
      ["Die Formel: ", "U = 2a + 2b"],
      ["Beide Seiten minus 2b, damit 2a allein steht: ", "U − 2b = 2a"],
      ["Beide Seiten durch 2, die ganze Seite: ", "(U − 2b) : 2 = a"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "U-2b/2",
        meldung:
          "Du hast nur 2b durch 2 geteilt. Beim Teilen musst du die ganze Seite teilen, also U − 2b zusammen, mit Klammer.",
      },
      {
        nr: 1,
        kandidat: "(U+2b)/2",
        meldung: "Das Vorzeichen stimmt nicht: In der Formel steht + 2b, das Gegenteil davon ist − 2b.",
      },
      { nr: 2, kandidat: "2*(U-2b)", meldung: MAL_GETEILT },
      {
        nr: 3,
        kandidat: "U-2b",
        meldung: "Du hast 2b abgezogen, aber noch nicht durch 2 geteilt: Es steht noch 2a da.",
      },
    ],
  },
  {
    frage: "Der Umfang U eines Rechtecks mit den Seiten a und b ist U = 2a + 2b.",
    formel: "U = 2a + 2b",
    ziel: "b",
    loesung: "(U-2a)/2",
    ergebnis: "b = (U − 2a) : 2",
    schritte: [
      ["Die Formel: ", "U = 2a + 2b"],
      ["Beide Seiten minus 2a, damit 2b allein steht: ", "U − 2a = 2b"],
      ["Beide Seiten durch 2, die ganze Seite: ", "(U − 2a) : 2 = b"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "U-2a/2",
        meldung:
          "Du hast nur 2a durch 2 geteilt. Beim Teilen musst du die ganze Seite teilen, also U − 2a zusammen, mit Klammer.",
      },
      {
        nr: 1,
        kandidat: "(U+2a)/2",
        meldung: "Das Vorzeichen stimmt nicht: In der Formel steht + 2a, das Gegenteil davon ist − 2a.",
      },
      { nr: 2, kandidat: "2*(U-2a)", meldung: MAL_GETEILT },
      {
        nr: 3,
        kandidat: "U-2a",
        meldung: "Du hast 2a abgezogen, aber noch nicht durch 2 geteilt: Es steht noch 2b da.",
      },
    ],
  },
  {
    frage: "Die Fläche A eines Dreiecks mit der Grundseite g und der Höhe h ist A = g · h : 2.",
    formel: "A = g · h : 2",
    ziel: "h",
    loesung: "2*A/g",
    ergebnis: "h = 2 · A : g",
    schritte: [
      ["Die Formel: ", "A = g · h : 2"],
      ["Beide Seiten mal 2, damit der Nenner weg ist: ", "2 · A = g · h"],
      ["Beide Seiten durch g: ", "h = 2 · A : g"],
    ],
    fehler: [
      {
        nr: 2,
        kandidat: "A/(2*g)",
        meldung: "Du hast durch 2 geteilt. In der Formel wird aber durch 2 geteilt, das Gegenteil ist mal 2.",
      },
      {
        nr: 3,
        kandidat: "A/g",
        meldung: "Du hast durch g geteilt, aber das : 2 der Formel nicht rückgängig gemacht (mal 2).",
      },
    ],
  },
  {
    frage: "Die Fläche A eines Dreiecks mit der Grundseite g und der Höhe h ist A = g · h : 2.",
    formel: "A = g · h : 2",
    ziel: "g",
    loesung: "2*A/h",
    ergebnis: "g = 2 · A : h",
    schritte: [
      ["Die Formel: ", "A = g · h : 2"],
      ["Beide Seiten mal 2, damit der Nenner weg ist: ", "2 · A = g · h"],
      ["Beide Seiten durch h: ", "g = 2 · A : h"],
    ],
    fehler: [
      {
        nr: 2,
        kandidat: "A/(2*h)",
        meldung: "Du hast durch 2 geteilt. In der Formel wird aber durch 2 geteilt, das Gegenteil ist mal 2.",
      },
      {
        nr: 3,
        kandidat: "A/h",
        meldung: "Du hast durch h geteilt, aber das : 2 der Formel nicht rückgängig gemacht (mal 2).",
      },
    ],
  },
];

const SCHWER: Eintrag[] = [
  {
    frage: "Die Fläche A eines Trapezes mit den parallelen Seiten a und c und der Höhe h ist A = (a + c) · h : 2.",
    formel: "A = (a + c) · h : 2",
    ziel: "h",
    loesung: "2*A/(a+c)",
    ergebnis: "h = 2 · A : (a + c)",
    schritte: [
      ["Die Formel: ", "A = (a + c) · h : 2"],
      ["Beide Seiten mal 2: ", "2 · A = (a + c) · h"],
      ["Beide Seiten durch die ganze Klammer (a + c): ", "h = 2 · A : (a + c)"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "2*A/a+c",
        meldung: "Du hast nur durch a geteilt. Die Klammer (a + c) ist ein Faktor: Teile durch die ganze Klammer.",
      },
      {
        nr: 2,
        kandidat: "A/(2*(a+c))",
        meldung: "Du hast durch 2 geteilt. In der Formel wird aber durch 2 geteilt, das Gegenteil ist mal 2.",
      },
      {
        nr: 3,
        kandidat: "A/(a+c)",
        meldung: "Das : 2 der Formel ist noch nicht rückgängig gemacht: Du brauchst noch mal 2.",
      },
    ],
  },
  {
    frage: "Die Fläche A eines Trapezes mit den parallelen Seiten a und c und der Höhe h ist A = (a + c) · h : 2.",
    formel: "A = (a + c) · h : 2",
    ziel: "a",
    loesung: "2*A/h-c",
    ergebnis: "a = 2 · A : h − c",
    schritte: [
      ["Die Formel: ", "A = (a + c) · h : 2"],
      ["Beide Seiten mal 2 und durch h: ", "2 · A : h = a + c"],
      ["Beide Seiten minus c: ", "a = 2 · A : h − c"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "(2*A-c)/h",
        meldung:
          "Du hast c zu früh abgezogen. Erst mal 2 und durch h rechnen, dann steht a + c allein, und dann minus c.",
      },
      {
        nr: 1,
        kandidat: "2*A/h+c",
        meldung: "Das Vorzeichen stimmt nicht: In der Klammer steht a + c, das Gegenteil von + c ist − c.",
      },
      {
        nr: 2,
        kandidat: "A/(2*h)-c",
        meldung: "Du hast durch 2 geteilt. In der Formel wird aber durch 2 geteilt, das Gegenteil ist mal 2.",
      },
      { nr: 3, kandidat: "2*A/h", meldung: "Du hast mal 2 und durch h gerechnet, aber c noch nicht abgezogen." },
    ],
  },
  {
    frage: "Die Fläche A eines Trapezes mit den parallelen Seiten a und c und der Höhe h ist A = (a + c) · h : 2.",
    formel: "A = (a + c) · h : 2",
    ziel: "c",
    loesung: "2*A/h-a",
    ergebnis: "c = 2 · A : h − a",
    schritte: [
      ["Die Formel: ", "A = (a + c) · h : 2"],
      ["Beide Seiten mal 2 und durch h: ", "2 · A : h = a + c"],
      ["Beide Seiten minus a: ", "c = 2 · A : h − a"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "(2*A-a)/h",
        meldung:
          "Du hast a zu früh abgezogen. Erst mal 2 und durch h rechnen, dann steht a + c allein, und dann minus a.",
      },
      {
        nr: 1,
        kandidat: "2*A/h+a",
        meldung: "Das Vorzeichen stimmt nicht: In der Klammer steht a + c, das Gegenteil von + a ist − a.",
      },
      {
        nr: 2,
        kandidat: "A/(2*h)-a",
        meldung: "Du hast durch 2 geteilt. In der Formel wird aber durch 2 geteilt, das Gegenteil ist mal 2.",
      },
      { nr: 3, kandidat: "2*A/h", meldung: "Du hast mal 2 und durch h gerechnet, aber a noch nicht abgezogen." },
    ],
  },
  {
    frage: "Eine Gerade hat die Gleichung y = m · x + n.",
    formel: "y = m · x + n",
    ziel: "x",
    loesung: "(y-n)/m",
    ergebnis: "x = (y − n) : m",
    schritte: [
      ["Die Formel: ", "y = m · x + n"],
      ["Beide Seiten minus n, damit m · x allein steht: ", "y − n = m · x"],
      ["Beide Seiten durch m, die ganze Seite: ", "(y − n) : m = x"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "y-n/m",
        meldung: "Du hast nur n durch m geteilt. Teile die ganze Seite y − n durch m, mit Klammer.",
      },
      {
        nr: 1,
        kandidat: "(y+n)/m",
        meldung: "Das Vorzeichen stimmt nicht: In der Formel steht + n, das Gegenteil davon ist − n.",
      },
      { nr: 2, kandidat: "m*(y-n)", meldung: MAL_GETEILT },
      {
        nr: 3,
        kandidat: "y-n",
        meldung: "Du hast n abgezogen, aber noch nicht durch m geteilt: Es steht noch m · x da.",
      },
    ],
  },
  {
    frage: "Eine Gerade hat die Gleichung y = m · x + n.",
    formel: "y = m · x + n",
    ziel: "m",
    loesung: "(y-n)/x",
    ergebnis: "m = (y − n) : x",
    schritte: [
      ["Die Formel: ", "y = m · x + n"],
      ["Beide Seiten minus n, damit m · x allein steht: ", "y − n = m · x"],
      ["Beide Seiten durch x, die ganze Seite: ", "(y − n) : x = m"],
    ],
    fehler: [
      {
        nr: 0,
        kandidat: "y-n/x",
        meldung: "Du hast nur n durch x geteilt. Teile die ganze Seite y − n durch x, mit Klammer.",
      },
      {
        nr: 1,
        kandidat: "(y+n)/x",
        meldung: "Das Vorzeichen stimmt nicht: In der Formel steht + n, das Gegenteil davon ist − n.",
      },
      { nr: 2, kandidat: "x*(y-n)", meldung: MAL_GETEILT },
      {
        nr: 3,
        kandidat: "y-n",
        meldung: "Du hast n abgezogen, aber noch nicht durch x geteilt: Es steht noch m · x da.",
      },
    ],
  },
];

const KATALOG: Record<Art, Eintrag[]> = { einfach: EINFACH, zwei: ZWEI, schwer: SCHWER };

export interface FormelProps {
  art: Art;
}

/** Die Aufgabe zur Nummer: gleiche Nummer, gleiche Aufgabe. */
export function generate(seed: number, props: FormelProps): FormelAufgabe {
  const liste = KATALOG[props.art];
  const zufall = erzeugeZufall(seed);
  const eintrag = zufall.wahl(liste);
  return {
    art: props.art,
    ...eintrag,
    auftrag: `Stelle ${eintrag.formel} nach ${eintrag.ziel} um.`,
    tipp: `Was wurde zuletzt mit ${eintrag.ziel} gerechnet? Mach genau das rückgängig, auf beiden Seiten der Waage. Zahlen zum Probieren helfen.`,
  };
}

// --- Buchstaben: Großbuchstaben der Formel für den Parser übersetzen ------------------------------------------

const FREI = "jklopqrwzdefi";

/** Großbuchstabe der Formel → freier kleiner Buchstabe (für diese Aufgabe). */
function abbildung(aufgabe: FormelAufgabe): Record<string, string> {
  const text = `${aufgabe.formel}${aufgabe.loesung}`;
  const gross = [...new Set(text.match(/[A-Z]/g) ?? [])];
  const benutzt = new Set(text.match(/[a-z]/g) ?? []);
  const frei = FREI.split("").filter((b) => !benutzt.has(b));
  return Object.fromEntries(gross.map((g, i) => [g, frei[i] ?? g.toLowerCase()]));
}

const uebersetze = (aufgabe: FormelAufgabe, text: string): string => {
  const abb = abbildung(aufgabe);
  return text.replace(/[A-Z]/g, (g) => abb[g] ?? g);
};

const zurueck = (aufgabe: FormelAufgabe, text: string): string => {
  const abb = abbildung(aufgabe);
  const umgekehrt = Object.fromEntries(Object.entries(abb).map(([g, k]) => [k, g]));
  return text.replace(/[a-z]/g, (k) => umgekehrt[k] ?? k);
};

// --- Eingabe -------------------------------------------------------------------------------------------------

export interface Eingabe {
  /** Die rechte Seite, bereit für den Parser; undefined bei einem Formfehler. */
  rechts?: string;
  meldung?: string;
}

/** Trennt "a = …" ab: erlaubt ist nur die gesuchte Größe links. */
function rechteSeite(aufgabe: FormelAufgabe, antwort: string): Eingabe {
  const teile = antwort.split("=");
  if (teile.length === 1) return { rechts: antwort };
  const links = (teile[0] ?? "").trim();
  if (teile.length > 2 || links !== aufgabe.ziel) {
    return { meldung: `Links vom Gleichheitszeichen darf nur ${aufgabe.ziel} stehen, rechts steht die Rechnung.` };
  }
  return { rechts: teile[1] ?? "" };
}

/** Der erste Buchstabe der Eingabe, der in der Formel nicht vorkommt (auch kein Alias eines Großbuchstabens). */
function unbekannt(aufgabe: FormelAufgabe, text: string): string | undefined {
  const erlaubt = new Set(`${aufgabe.formel}${aufgabe.loesung}`.match(/[A-Za-z]/g) ?? []);
  return (text.match(/[A-Za-z]/g) ?? []).find((b) => !erlaubt.has(b));
}

const KEIN_TERM =
  "Das konnte ich nicht lesen. Schreib die rechte Seite, z. B. (U − 2b) : 2, mit Klammern, wo sie nötig sind.";

/** Die Eingabe als Term lesen; sonst eine Meldung. */
function lies(aufgabe: FormelAufgabe, antwort: string): { text: string } | { meldung: string } {
  const eingabe = rechteSeite(aufgabe, antwort);
  if (eingabe.rechts === undefined) return { meldung: eingabe.meldung ?? KEIN_TERM };
  const fremd = unbekannt(aufgabe, eingabe.rechts);
  if (fremd) return { meldung: `Den Buchstaben ${fremd} gibt es in dieser Formel nicht.` };
  const gelesen = leseTerm(uebersetze(aufgabe, eingabe.rechts));
  if (gelesen.fehler !== undefined) return { meldung: gelesen.meldung || KEIN_TERM };
  return { text: uebersetze(aufgabe, eingabe.rechts) };
}

const enthaelt = (aufgabe: FormelAufgabe, text: string): boolean => {
  const term = leseTerm(uebersetze(aufgabe, text));
  return term.fehler === undefined && term.variablen.includes(aufgabe.ziel);
};

const passt = (aufgabe: FormelAufgabe, antwort: string, kandidat: string): boolean =>
  sindGleichwertig(uebersetze(aufgabe, antwort), uebersetze(aufgabe, kandidat));

/** Die Antwort aus dem Feld; undefined, solange es leer ist. */
export const antwortAus = (getippt: string): string | undefined => (getippt.trim() === "" ? undefined : getippt);

export function check(aufgabe: FormelAufgabe, antwort: string): boolean {
  const gelesen = lies(aufgabe, antwort);
  if ("meldung" in gelesen) return false;
  const rechts = rechteSeite(aufgabe, antwort).rechts ?? "";
  if (enthaelt(aufgabe, rechts)) return false;
  return passt(aufgabe, rechts, aufgabe.loesung);
}

/** Warum die Antwort nicht stimmt; "" bei einer richtigen. */
export function grund(aufgabe: FormelAufgabe, antwort: string): string {
  if (check(aufgabe, antwort)) return "";
  const gelesen = lies(aufgabe, antwort);
  if ("meldung" in gelesen) return gelesen.meldung;
  const rechts = rechteSeite(aufgabe, antwort).rechts ?? "";
  if (enthaelt(aufgabe, rechts)) {
    return `In deiner Antwort steht noch ${aufgabe.ziel}. Die gesuchte Größe steht links allein, rechts darf sie nicht mehr vorkommen.`;
  }
  const fehler = aufgabe.fehler.find((f) => passt(aufgabe, rechts, f.kandidat));
  return (
    fehler?.meldung ??
    "Das stimmt noch nicht. Mach die Probe: Setze für die anderen Größen kleine Zahlen ein und prüfe, ob beide Formeln dieselbe Zahl für die gesuchte Größe ergeben."
  );
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: FormelAufgabe, antwort: string, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

export const feldLabel = (aufgabe: FormelAufgabe): string => `${aufgabe.ziel} =`;

export const eingabeHinweis = (): string =>
  "Geteilt schreibst du mit :, Klammern mit ( ). Mal darfst du mit · schreiben oder weglassen, z. B. 2b.";

/** Was die Übung aus der Eingabe gelesen hat: "Gelesen: (U − 2b) : 2", eine Meldung bei Formfehlern, sonst "". */
export function vorschau(aufgabe: FormelAufgabe, antwort: string): string {
  if (antwort.trim() === "") return "";
  const gelesen = lies(aufgabe, antwort);
  if ("meldung" in gelesen) return gelesen.meldung;
  const term = leseTerm(gelesen.text);
  if (term.fehler !== undefined) return term.meldung;
  return `Gelesen: ${aufgabe.ziel} = ${zurueck(aufgabe, term.text).replace(/\//g, " : ")}`;
}

export function solution(aufgabe: FormelAufgabe): string {
  return aufgabe.loesung;
}

/** Eine typische falsche Antwort (der erste Fehlterm), die nicht zufällig richtig ist. */
export function wrong(aufgabe: FormelAufgabe): string {
  const kandidat = aufgabe.fehler.find((f) => !check(aufgabe, f.kandidat));
  return kandidat?.kandidat ?? `${aufgabe.loesung}+1`;
}

// --- Beschreibung für Tutor und Seite ohne JavaScript -----------------------------------------------------------

/** Eine Rechnung in Unicode (U − 2b : 2) als LaTeX. */
const zuLatex = (rechnung: string): string => rechnung.replace(/−/g, "-").replace(/ · /g, " \\cdot ");

export function describe(
  aufgabe: FormelAufgabe,
  _props: FormelProps,
  _lang: string,
): { task: string; solution: string } {
  return {
    task: `${aufgabe.frage} Stelle die Formel $${zuLatex(aufgabe.formel)}$ nach $${aufgabe.ziel}$ um. Schreibe die rechte Seite der umgestellten Formel.`,
    solution: [
      `$${zuLatex(aufgabe.ergebnis)}$`,
      ...aufgabe.schritte.map(([text, rechnung]) => `- ${text}$${zuLatex(rechnung)}$`),
    ].join("\n"),
  };
}

export const schrittText = ([text, rechnung]: Schritt): string => `${text}${rechnung}`;

export const about = {
  task: "Du stellst eine Formel aus Geometrie oder Physik nach einer Größe um, zum Beispiel U = 2a + 2b nach a. Dazu tust du auf beiden Seiten dieselbe Rechenoperation, wie bei der Waage mit Zahlen.",
  answer:
    "Die rechte Seite der umgestellten Formel, zum Beispiel (U − 2b) : 2, getippt mit : für geteilt und Klammern; auch a = (U − 2b) : 2 ist erlaubt. Dann „Prüfen“ unter der Aufgabe. Nach einer falschen Antwort gibt es „Lösung zeigen“.",
  correct:
    "Jede rechte Seite, die für beliebige Zahlen denselben Wert hat wie die richtige, in jeder Schreibweise (zum Beispiel 0,5 · U − b oder (U − 2b) : 2). Die gesuchte Größe darf rechts nicht mehr vorkommen.",
  mistakes: [
    "Nur ein Glied geteilt oder verrechnet: a = U − 2b : 2 statt a = (U − 2b) : 2.",
    "Vorzeichen falsch: a = (U + 2b) : 2.",
    "Mal und geteilt verwechselt: a = 2 · (U − 2b) statt a = (U − 2b) : 2.",
    "Einen Schritt vergessen: a = U − 2b, ohne durch 2 zu teilen.",
    "Zähler und Nenner vertauscht: m = g : F statt m = F : g.",
  ],
};

/** Die Aufgabe, wie das Kind sie liest, mit {Aufgabe} und {Formel}. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Aufgabe} Stelle {Formel} um. Das Kind tippt die rechte Seite der umgestellten Formel (: für geteilt, Klammern mit ( )).";

/** Was eine Aufgabe festlegt: die Aufgabe und die gesuchte Größe. */
export const params = (aufgabe: FormelAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Aufgabe: aufgabe.frage,
  Formel: `${aufgabe.formel} nach ${aufgabe.ziel}`,
});

/** Die Antwort jedes typischen Fehlers aus about.mistakes, den es bei dieser Aufgabe gibt; sonst undefined. */
export function mistakes(aufgabe: FormelAufgabe, _props?: unknown): (string | undefined)[] {
  return about.mistakes.map(
    (_text, nr) => aufgabe.fehler.filter((f) => f.nr === nr).find((f) => !check(aufgabe, f.kandidat))?.kandidat,
  );
}

/** Eine Antwort als Text, wie die Übung sie gelesen hat; sonst wie getippt. */
export function show(antwort: string, aufgabe: FormelAufgabe, _props?: unknown, _lang?: string): string {
  const gelesen = lies(aufgabe, antwort);
  if ("meldung" in gelesen) return antwort.trim();
  const term = leseTerm(gelesen.text);
  return term.fehler === undefined ? zurueck(aufgabe, term.text).replace(/\//g, " : ") : antwort.trim();
}
