// Die Logik der Tabelle zum Vergleichen zweier Terme (TermeTabelle.vue, Kapitel terme): zu zwei Termen mit der Variablen
// n trägt die Tabelle für n = 1 bis 6 (und für weitere n, die man einträgt) beide Werte ein und sagt, wo sie
// übereinstimmen. Das ist ein Werkzeug zum Ausprobieren, keine Aufgabe: Geprüft wird nichts, die Aufgaben stehen auf
// der Seite. Terme liest BinomParser.ts, Zahlen und ihre Schreibweise RaetselTabelle.ts.
import { auswerten, leseTerm, type GelesenerTerm } from "./BinomParser.ts";
import { leseZahl, zahlText } from "./RaetselTabelle.ts";

export { leseZahl, zahlText };

export interface Zeile {
  n: number;
  /** Wert des ersten Terms; undefined, wenn er nicht zu lesen oder an dieser Stelle nicht definiert ist. */
  links: number | undefined;
  rechts: number | undefined;
  gleich: boolean;
}

/** Die Tabelle beginnt mit n = 1 bis ERSTE_ZEILEN und wächst bis MAX_ZEILEN. */
export const ERSTE_ZEILEN = 6;
export const MAX_ZEILEN = 12;
const SPIELRAUM = 1e-9;

/** Liest einen Term mit höchstens der Variablen n; sonst undefined mit der Meldung dazu. */
export function leseTermN(text: string): { term: GelesenerTerm; meldung: string } {
  const term = leseTerm(text);
  if (term.fehler !== undefined) {
    return { term, meldung: term.meldung !== "" ? term.meldung : "Schreib einen Term mit n, zum Beispiel 3n + 1." };
  }
  const fremd = term.variablen.filter((v) => v !== "n");
  if (fremd.length > 0) {
    return { term, meldung: `Schreib die Zahl der Figuren als n, nicht als ${fremd.join(", ")}.` };
  }
  return { term, meldung: "" };
}

/** Der Wert des Terms für n; undefined, wenn der Term nicht lesbar ist oder an dieser Stelle keinen Wert hat. */
export function wert(term: GelesenerTerm, n: number): number | undefined {
  if (term.fehler !== undefined) return undefined;
  const w = auswerten(term.baum, { n });
  return Number.isFinite(w) ? Math.round(w * 1e6) / 1e6 : undefined;
}

const nahe = (a: number, b: number): boolean => Math.abs(a - b) <= SPIELRAUM * Math.max(1, Math.abs(a), Math.abs(b));

/** Eine Zeile der Tabelle: beide Werte für n und ob sie gleich sind. Gleich ist nur, wo beide einen Wert haben. */
export function zeile(links: GelesenerTerm, rechts: GelesenerTerm, n: number): Zeile {
  const a = wert(links, n);
  const b = wert(rechts, n);
  return { n, links: a, rechts: b, gleich: a !== undefined && b !== undefined && nahe(a, b) };
}

/** Die ersten Zeilen n = 1 bis ERSTE_ZEILEN. */
export function startZeilen(links: GelesenerTerm, rechts: GelesenerTerm): Zeile[] {
  return Array.from({ length: ERSTE_ZEILEN }, (_, i) => zeile(links, rechts, i + 1));
}

export type Eintrag = { zeilen: Zeile[]; meldung: string };

/** Trägt ein weiteres n ein: eine neue Zeile hinten, oder eine Meldung, warum nicht. Ein n in der Tabelle steht nur einmal. */
export function trageEin(links: GelesenerTerm, rechts: GelesenerTerm, zeilen: Zeile[], eingabe: string): Eintrag {
  const n = leseZahl(eingabe);
  if (n === undefined) return { zeilen, meldung: "Schreib eine Zahl für n, zum Beispiel 10 oder 2,5." };
  if (zeilen.some((z) => z.n === n)) return { zeilen, meldung: `n = ${zahlText(n)} steht schon in der Tabelle.` };
  if (zeilen.length >= MAX_ZEILEN)
    return { zeilen, meldung: "Die Tabelle ist voll. Mit „Zurücksetzen“ fängst du neu an." };
  return { zeilen: [...zeilen, zeile(links, rechts, n)], meldung: "" };
}

const aufzaehlung = (liste: number[]): string => liste.map(zahlText).join(", ");

/** Was die Tabelle über die beiden Terme sagt, mit Wort (nicht nur Farbe): gleich in allen Zeilen, oder wo nicht. */
export function urteil(zeilen: Zeile[], hatFehler: boolean): string {
  if (hatFehler) return "Trag zwei Terme mit n ein, dann siehst du die Werte.";
  const gleich = zeilen.filter((z) => z.gleich).map((z) => z.n);
  const anders = zeilen.filter((z) => !z.gleich).map((z) => z.n);
  if (anders.length === 0) {
    return `In allen ${zeilen.length} Zeilen sind beide Werte gleich. Das spricht dafür, dass die Terme für jedes n gleich sind. Ganz sicher bist du erst, wenn du sie umformst.`;
  }
  if (gleich.length === 0) {
    return `In keiner Zeile sind die Werte gleich: Die Terme sind nicht gleich.`;
  }
  return `Gleich bei n = ${aufzaehlung(gleich)}, verschieden bei n = ${aufzaehlung(anders)}. Zwei Terme sind nur gleich, wenn sie in jeder Zeile gleich sind: Diese beiden sind es nicht.`;
}

/** Die Zelle eines Werts: die Zahl, ein Fragezeichen ohne Wert. */
export const zelle = (w: number | undefined): string => (w === undefined ? "?" : zahlText(w));

/** Die Zelle des zweiten Terms: der Wert mit dem Zeichen = (gleich wie links) oder ≠ (verschieden); die Farbe allein sagt nichts. */
export const zelleRechts = (z: Zeile): string => `${zelle(z.rechts)} ${z.gleich ? "=" : "≠"}`;

/** Das Wort zum Zeichen, für Screenreader. */
export const zeichenWort = (z: Zeile): string => (z.gleich ? "gleich" : "verschieden");
