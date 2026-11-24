// Die Logik der Waage mit x auf beiden Seiten (GleichungenWaage.vue, Kapitel gleichungen): eine Gleichung
// a · x + b = c · x + d als Waage mit Päckchen (x) und Gewichten auf beiden Schalen. Lernende tun auf beiden Seiten
// dasselbe (Päckchen oder Gewichte dazu oder weg, teilen), bis ein Päckchen allein liegt. Die Waage ist ein Werkzeug
// zum Ausprobieren, keine Aufgabe: Geprüft wird nichts, die Aufgaben stehen auf der Seite.
import { zahl } from "./GleichungWaage.ts";

export { zahl };

export interface Stand {
  a: number;
  b: number;
  c: number;
  d: number;
}

export type Art = "minusX" | "plusX" | "minus" | "plus" | "geteilt";

export interface Schritt {
  art: Art;
  n: number;
  /** Der Stand nach dem Schritt. */
  stand: Stand;
  /** Die Begründung zum Rand, z. B. „− 2 · x“ oder „: 3“. */
  grund: string;
}

const MINUS = "−";

/** Eine Seite als Text: k · x + r, z. B. „3 · x + 4“, „x − 2“, „−x“ oder nur „7“. */
export function seiteText(k: number, r: number): string {
  if (k === 0) return zahl(r);
  const mal = k === 1 ? "x" : k === -1 ? `${MINUS}x` : `${zahl(k)} · x`;
  if (r === 0) return mal;
  return `${mal} ${r > 0 ? "+" : MINUS} ${Math.abs(r)}`;
}

/** Die Gleichung als Text, z. B. „3 · x + 2 = x + 8“. */
export function gleichungText(s: Stand): string {
  return `${seiteText(s.a, s.b)} = ${seiteText(s.c, s.d)}`;
}

/** Die Begründung zum Rand, kurz: „− 2 · x“, „+ 4“, „: 3“. */
export function grundText(art: Art, n: number): string {
  if (art === "minusX") return n === 1 ? `${MINUS} x` : `${MINUS} ${n} · x`;
  if (art === "plusX") return n === 1 ? "+ x" : `+ ${n} · x`;
  if (art === "minus") return `${MINUS} ${n}`;
  if (art === "plus") return `+ ${n}`;
  return `: ${n}`;
}

/** Steht x allein auf einer Seite (und sonst nichts auf der Seite, auf der anderen keine Päckchen)? */
export function geloest(s: Stand): boolean {
  return (s.a === 1 && s.b === 0 && s.c === 0) || (s.c === 1 && s.d === 0 && s.a === 0);
}

/** Der Wert von x, wenn x allein steht; sonst undefined. */
export function loesung(s: Stand): number | undefined {
  if (s.a === 1 && s.b === 0 && s.c === 0) return s.d;
  if (s.c === 1 && s.d === 0 && s.a === 0) return s.b;
  return undefined;
}

/** Sind keine Päckchen mehr da, sagt die übrige Gleichung „stimmt immer“ oder „stimmt nie“. */
export function sonderfall(s: Stand): "keine" | "alle" | undefined {
  if (s.a !== 0 || s.c !== 0) return undefined;
  return s.b === s.d ? "alle" : "keine";
}

/** Wendet einen Schritt auf beide Seiten an; eine Meldung, wenn er nicht geht (teilen nur, wenn alles aufgeht). */
export function tue(s: Stand, art: Art, n: number): { stand?: Stand; meldung: string } {
  if (!Number.isInteger(n) || n <= 0) return { meldung: "Schreib eine ganze Zahl größer als 0, zum Beispiel 2." };
  if (art === "geteilt") {
    if (s.a % n !== 0 || s.b % n !== 0 || s.c % n !== 0 || s.d % n !== 0) {
      return {
        meldung: `Das geht nicht auf: ${n} passt nicht in alle Zahlen der Gleichung. Probier eine andere Zahl.`,
      };
    }
    return { stand: { a: s.a / n, b: s.b / n, c: s.c / n, d: s.d / n }, meldung: "" };
  }
  if (art === "minusX") return { stand: { ...s, a: s.a - n, c: s.c - n }, meldung: "" };
  if (art === "plusX") return { stand: { ...s, a: s.a + n, c: s.c + n }, meldung: "" };
  const d = art === "minus" ? -n : n;
  return { stand: { ...s, b: s.b + d, d: s.d + d }, meldung: "" };
}

function seitenBeschreibung(k: number, r: number): string {
  const teile = [
    k > 0 ? `${k} Päckchen x` : k < 0 ? `${Math.abs(k)} fehlende Päckchen x` : "",
    r > 0 ? `${r} Gewichte zu je 1` : r < 0 ? `${Math.abs(r)} fehlende Gewichte` : "",
  ].filter((t) => t !== "");
  return teile.length === 0 ? "nichts" : teile.join(" und ");
}

/** Was gerade zu sehen ist, für Bildschirmleser und für Leser ohne Bild. */
export function beschreibung(s: Stand): string {
  return `Links liegen ${seitenBeschreibung(s.a, s.b)}. Rechts liegen ${seitenBeschreibung(s.c, s.d)}. Die Waage ist im Gleichgewicht.`;
}

/** Der Hinweis zum Stand. */
export function hinweis(s: Stand, schritte: Schritt[]): string {
  const sf = sonderfall(s);
  if (sf === "keine")
    return `Es bleibt ${zahl(s.b)} = ${zahl(s.d)} stehen. Das stimmt für keine Zahl: Die Gleichung hat keine Lösung.`;
  if (sf === "alle")
    return `Es bleibt ${zahl(s.b)} = ${zahl(s.d)} stehen. Das stimmt für jede Zahl: Alle Zahlen sind Lösungen.`;
  const x = loesung(s);
  if (x !== undefined) return `Fertig: Ein Päckchen liegt allein. x = ${zahl(x)}.`;
  if (schritte.length === 0)
    return "Sammle zuerst die Päckchen auf einer Seite: Nimm auf beiden Seiten gleich viele weg.";
  if (s.a !== 0 && s.c !== 0) return "Auf beiden Seiten liegen noch Päckchen. Nimm auf beiden Seiten gleich viele weg.";
  const k = s.a !== 0 ? s.a : s.c;
  const r = s.a !== 0 ? s.b : s.d;
  if (k < 0) return "Auf dieser Seite fehlen Päckchen. Lege auf beiden Seiten Päckchen dazu.";
  if (r !== 0)
    return "Die Päckchen liegen auf einer Seite. Mach die Gewichte neben ihnen weg: Tu auf beiden Seiten das Gegenteil.";
  if (k !== 1) return `Jetzt liegen ${k} Päckchen auf einer Seite. Teile beide Seiten durch ${k}.`;
  return "Tu weiter auf beiden Seiten dasselbe, bis ein Päckchen allein liegt.";
}
