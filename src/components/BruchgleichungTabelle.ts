// Die Logik der Tabelle zum Probieren bei Bruchgleichungen (BruchgleichungTabelle.vue, Kapitel bruchterme): Zu einer
// Gleichung aus Bruchtermen trägt man Zahlen für x ein; die Tabelle rechnet beide Seiten aus, genau (mit Brüchen
// aus ganzen Zahlen), und zeigt eine Lücke, wenn ein Nenner 0 wird. Ein Werkzeug zum Ausprobieren, keine Aufgabe.
//
// Ein Summand ist (za · x + zb) : (na · x + nb). Ein Summand ohne x im Nenner hat na = 0, eine ganze Zahl als Summand
// hat na = 0 und nb = 1. Eine Seite ist eine Summe solcher Summanden.

export interface Summand {
  za: number;
  zb: number;
  na: number;
  nb: number;
}

export interface Gleichung {
  links: Summand[];
  rechts: Summand[];
}

/** Ein Bruch aus ganzen Zahlen, gekürzt, der Nenner ist positiv. */
export interface Bruch {
  n: number;
  d: number;
}

export type Stand = "gleich" | "kleiner" | "groesser" | "luecke";

export interface Zeile {
  x: Bruch;
  links: Bruch | undefined;
  rechts: Bruch | undefined;
  stand: Stand;
}

/** Höchstens so viele Zeilen hat die Tabelle; danach beginnt man mit „Neu anfangen“. */
export const MAX_ZEILEN = 12;

const MINUS = "−";

function ggt(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function bruch(n: number, d = 1): Bruch {
  const g = ggt(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

function plus(a: Bruch, b: Bruch): Bruch {
  return bruch(a.n * b.d + b.n * a.d, a.d * b.d);
}

function mal(a: Bruch, b: Bruch): Bruch {
  return bruch(a.n * b.n, a.d * b.d);
}

export function gleichBruch(a: Bruch, b: Bruch): boolean {
  return a.n === b.n && a.d === b.d;
}

function kleinerBruch(a: Bruch, b: Bruch): boolean {
  return a.n * b.d < b.n * a.d;
}

/** Liest eine Zahl: ganz, mit Komma oder Punkt, oder als Bruch 3/4; Minus U+2212 oder Bindestrich. Sonst undefined. */
export function leseZahl(text: string): Bruch | undefined {
  const rein = text.trim().replaceAll(MINUS, "-").replaceAll(" ", "");
  const bruchTreffer = /^(-?\d{1,6})\/(\d{1,6})$/.exec(rein);
  if (bruchTreffer !== null) {
    const n = Number(bruchTreffer[1]);
    const d = Number(bruchTreffer[2]);
    return d === 0 ? undefined : bruch(n, d);
  }
  const dezimal = /^(-?)(\d{1,6})(?:[.,](\d{1,3}))?$/.exec(rein);
  if (dezimal === null) return undefined;
  const nachKomma = dezimal[3] ?? "";
  const nenner = 10 ** nachKomma.length;
  const zaehler = Number(`${dezimal[2]}${nachKomma}`);
  return bruch(dezimal[1] === "-" ? -zaehler : zaehler, nenner);
}

/** Eine Zahl wie im Unterricht: Komma, Minus U+2212; bei unendlichem Dezimalbruch auf drei Stellen gerundet mit „≈“. */
export function bruchText(b: Bruch): string {
  const vorzeichen = b.n < 0 ? MINUS : "";
  const n = Math.abs(b.n);
  if (b.d === 1) return `${vorzeichen}${n}`;
  let rest = b.d;
  let zweier = 0;
  let fuenfer = 0;
  while (rest % 2 === 0) {
    rest /= 2;
    zweier += 1;
  }
  while (rest % 5 === 0) {
    rest /= 5;
    fuenfer += 1;
  }
  const stellen = Math.max(zweier, fuenfer);
  const wert = n / b.d;
  if (rest === 1 && stellen <= 3) return `${vorzeichen}${wert.toFixed(stellen).replace(".", ",")}`;
  const gerundet = wert.toFixed(3).replace(".", ",");
  return `≈ ${vorzeichen}${gerundet}`;
}

function zahl(n: number): string {
  return n < 0 ? `${MINUS}${-n}` : String(n);
}

/** Ein linearer Ausdruck als Text, z. B. „x − 1“, „2 · x + 3“, „−x“, „5“. */
export function linearText(a: number, b: number): string {
  if (a === 0) return zahl(b);
  const x = a === 1 ? "x" : a === -1 ? `${MINUS}x` : `${zahl(a)} · x`;
  if (b === 0) return x;
  return `${x} ${b > 0 ? "+" : MINUS} ${Math.abs(b)}`;
}

function zaehlerText(s: Summand): string {
  const t = linearText(s.za, s.zb);
  return s.za !== 0 && s.zb !== 0 ? `(${t})` : t;
}

function nennerText(s: Summand): string {
  if (s.na === 0) return s.nb < 0 ? `(${zahl(s.nb)})` : String(s.nb);
  const t = linearText(s.na, s.nb);
  return s.nb === 0 && s.na === 1 ? t : `(${t})`;
}

/** Ein Summand als Text mit „:“ als Bruchstrich, z. B. „3 : (x − 1)“. */
export function summandText(s: Summand): string {
  if (s.na === 0 && s.nb === 1) return linearText(s.za, s.zb);
  return `${zaehlerText(s)} : ${nennerText(s)}`;
}

export function seiteText(summanden: Summand[]): string {
  return summanden
    .map((s, i) => {
      const text = summandText(s);
      if (i === 0) return text;
      return text.startsWith(MINUS) ? ` ${MINUS} ${text.slice(1)}` : ` + ${text}`;
    })
    .join("");
}

/** Die ganze Gleichung als Text, z. B. „3 : (x − 1) = 2 : (x + 1)“. */
export function gleichungText(g: Gleichung): string {
  return `${seiteText(g.links)} = ${seiteText(g.rechts)}`;
}

function mitX(a: number, b: number, x: Bruch): Bruch {
  return plus(mal(bruch(a), x), bruch(b));
}

/** Der Wert eines Summanden bei x; undefined, wenn der Nenner 0 ist. */
export function summandWert(s: Summand, x: Bruch): Bruch | undefined {
  const nenner = mitX(s.na, s.nb, x);
  if (nenner.n === 0) return undefined;
  const zaehler = mitX(s.za, s.zb, x);
  return mal(zaehler, bruch(nenner.d, nenner.n));
}

/** Der Wert einer Seite bei x; undefined, wenn ein Nenner 0 ist. */
export function seiteWert(summanden: Summand[], x: Bruch): Bruch | undefined {
  let summe = bruch(0);
  for (const s of summanden) {
    const w = summandWert(s, x);
    if (w === undefined) return undefined;
    summe = plus(summe, w);
  }
  return summe;
}

/** Die Zahlen, für die ein Nenner 0 wird: die Gleichung ist dort nicht definiert. Aufsteigend, ohne Doppelte. */
export function ausgeschlossen(g: Gleichung): Bruch[] {
  const liste: Bruch[] = [];
  for (const s of [...g.links, ...g.rechts]) {
    if (s.na === 0) continue;
    const x = bruch(-s.nb, s.na);
    if (!liste.some((y) => gleichBruch(x, y))) liste.push(x);
  }
  return liste.sort((a, b) => a.n * b.d - b.n * a.d);
}

/** Der Hinweis zur Definitionsmenge, z. B. „x ≠ 1 und x ≠ −1“; leer, wenn kein Nenner x enthält. */
export function ausgeschlossenText(g: Gleichung): string {
  return ausgeschlossen(g)
    .map((x) => `x ≠ ${bruchText(x)}`)
    .join(" und ");
}

/** Setzt x ein und vergleicht beide Seiten. */
export function probiere(g: Gleichung, x: Bruch): Zeile {
  const links = seiteWert(g.links, x);
  const rechts = seiteWert(g.rechts, x);
  if (links === undefined || rechts === undefined) return { x, links, rechts, stand: "luecke" };
  const stand: Stand = gleichBruch(links, rechts) ? "gleich" : kleinerBruch(links, rechts) ? "kleiner" : "groesser";
  return { x, links, rechts, stand };
}

/** Was der Vergleich sagt, mit Wort und Zeichen (die Farbe allein sagt nichts). */
export function standText(stand: Stand): string {
  if (stand === "gleich") return "= beide Seiten gleich";
  if (stand === "luecke") return "Lücke: nicht definiert";
  return stand === "kleiner" ? "< links ist kleiner" : "> links ist größer";
}

/** Der Tipp zur letzten Zeile. */
export function hinweis(zeilen: Zeile[]): string {
  const letzte = zeilen[zeilen.length - 1];
  if (letzte === undefined) return "Trag eine Zahl für x ein.";
  const x = bruchText(letzte.x);
  if (letzte.stand === "luecke")
    return `Für x = ${x} wird ein Nenner 0. Durch 0 teilt man nicht: Die Gleichung ist dort nicht definiert, x = ${x} kann keine Lösung sein.`;
  if (letzte.stand === "gleich")
    return `Treffer: Für x = ${x} sind beide Seiten gleich. Die Zahl gehört zur Definitionsmenge, sie ist eine Lösung.`;
  return letzte.stand === "kleiner"
    ? "Links ist kleiner als rechts. Probier eine andere Zahl."
    : "Links ist größer als rechts. Probier eine andere Zahl.";
}

/** Trägt eine Eingabe ein: eine neue Zeile hinten, oder eine Meldung, warum nicht. */
export function trageEin(g: Gleichung, zeilen: Zeile[], eingabe: string): { zeilen: Zeile[]; meldung: string } {
  const x = leseZahl(eingabe);
  if (x === undefined) return { zeilen, meldung: "Schreib eine Zahl, zum Beispiel 4, −2,5 oder 0,75." };
  if (zeilen.length >= MAX_ZEILEN)
    return { zeilen, meldung: "Die Tabelle ist voll. Fang mit „Neu anfangen“ von vorn an." };
  return { zeilen: [...zeilen, probiere(g, x)], meldung: "" };
}
