// Die Logik der Zahlengerade für Ungleichungen (GleichungenGerade.vue, Kapitel gleichungen): aus Grenzzahl und Zeichen
// (<, ≤, >, ≥) entsteht die Lösungsmenge als Strahl mit offenem oder gefülltem Punkt. Der Rand steht zusätzlich als Text
// („ohne die 3“, „mit der 3“), die Farbe allein sagt nichts. Die Zeichnung (Zeichnung) zeichnen die Komponente und das
// Skript für die statischen Bilder gleich. Ein Werkzeug zum Ausprobieren, keine Aufgabe: Geprüft wird nichts.

export type Zeichen = "<" | "≤" | ">" | "≥";

export interface Marke {
  x: number;
  text: string;
  /** Die Null, fett gezeichnet. */
  null: boolean;
}

export interface Zeichnung {
  breite: number;
  hoehe: number;
  label: string;
  achseY: number;
  achseVon: number;
  achseBis: number;
  marken: Marke[];
  strahl: { von: number; bis: number; richtung: "links" | "rechts" };
  punkt: { x: number; gefuellt: boolean };
  /** „ohne die 3“ oder „mit der 3“ über dem Punkt. */
  randText: { x: number; anker: "start" | "middle" | "end"; text: string };
  /** „x > 3“ über dem Strahl; fehlt, wenn das Bild die Ungleichung erst finden lassen soll. */
  mengeText?: { x: number; text: string };
  probe?: { x: number; gilt: boolean; text: string };
}

const MINUS = "−";
const BREITE = 360;
const RAND = 24;
const MAX_MARKEN = 12;
const SCHRITTE = [1, 2, 5, 10, 20, 50, 100];

/** Eine ganze oder gebrochene Zahl wie im Unterricht: Komma, Minus U+2212, höchstens drei Stellen. */
export function zahlText(n: number): string {
  return String(Math.round(n * 1000) / 1000)
    .replace(".", ",")
    .replace("-", MINUS);
}

/** Liest eine Zahl, mit Komma oder Punkt, Minus U+2212 oder Bindestrich; sonst undefined. */
export function leseZahl(text: string): number | undefined {
  const rein = text.trim().replace(MINUS, "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(rein)) return undefined;
  const zahl = Number(rein);
  return Number.isFinite(zahl) ? zahl : undefined;
}

/** Gehört die Grenzzahl selbst dazu (≤ und ≥)? */
export const mitGrenze = (zeichen: Zeichen): boolean => zeichen === "≤" || zeichen === "≥";

/** Zeigt der Strahl nach rechts (> und ≥)? */
export const nachRechts = (zeichen: Zeichen): boolean => zeichen === ">" || zeichen === "≥";

/** Die Ungleichung als Text, z. B. „x ≥ −2“. */
export const mengeText = (zeichen: Zeichen, grenze: number): string => `x ${zeichen} ${zahlText(grenze)}`;

/** Der Rand als Text: „ohne die 3“ oder „mit der −2“. */
export const randText = (zeichen: Zeichen, grenze: number): string =>
  `${mitGrenze(zeichen) ? "mit der" : "ohne die"} ${zahlText(grenze)}`;

/** Erfüllt x die Ungleichung x Zeichen Grenze? */
export function gilt(zeichen: Zeichen, grenze: number, x: number): boolean {
  if (zeichen === "<") return x < grenze;
  if (zeichen === "≤") return x <= grenze;
  if (zeichen === ">") return x > grenze;
  return x >= grenze;
}

/** Der sichtbare Ausschnitt: ganze Zahlen von bis, mit Schritt; Null und Grenzzahl liegen darin mit etwas Platz. */
export function skala(grenze: number): { von: number; bis: number; schritt: number } {
  const roh = [Math.min(0, grenze) - 3, Math.max(0, grenze) + 3] as const;
  const schritt = SCHRITTE.find((s) => (roh[1] - roh[0]) / s <= MAX_MARKEN) ?? 100;
  return { von: Math.floor(roh[0] / schritt) * schritt, bis: Math.ceil(roh[1] / schritt) * schritt, schritt };
}

/** Der Text für Bildschirmleser und für Leser ohne Bild. */
export function beschreibung(zeichen: Zeichen, grenze: number): string {
  const g = zahlText(grenze);
  const seite = nachRechts(zeichen) ? "rechts" : "links";
  const art = nachRechts(zeichen) ? "größer" : "kleiner";
  const rand = mitGrenze(zeichen)
    ? `Die ${g} gehört dazu: Der Punkt ist gefüllt.`
    : `Die ${g} gehört nicht dazu: Der Punkt ist offen.`;
  return `Zahlengerade, die Lösungsmenge ${mengeText(zeichen, grenze)}: alle Zahlen ${seite} der ${g}, also ${art} ${mitGrenze(zeichen) ? "oder gleich " : "als "}${g}. ${rand}`;
}

/** Das Bild zu Grenzzahl und Zeichen; `probe` setzt eine Marke (`platz` hält den Platz dafür frei), `menge: false` lässt die Ungleichung weg. */
export function zeichne(
  zeichen: Zeichen,
  grenze: number,
  optionen: { probe?: number; menge?: boolean; platz?: boolean } = {},
): Zeichnung {
  const s = skala(grenze);
  const hoehe = optionen.probe === undefined && optionen.platz !== true ? 100 : 124;
  const achseY = 66;
  const breiteAchse = BREITE - 2 * RAND;
  const pos = (x: number): number => RAND + ((x - s.von) / (s.bis - s.von)) * breiteAchse;
  const marken: Marke[] = [];
  for (let n = s.von; n <= s.bis; n += s.schritt) marken.push({ x: pos(n), text: zahlText(n), null: n === 0 });
  const px = pos(grenze);
  const rechts = nachRechts(zeichen);
  const anker = px < 60 ? "start" : px > BREITE - 60 ? "end" : "middle";
  const z: Zeichnung = {
    breite: BREITE,
    hoehe,
    label: beschreibung(zeichen, grenze),
    achseY,
    achseVon: RAND - 8,
    achseBis: BREITE - RAND + 8,
    marken,
    strahl: { von: px, bis: rechts ? BREITE - RAND + 8 : RAND - 8, richtung: rechts ? "rechts" : "links" },
    punkt: { x: px, gefuellt: mitGrenze(zeichen) },
    randText: { x: px, anker, text: randText(zeichen, grenze) },
  };
  if (optionen.menge !== false) {
    const mitte = rechts ? (px + BREITE - RAND) / 2 : (px + RAND) / 2;
    z.mengeText = { x: mitte, text: mengeText(zeichen, grenze) };
  }
  if (optionen.probe !== undefined) {
    const ok = gilt(zeichen, grenze, optionen.probe);
    z.probe = {
      x: Math.min(Math.max(pos(optionen.probe), RAND - 8), BREITE - RAND + 8),
      gilt: ok,
      text: `Probe x = ${zahlText(optionen.probe)}: ${ok ? "gehört dazu" : "gehört nicht dazu"}`,
    };
  }
  return z;
}

/** Eine Probe: sagt, ob die eingegebene Zahl zur Lösungsmenge gehört, und warum; sonst eine Meldung zur Eingabe. */
export function probiere(zeichen: Zeichen, grenze: number, eingabe: string): { x?: number; meldung: string } {
  const x = leseZahl(eingabe);
  if (x === undefined) return { meldung: "Schreib eine Zahl, zum Beispiel 5 oder −2,5." };
  const ok = gilt(zeichen, grenze, x);
  const rechnung = `${zahlText(x)} ${zeichen} ${zahlText(grenze)}`;
  if (x === grenze) {
    return {
      x,
      meldung: mitGrenze(zeichen)
        ? `Die Grenzzahl ${zahlText(x)} gehört dazu: ${rechnung} stimmt, weil das Zeichen „gleich“ erlaubt.`
        : `Die Grenzzahl ${zahlText(x)} gehört nicht dazu: ${rechnung} stimmt nicht, weil das Zeichen „gleich“ nicht erlaubt.`,
    };
  }
  return {
    x,
    meldung: ok
      ? `${zahlText(x)} gehört zur Lösungsmenge: ${rechnung} stimmt.`
      : `${zahlText(x)} gehört nicht zur Lösungsmenge: ${rechnung} stimmt nicht.`,
  };
}
