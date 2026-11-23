// Die Logik der Tabelle zum Probieren mit x auf beiden Seiten (GleichungenTabelle.vue, Kapitel gleichungen): zu einer
// Gleichung a · x + b = c · x + d trägt man Probierwerte für x ein; die Tabelle rechnet beide Seiten aus und sagt, ob
// links kleiner, gleich oder größer ist. Werkzeug zum Ausprobieren und zur Probe, keine Aufgabe: Geprüft wird nichts.
import { leseZahl, zahlText } from "./RaetselTabelle.ts";

export { leseZahl, zahlText };

export interface Gleichung {
  a: number;
  b: number;
  c: number;
  d: number;
}

export type Vergleich = "kleiner" | "gleich" | "groesser";

export interface Zeile {
  x: number;
  links: number;
  rechts: number;
  vergleich: Vergleich;
}

/** Höchstens so viele Zeilen hat die Tabelle; danach beginnt man mit „Neu anfangen“. */
export const MAX_ZEILEN = 12;

const MINUS = "−";

/** Eine Seite als Text: k · x + r, z. B. „3 · x + 4“, „x − 2“ oder „7“. */
export function seiteText(k: number, r: number): string {
  if (k === 0) return zahlText(r);
  const mal = k === 1 ? "x" : k === -1 ? `${MINUS}x` : `${zahlText(k)} · x`;
  if (r === 0) return mal;
  return `${mal} ${r > 0 ? "+" : MINUS} ${zahlText(Math.abs(r))}`;
}

/** Die ganze Gleichung als Text, z. B. „3 · x + 2 = x + 8“. */
export function gleichungText(g: Gleichung): string {
  return `${seiteText(g.a, g.b)} = ${seiteText(g.c, g.d)}`;
}

const rund = (z: number): number => Math.round(z * 1000) / 1000;

/** Setzt x ein und vergleicht beide Seiten. Gerechnet wird in Tausendsteln, damit 0,1 + 0,2 mit 0,3 gleich ist. */
export function probiere(g: Gleichung, x: number): Zeile {
  const links = rund(g.a * x + g.b);
  const rechts = rund(g.c * x + g.d);
  const vergleich: Vergleich = links === rechts ? "gleich" : links < rechts ? "kleiner" : "groesser";
  return { x, links, rechts, vergleich };
}

/** Der Unterschied „links minus rechts“ bei einem Versuch. */
const unterschied = (z: Zeile): number => rund(z.links - z.rechts);

/** Was der Vergleich sagt, mit Wort und Zeichen (die Farbe allein sagt nichts). */
export function vergleichText(v: Vergleich): string {
  if (v === "gleich") return "= beide Seiten gleich";
  return v === "kleiner" ? "< links ist kleiner" : "> links ist größer";
}

/** Die beiden Seiten einer Zeile in einer Zelle, z. B. „10 < 14“. */
export function seitenText(z: Zeile): string {
  const zeichen = z.vergleich === "gleich" ? "=" : z.vergleich === "kleiner" ? "<" : ">";
  return `${zahlText(z.links)} ${zeichen} ${zahlText(z.rechts)}`;
}

/** Der Tipp zum nächsten Versuch, wenn die letzte Zeile nicht stimmt; bei einem Treffer die Meldung. */
export function hinweis(g: Gleichung, zeilen: Zeile[]): string {
  const letzte = zeilen[zeilen.length - 1];
  if (letzte === undefined) return "Trag eine Zahl für x ein.";
  if (letzte.vergleich === "gleich") {
    return g.a === g.c
      ? `Für x = ${zahlText(letzte.x)} sind beide Seiten ${zahlText(letzte.rechts)}. Probier noch andere Zahlen: Gilt das immer?`
      : `Treffer: Für x = ${zahlText(letzte.x)} sind beide Seiten ${zahlText(letzte.rechts)}. Das ist die Lösung.`;
  }
  if (g.a === g.c) {
    return "Der Unterschied zwischen links und rechts bleibt bei jeder Zahl gleich. Probier noch eine andere Zahl und vergleiche.";
  }
  const davor = zeilen[zeilen.length - 2];
  if (davor === undefined)
    return "Probier eine zweite Zahl und schau, ob der Unterschied zwischen links und rechts kleiner wird.";
  if (Math.abs(unterschied(letzte)) < Math.abs(unterschied(davor))) {
    return "Der Unterschied ist kleiner geworden. Geh in dieselbe Richtung weiter.";
  }
  return "Der Unterschied ist größer geworden. Geh in die andere Richtung.";
}

/** Trägt eine Eingabe ein: eine neue Zeile hinten, oder eine Meldung, warum nicht. */
export function trageEin(g: Gleichung, zeilen: Zeile[], eingabe: string): { zeilen: Zeile[]; meldung: string } {
  const x = leseZahl(eingabe);
  if (x === undefined) return { zeilen, meldung: "Schreib eine Zahl, zum Beispiel 4 oder 2,5." };
  if (zeilen.length >= MAX_ZEILEN)
    return { zeilen, meldung: "Die Tabelle ist voll. Fang mit „Neu anfangen“ von vorn an." };
  return { zeilen: [...zeilen, probiere(g, x)], meldung: "" };
}
