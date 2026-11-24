// Die Logik der Waage (GleichungWaage.vue): eine Gleichung a · x + b = c als Waage mit Päckchen (x) und Gewichten.
// Lernende tun auf beiden Seiten dasselbe (plus, minus, teilen), bis ein Päckchen allein liegt. Die Waage ist ein
// Werkzeug zum Ausprobieren, keine Aufgabe: Geprüft wird nichts, die Aufgaben stehen auf der Seite.

export interface Stand {
  a: number;
  b: number;
  c: number;
}

export type Art = "minus" | "plus" | "geteilt";

export interface Schritt {
  art: Art;
  n: number;
  /** Der Stand nach dem Schritt. */
  stand: Stand;
  /** Die Begründung zum Rand, z. B. „auf beiden Seiten − 4“. */
  grund: string;
}

const MINUS = "−";

/** Eine ganze Zahl mit Minus U+2212. */
export const zahl = (n: number): string => String(n).replace("-", MINUS);

/** Die Gleichung als Text, z. B. „3 · x + 4 = 19“. */
export function gleichungText(s: Stand): string {
  const mal = s.a === 1 ? "x" : s.a === 0 ? "0" : `${zahl(s.a)} · x`;
  const links = s.b === 0 ? mal : `${mal} ${s.b > 0 ? "+" : MINUS} ${Math.abs(s.b)}`;
  return `${links} = ${zahl(s.c)}`;
}

/** Die Begründung zum Schritt. */
export function grundText(art: Art, n: number): string {
  if (art === "minus") return `auf beiden Seiten ${MINUS} ${n}`;
  if (art === "plus") return `auf beiden Seiten + ${n}`;
  return `beide Seiten durch ${n} teilen`;
}

/** Ist x allein, das heißt a = 1 und b = 0? */
export const geloest = (s: Stand): boolean => s.a === 1 && s.b === 0;

/** Wendet einen Schritt auf beide Seiten an; eine Meldung, wenn er nicht geht (teilen nur, wenn alles aufgeht). */
export function tue(s: Stand, art: Art, n: number): { stand?: Stand; meldung: string } {
  if (!Number.isInteger(n) || n <= 0) return { meldung: "Schreib eine ganze Zahl größer als 0, zum Beispiel 4." };
  if (art === "geteilt") {
    if (s.a % n !== 0 || s.b % n !== 0 || s.c % n !== 0) {
      return { meldung: `Das geht nicht auf: ${n} passt nicht in alle Teile der Waage. Probier eine andere Zahl.` };
    }
    return { stand: { a: s.a / n, b: s.b / n, c: s.c / n }, meldung: "" };
  }
  const d = art === "minus" ? -n : n;
  return { stand: { a: s.a, b: s.b + d, c: s.c + d }, meldung: "" };
}

/** Was gerade zu sehen ist, für Bildschirmleser und für Leser ohne Bild. */
export function beschreibung(s: Stand): string {
  const links = [
    s.a > 0 ? `${s.a} ${s.a === 1 ? "Päckchen x" : "Päckchen x"}` : "",
    s.b > 0 ? `${s.b} Gewichte zu je 1` : s.b < 0 ? `${Math.abs(s.b)} fehlende Gewichte` : "",
  ]
    .filter((t) => t !== "")
    .join(" und ");
  return `Links liegen ${links === "" ? "keine Gewichte" : links}. Rechts liegen ${zahl(s.c)} Gewichte zu je 1. Die Waage ist im Gleichgewicht.`;
}

/** Der Hinweis zum Stand. */
export function hinweis(s: Stand, schritte: Schritt[]): string {
  if (geloest(s)) return `Fertig: Ein Päckchen liegt allein. x = ${zahl(s.c)}.`;
  if (schritte.length === 0) return "Tu auf beiden Seiten dasselbe, bis ein Päckchen allein liegt.";
  if (s.a !== 1 && s.b === 0) return `Jetzt liegen nur noch Päckchen links. Teile beide Seiten durch ${s.a}.`;
  return "Tu weiter auf beiden Seiten dasselbe, bis ein Päckchen allein liegt.";
}
