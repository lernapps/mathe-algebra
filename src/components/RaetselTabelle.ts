// Die Logik der Tabelle zum Probieren (RaetselTabelle.vue, Kapitel raetsel): zu einer Gleichung a · x + b = c trägt
// man Probierwerte für x ein; die Tabelle rechnet beide Seiten aus und sagt, ob links kleiner, gleich oder größer ist.
// Das ist ein Werkzeug zum Ausprobieren, keine Aufgabe: Geprüft wird nichts, die Aufgaben stehen auf der Seite.

export interface Gleichung {
  a: number;
  b: number;
  c: number;
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

/** Liest eine Zahl, mit Komma oder Punkt als Dezimalzeichen und mit dem Minus U+2212 oder dem Bindestrich; sonst undefined. */
export function leseZahl(text: string): number | undefined {
  const rein = text.trim().replace(MINUS, "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(rein)) return undefined;
  const zahl = Number(rein);
  return Number.isFinite(zahl) ? zahl : undefined;
}

/** Eine Zahl wie im Unterricht: Komma statt Punkt, Minus U+2212, auf höchstens drei Stellen gerundet. */
export function zahlText(zahl: number): string {
  const gerundet = Math.round(zahl * 1000) / 1000;
  return String(gerundet).replace(".", ",").replace("-", MINUS);
}

/** Die linke Seite der Gleichung als Text, z. B. „3 · x + 4“. */
export function linkeSeite(g: Gleichung): string {
  const mal = g.a === 1 ? "x" : `${zahlText(g.a)} · x`;
  if (g.b === 0) return mal;
  return `${mal} ${g.b > 0 ? "+" : MINUS} ${zahlText(Math.abs(g.b))}`;
}

/** Die ganze Gleichung als Text, z. B. „3 · x + 4 = 19“. */
export function gleichungText(g: Gleichung): string {
  return `${linkeSeite(g)} = ${zahlText(g.c)}`;
}

/** Setzt x ein und vergleicht beide Seiten. Gerechnet wird in Tausendsteln, damit 0,1 + 0,2 mit 0,3 gleich ist. */
export function probiere(g: Gleichung, x: number): Zeile {
  const links = Math.round((g.a * x + g.b) * 1000) / 1000;
  const rechts = g.c;
  const vergleich: Vergleich = links === rechts ? "gleich" : links < rechts ? "kleiner" : "groesser";
  return { x, links, rechts, vergleich };
}

/** Was der Vergleich sagt, mit Wort und Zeichen (die Farbe allein sagt nichts). */
export function vergleichText(v: Vergleich): string {
  if (v === "gleich") return "= beide Seiten gleich";
  return v === "kleiner" ? "< links ist kleiner" : "> links ist größer";
}

/** Der Tipp zum nächsten Versuch, wenn die letzte Zeile nicht stimmt; bei einem Treffer die Meldung. */
export function hinweis(zeilen: Zeile[]): string {
  const letzte = zeilen[zeilen.length - 1];
  if (letzte === undefined) return "Trag eine Zahl für x ein.";
  if (letzte.vergleich === "gleich")
    return `Treffer: Für x = ${zahlText(letzte.x)} sind beide Seiten ${zahlText(letzte.rechts)}.`;
  return letzte.vergleich === "kleiner"
    ? `Links ist noch zu klein. Probier ein größeres x als ${zahlText(letzte.x)}.`
    : `Links ist zu groß. Probier ein kleineres x als ${zahlText(letzte.x)}.`;
}

/** Trägt eine Eingabe ein: eine neue Zeile hinten, oder eine Meldung, warum nicht. */
export function trageEin(g: Gleichung, zeilen: Zeile[], eingabe: string): { zeilen: Zeile[]; meldung: string } {
  const x = leseZahl(eingabe);
  if (x === undefined) return { zeilen, meldung: "Schreib eine Zahl, zum Beispiel 4 oder 2,5." };
  if (zeilen.length >= MAX_ZEILEN)
    return { zeilen, meldung: "Die Tabelle ist voll. Fang mit „Neu anfangen“ von vorn an." };
  return { zeilen: [...zeilen, probiere(g, x)], meldung: "" };
}
