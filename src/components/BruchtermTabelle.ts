// Die Logik der Tabelle für Bruchterme (BruchtermTabelle.vue, Kapitel bruchterme): zum Bruchterm (a · x + b) : (c · x + d)
// trägt man ganze Zahlen für x ein; die Tabelle setzt ein, rechnet aus und schreibt bei Nenner 0 „nicht definiert“.
// Ein Werkzeug zum Ausprobieren, keine Aufgabe: Geprüft wird nichts, die Aufgaben stehen auf der Seite.
import { leseZahl, zahlText } from "./RaetselTabelle.ts";

export interface Bruchterm {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Ein Ergebnis als gekürzter Bruch; ist q gleich 1, ist es eine ganze Zahl. */
export interface Wert {
  p: number;
  q: number;
}

export interface Zeile {
  x: number;
  /** Zähler und Nenner mit eingesetztem x, als Rechnung geschrieben, z. B. „2 · 3 + 1“. */
  zaehlerText: string;
  nennerText: string;
  nenner: number;
  /** Der Wert, oder undefined, wenn der Nenner 0 ist. */
  wert: Wert | undefined;
}

/** Höchstens so viele Zeilen hat die Tabelle; danach beginnt man mit „Neu anfangen“. */
export const MAX_ZEILEN = 12;

const MINUS = "−";

export function ggt(m: number, n: number): number {
  let x = Math.abs(m);
  let y = Math.abs(n);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Der Bruch p : q gekürzt, das Vorzeichen im Zähler. q darf nicht 0 sein. */
export function kuerzeBruch(p: number, q: number): Wert {
  const t = ggt(p, q) || 1;
  const vz = q < 0 ? -1 : 1;
  return { p: (vz * p) / t, q: (vz * q) / t };
}

/** Der Term a · x + b als Text mit x: „x − 2“, „2x + 1“, „−x“, „12“. */
export function linText(a: number, b: number): string {
  if (a === 0) return b < 0 ? `${MINUS}${Math.abs(b)}` : String(b);
  const rest = b === 0 ? "" : ` ${b < 0 ? MINUS : "+"} ${Math.abs(b)}`;
  const mal = Math.abs(a) === 1 ? "x" : `${Math.abs(a)}x`;
  return `${a < 0 ? MINUS : ""}${mal}${rest}`;
}

/** a · x + b mit eingesetztem x als Rechnung: für x = 3 und 2x + 1 „2 · 3 + 1“, für x = −3 „2 · (−3) + 1“. */
export function einsetzenText(a: number, b: number, x: number): string {
  if (a === 0) return b < 0 ? `${MINUS}${Math.abs(b)}` : String(b);
  const rest = b === 0 ? "" : ` ${b < 0 ? MINUS : "+"} ${Math.abs(b)}`;
  const klammer = x < 0 ? `(${zahlText(x)})` : zahlText(x);
  if (a === 1) return `${zahlText(x)}${rest}`;
  if (a === -1) return `${MINUS}${klammer}${rest}`;
  return `${zahlText(a)} · ${klammer}${rest}`;
}

/** Setzt x ein: Zähler, Nenner und, wenn der Nenner nicht 0 ist, der gekürzte Wert. */
export function probiere(t: Bruchterm, x: number): Zeile {
  const zaehler = t.a * x + t.b;
  const nenner = t.c * x + t.d;
  return {
    x,
    zaehlerText: einsetzenText(t.a, t.b, x),
    nennerText: einsetzenText(t.c, t.d, x),
    nenner,
    wert: nenner === 0 ? undefined : kuerzeBruch(zaehler, nenner),
  };
}

/** Die Startzeilen der Tabelle für die Werte xs. */
export function startZeilen(t: Bruchterm, xs: number[]): Zeile[] {
  return xs.slice(0, MAX_ZEILEN).map((x) => probiere(t, x));
}

/** Der Tipp zur letzten Zeile, in Worten (die Farbe allein sagt nichts). */
export function hinweis(zeilen: Zeile[]): string {
  const letzte = zeilen[zeilen.length - 1];
  if (letzte === undefined) return "Trag eine ganze Zahl für x ein.";
  if (letzte.nenner === 0)
    return `Für x = ${zahlText(letzte.x)} wird der Nenner 0. Durch 0 kannst du nicht teilen: Der Bruchterm ist nicht definiert.`;
  return `Für x = ${zahlText(letzte.x)} ist der Nenner ${zahlText(letzte.nenner)}, nicht 0. Der Bruchterm hat einen Wert.`;
}

/** Trägt eine Eingabe ein: eine neue Zeile hinten, oder eine Meldung, warum nicht. */
export function trageEin(t: Bruchterm, zeilen: Zeile[], eingabe: string): { zeilen: Zeile[]; meldung: string } {
  const x = leseZahl(eingabe);
  if (x === undefined || !Number.isInteger(x))
    return { zeilen, meldung: "Schreib eine ganze Zahl, zum Beispiel 4 oder −2." };
  if (zeilen.length >= MAX_ZEILEN)
    return { zeilen, meldung: "Die Tabelle ist voll. Fang mit „Neu anfangen“ von vorn an." };
  return { zeilen: [...zeilen, probiere(t, x)], meldung: "" };
}

export interface Zeichen {
  art: "mi" | "mn" | "mo";
  t: string;
}

/** Zerlegt einen Text wie „2 · (−3) + 1“ in Zeichen für MathML: x ist ein Buchstabe, Ziffern eine Zahl, der Rest Operatoren. */
export function zeichen(text: string): Zeichen[] {
  const teile = text.match(/x|\d+|[^\sx\d]/g) ?? [];
  return teile.map((t): Zeichen =>
    t === "x" ? { art: "mi", t } : /^\d/.test(t) ? { art: "mn", t } : { art: "mo", t },
  );
}
