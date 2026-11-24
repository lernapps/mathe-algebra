// Das Rechteckmodell für "Faktor mal Klammer": a · (kx + c) als Rechteck aus zwei Teilen. Die Zeichnung hat die Form
// aus BinomFlaeche.ts, BinomSvg.vue zeichnet sie (Import, kein Nachbau); die Längen teilt teile() aus BinomFlaeche.ts.
// Für c > 0 zwei Teilflächen nebeneinander, für c < 0 ein Streifen, der von der Fläche a · kx abgezogen wird.
// Reine Funktionen; das Bild der Seite klammern-aufloesen entsteht aus derselben Funktion (Skript außerhalb des Repos).
import { laengeVon, teile, type Form, type Zeichnung } from "./BinomFlaeche.ts";
import { glied, gliedAnzeige, type Glied } from "./BinomTerm.ts";

const BASIS: Form = {
  art: "rect",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  flaeche: "leer",
  gestrichelt: false,
  text: "",
  groesse: 14,
  anker: "middle",
  ton: "normal",
  fett: false,
};
const r = (n: number): number => Math.round(n * 10) / 10;

class Formen {
  readonly liste: Form[] = [];
  rect(x: number, y: number, w: number, h: number, flaeche: Form["flaeche"], gestrichelt = false): void {
    this.liste.push({ ...BASIS, x: r(x), y: r(y), w: r(w), h: r(h), flaeche, gestrichelt });
  }
  text(x: number, y: number, text: string, art: Partial<Pick<Form, "groesse" | "anker" | "ton" | "fett">> = {}): void {
    this.liste.push({ ...BASIS, art: "text", x: r(x), y: r(y), text, ...art });
  }
  linie(x1: number, y1: number, x2: number, y2: number): void {
    this.liste.push({ ...BASIS, art: "line", x: r(x1), y: r(y1), w: r(x2 - x1), h: r(y2 - y1) });
  }
}

/**
 * Das Rechteck zu a · (kx + c): Höhe a, Breite kx + c. `geloest` schreibt in die Teile die Werte (3x, 12), sonst die
 * Rechnungen (3 · x, 3 · 4). `variable` ist der Buchstabe der Breite, `k` die Zahl davor, a eine Zahl ab 1.
 */
export function faktorBild(a: number, k: number, c: number, variable: string, geloest: boolean): Zeichnung {
  const gx: Glied = glied(k, variable);
  const kx = gliedAnzeige(gx);
  const cBetrag = Math.abs(c);
  const klammer = `${kx} ${c < 0 ? "−" : "+"} ${cBetrag}`;
  const ergebnis = `${a * k === 1 ? variable : `${a * k}${variable}`} ${c < 0 ? "−" : "+"} ${a * cBetrag}`;
  const titel = `${a}(${klammer}) = ${geloest ? ergebnis : "?"}`;
  const untertitel =
    c < 0 ? `Von ${a} · ${kx} wird der gestrichelte Streifen abgezogen` : "Zwei Teilflächen: jedes Mal Höhe mal Breite";
  const x0 = 64;
  const y0 = 44;
  const breite = 220;
  const hoehe = Math.min(120, 36 + a * 8);
  const f = new Formen();
  if (c > 0) {
    const [w1 = 110, w2 = 110] = teile([laengeVon(gx), cBetrag], breite);
    f.rect(x0, y0, w1, hoehe, "a");
    f.rect(x0 + w1, y0, w2, hoehe, "ab");
    f.text(x0 + w1 / 2, y0 + hoehe / 2 + 5, geloest ? gliedAnzeige(glied(a * k, variable)) : `${a} · ${kx}`, {
      ton: "innen",
      groesse: w1 < 60 ? 12 : 15,
    });
    f.text(x0 + w1 + w2 / 2, y0 + hoehe / 2 + 5, geloest ? String(a * c) : `${a} · ${c}`, {
      ton: "innen",
      groesse: w2 < 60 ? 12 : 15,
    });
    f.text(x0 + w1 / 2, y0 - 10, kx, { fett: true });
    f.text(x0 + w1 + w2 / 2, y0 - 10, String(c), { fett: true });
  } else {
    const streifen = Math.max(32, Math.min(breite * 0.42, (breite * cBetrag) / (laengeVon(gx) + cBetrag)));
    const rest = breite - streifen;
    f.rect(x0, y0, rest, hoehe, "a");
    f.rect(x0 + rest, y0, streifen, hoehe, "minus", true);
    f.text(
      x0 + rest / 2,
      y0 + hoehe / 2 + 5,
      geloest ? `${gliedAnzeige(glied(a * k, variable))} − ${a * cBetrag}` : "?",
      {
        ton: "innen",
        groesse: 14,
      },
    );
    f.text(x0 + rest + streifen / 2, y0 + hoehe / 2 + 5, geloest ? `− ${a * cBetrag}` : `− ${a} · ${cBetrag}`, {
      ton: "minus",
      groesse: streifen < 60 ? 12 : 15,
      fett: true,
    });
    f.linie(x0, y0 - 14, x0 + breite, y0 - 14);
    f.text(x0 + breite / 2, y0 - 19, kx, { fett: true });
    f.text(x0 + rest + streifen / 2, y0 + hoehe + 18, `− ${cBetrag}`, { ton: "minus", fett: true });
  }
  f.text(x0 - 8, y0 + hoehe / 2 + 5, String(a), { anker: "end", fett: true });
  f.text(160, y0 + hoehe + 42, titel, { groesse: 16, fett: true });
  f.text(160, y0 + hoehe + 62, untertitel, { groesse: 12, ton: "leise" });
  return {
    breite: 320,
    hoehe: Math.round(y0 + hoehe + 76),
    label: `${titel}. ${untertitel}.`,
    formen: f.liste,
  };
}
