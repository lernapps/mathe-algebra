// Die Logik der Übung TermeUmformen.vue (Kapitel "Terme aufstellen und umformen"): Terme zusammenfassen und Klammern
// auflösen. Je Art (Prop art) ein Generator mit Rechenweg und typischen Fehltermen samt Meldung. Die Eingabe liest
// BinomParser.ts, die Prüfung per Gleichwertigkeit und Form kommt aus BinomTerm.ts (Import, nichts kopiert). Dazu die
// Probe mit Zahlen (Wertetabelle): Aufgabe und eingegebener Term an drei Stellen. Reine Funktionen, deterministisch
// zur Aufgabennummer (seed).
import { auswerten, leseTerm } from "./BinomParser.ts";
import {
  addiere,
  alsAnzeige,
  alsEingabe,
  betrag,
  erzeugeZufall,
  glied,
  gliedAnzeige,
  pruefeTerm,
  schrittMarkdown,
  sindGleichwertig,
  zuLatex,
  type Glied,
  type Polynom,
  type Schritt,
  type Zufall,
} from "./BinomTerm.ts";

export { schrittText } from "./BinomTerm.ts";

export type Art = "gleichartig" | "gemischt" | "zweivariablen" | "plusminus" | "faktor" | "kombiniert";
export const ARTEN: readonly Art[] = ["gleichartig", "gemischt", "zweivariablen", "plusminus", "faktor", "kombiniert"];

/** Ein typischer Fehler: die Fehlterme (Eingabeform) und was dazu zu sagen ist; nr ist der Index in about.mistakes. */
export interface Fehler {
  kandidaten: string[];
  meldung: string;
  nr: number;
}

export interface TermeAufgabe {
  art: Art;
  /** Der Auftrag vor dem Term. */
  frage: string;
  /** Der Term der Aufgabe, so gesetzt, wie ihn das Kind liest: "3x + 5 − 2x" oder "7 − (2x − 3)". */
  term: string;
  /** Die Lösung in Eingabeform: "x+2". */
  loesung: string;
  /** Die ganze Lösung zum Lesen: "3x + 5 − 2x = x + 5". */
  ergebnis: string;
  schritte: Schritt[];
  tipp: string;
  fehler: Fehler[];
  /** Die Variablen der Aufgabe, sortiert (für die Probe). */
  variablen: string[];
  /** Für das Rechteck bei Faktor mal Klammer mit Plus: a · (kx + c); sonst nicht gesetzt. */
  bild?: { a: number; k: number; c: number; variable: string };
}

// --- Terme als Teile: Glied oder Klammer, mit Vorzeichen davor ----------------

/** Ein Posten der Summe: das Vorzeichen davor, ein Faktor (1 = keiner) und ein Glied (klammer false) oder eine Klammer. */
interface Teil {
  vz: 1 | -1;
  faktor: number;
  klammer: boolean;
  inhalt: Polynom;
}

const einzel = (k: number, vz: 1 | -1, ...variablen: string[]): Teil => ({
  vz,
  faktor: 1,
  klammer: false,
  inhalt: [glied(k, ...variablen)],
});
const mitKlammer = (vz: 1 | -1, faktor: number, inhalt: Polynom): Teil => ({ vz, faktor, klammer: true, inhalt });

const teilText = (t: Teil): string =>
  t.klammer ? `${t.faktor > 1 ? t.faktor : ""}(${alsAnzeige(t.inhalt)})` : alsAnzeige(t.inhalt);
const termText = (teile: Teil[]): string =>
  teile
    .map((t, i) => (i === 0 ? `${t.vz < 0 ? "−" : ""}${teilText(t)}` : ` ${t.vz < 0 ? "−" : "+"} ${teilText(t)}`))
    .join("");

/** Wie ein Kind falsch auflöst; ohne Angabe richtig. */
interface Flags {
  /** Der Faktor gilt nur für das erste Glied der Klammer. */
  nurErstes?: boolean;
  /** Das Minus vor der Klammer ändert nichts oder nur das erste Vorzeichen. */
  minus?: "ignoriert" | "nurErstes";
  /** Bei Plus vor der Klammer werden die Vorzeichen gedreht. */
  plusDreht?: boolean;
  /** Das Vorzeichen des letzten Produkts ist falsch. */
  letztesVz?: boolean;
  /** Der Faktor wird zu jedem Glied addiert statt multipliziert. */
  addiert?: boolean;
}

/** Alle Klammern aufgelöst, aber noch nicht zusammengefasst; mit Flags so, wie ein Kind es falsch macht. */
function entwickle(teile: Teil[], f: Flags = {}): Polynom {
  const aus: Polynom = [];
  teile.forEach((t, nr) => {
    const vz = t.vz < 0 && f.minus === "ignoriert" ? 1 : t.vz;
    const dreht = f.plusDreht === true && t.klammer && t.vz > 0 && t.faktor === 1 && nr > 0;
    t.inhalt.forEach((g, i, alle) => {
      if (f.nurErstes && t.klammer && t.faktor > 1 && i > 0) {
        aus.push({ k: g.k, e: { ...g.e } });
        return;
      }
      const grund = f.addiert && t.klammer && t.faktor > 1 ? g.k + t.faktor : g.k * (t.klammer ? t.faktor : 1);
      let vorzeichen: number = vz;
      if (f.minus === "nurErstes" && t.vz < 0 && i > 0) vorzeichen = 1;
      if (dreht) vorzeichen = -1;
      let k = vorzeichen * grund;
      if (f.letztesVz && t.klammer && i === alle.length - 1) k = -k;
      aus.push({ k, e: { ...g.e } });
    });
  });
  return aus;
}

/** Das Ergebnis, Glieder mit Variable vor der Zahl: −2x + 10. */
const loese = (teile: Teil[]): Polynom =>
  addiere(entwickle(teile), []).sort(
    (a, b) => Number(Object.keys(a.e).length === 0) - Number(Object.keys(b.e).length === 0),
  );
const alsEingabeKandidat = (p: Polynom): string => alsEingabe(addiere(p, []));

const schluessel = (g: Glied): string => Object.keys(g.e).sort().join("");
const gleich = (a: string, b: string): boolean => sindGleichwertig(a, b);

/** Gleichartige Glieder nebeneinander, in der Reihenfolge ihres ersten Auftretens. */
function sortiere(p: Polynom): Polynom {
  const gruppen = new Map<string, Glied[]>();
  for (const g of p) gruppen.set(schluessel(g), [...(gruppen.get(schluessel(g)) ?? []), g]);
  return [...gruppen.values()].flat();
}

/** Die Gruppen gleichartiger Glieder als Rechnung: (2 − 1)a + (3 + 4)b + 5. */
function gruppenText(p: Polynom): string {
  const gruppen = new Map<string, Glied[]>();
  for (const g of p) gruppen.set(schluessel(g), [...(gruppen.get(schluessel(g)) ?? []), g]);
  const teile = [...gruppen.values()].map((mitglieder) => {
    const [erstes = glied(0)] = mitglieder;
    const variablen = Object.keys(erstes.e).sort().join("");
    if (mitglieder.length === 1) {
      return { vor: erstes.k < 0 ? "−" : "+", text: gliedAnzeige(betrag(erstes)), einzeln: true };
    }
    const zahlen = mitglieder
      .map((g, i) =>
        i === 0 ? String(g.k < 0 ? `−${Math.abs(g.k)}` : g.k) : `${g.k < 0 ? "−" : "+"} ${Math.abs(g.k)}`,
      )
      .join(" ");
    return { vor: "+", text: `(${zahlen})${variablen}`, einzeln: false };
  });
  return teile
    .map((t, i) => (i === 0 ? `${t.einzeln && t.vor === "−" ? "−" : ""}${t.text}` : ` ${t.vor} ${t.text}`))
    .join("");
}

/** Die Produkte vor dem Ausrechnen: 3 · 2x + 3 · (−5). Das Vorzeichen des Faktors steht als Rechenzeichen davor. */
function produktText(teile: Teil[]): string {
  const posten = teile.flatMap((t) =>
    t.inhalt.map((g) =>
      t.klammer && t.faktor > 1
        ? { minus: t.vz < 0, text: `${t.faktor} · ${g.k < 0 ? `(${gliedAnzeige(g)})` : gliedAnzeige(g)}` }
        : { minus: t.vz * Math.sign(g.k) < 0, text: gliedAnzeige(betrag(g)) },
    ),
  );
  return posten
    .map((p, i) => (i === 0 ? `${p.minus ? "−" : ""}${p.text}` : ` ${p.minus ? "−" : "+"} ${p.text}`))
    .join("");
}

const schritt = (vor: string, formel: string): Schritt => [`${vor} `, formel];

function rechenweg(teile: Teil[], loesungP: Polynom): Schritt[] {
  const offen = entwickle(teile);
  const schritte: Schritt[] = [];
  const hatKlammer = teile.some((t) => t.klammer);
  if (teile.some((t) => t.klammer && t.faktor > 1)) {
    schritte.push(schritt("Faktor mit jedem Glied multiplizieren:", produktText(teile)));
  }
  if (hatKlammer) {
    schritte.push(schritt("Klammern auflösen:", alsAnzeige(offen)));
  }
  const sortiert = sortiere(offen);
  if (alsAnzeige(sortiert) !== alsAnzeige(offen)) {
    schritte.push(schritt("Gleichartige Glieder nebeneinander:", alsAnzeige(sortiert)));
  }
  const ergebnis = alsAnzeige(loesungP);
  if (ergebnis !== alsAnzeige(sortiert)) {
    const zusammen = gruppenText(sortiert);
    if (zusammen !== ergebnis) schritte.push(schritt("Zusammenzählen:", zusammen));
    schritte.push(schritt("Ergebnis:", ergebnis));
  } else if (!hatKlammer) {
    schritte.push(schritt("Ergebnis:", ergebnis));
  }
  return schritte;
}

// --- Fehlterme --------------------------------------------------------------

const MELDUNG = {
  produkt:
    "Du hast die Zahlen vor der Variablen multipliziert. Gleichartige Glieder zählst du zusammen: Es kommt darauf an, wie oft die Variable vorkommt, mit plus oder minus.",
  variable:
    "Die Variable bleibt so stehen, wie sie ist: Nur die Zahl davor ändert sich. Sie wird nicht quadriert und sie verschwindet auch nicht.",
  zusammen:
    "Eine Zahl und ein Glied mit Variable sind nicht gleichartig, sie bleiben getrennt stehen. Fasse die Glieder mit der Variablen für sich zusammen und die Zahlen für sich.",
  verschieden:
    "Verschiedene Variablen sind nicht gleichartig: Glieder mit a und Glieder mit b bleiben getrennt. Fasse nur Glieder mit derselben Variablen zusammen.",
  vorzeichen: "Das Vorzeichen vor einem Glied gehört zu diesem Glied. Bei einem Minus ziehst du ab, du addierst nicht.",
  minusIgnoriert:
    "Vor der Klammer steht ein Minus. Es gilt für alle Glieder in der Klammer: Jedes Vorzeichen dreht sich um.",
  minusErstes:
    "Du hast nur das erste Vorzeichen in der Klammer umgedreht. Das Minus vor der Klammer dreht jedes Vorzeichen um, auch das zweite.",
  minusFaktor:
    "Du hast das Minus vor der Klammer vergessen. Es gehört zum Faktor: Du multiplizierst mit einer negativen Zahl.",
  plusDreht: "Bei einem Plus vor der Klammer bleiben alle Vorzeichen, wie sie sind: Du lässt die Klammer einfach weg.",
  nurErstes:
    "Du hast den Faktor nur mit dem ersten Glied in der Klammer multipliziert. Er gilt für jedes Glied: Auch das zweite wird mit dem Faktor multipliziert.",
  letztesVz: "Achte auf die Vorzeichenregeln beim Multiplizieren: Plus mal Minus ist Minus, Minus mal Minus ist Plus.",
  addiert:
    "Du hast den Faktor zu den Gliedern addiert. Der Faktor vor der Klammer wird mit jedem Glied in der Klammer multipliziert.",
} as const;

/** Die Nummern der typischen Fehler, wie in about.mistakes. */
const NR = {
  produkt: 0,
  variable: 1,
  zusammen: 2,
  verschieden: 3,
  vorzeichen: 4,
  minus: 5,
  nurErstes: 6,
  letztesVz: 7,
  addiert: 8,
  plusDreht: 9,
} as const;

/** Behält nur Fehlterme, die falsch sind, und nur einmal; ein Fehler ohne Fehlterm entfällt. */
function fehlerListe(loesung: string, roh: { nr: number; meldung: string; kandidaten: string[] }[]): Fehler[] {
  return roh
    .map((f) => ({
      ...f,
      kandidaten: [...new Set(f.kandidaten)].filter((k) => !gleich(loesung, k)),
    }))
    .filter((f) => f.kandidaten.length > 0);
}

/** Die Fehler beim Auflösen von Klammern: aus den Flags, je nachdem, was in der Aufgabe vorkommt. */
function klammerFehler(
  teile: Teil[],
  loesungP: Polynom,
  nurFaktorArt: boolean,
): { nr: number; meldung: string; kandidaten: string[] }[] {
  const mitFaktor = teile.some((t) => t.klammer && t.faktor > 1 && t.inhalt.length > 1);
  const mitMinus = teile.some((t) => t.klammer && t.vz < 0 && t.faktor === 1);
  const mitMinusFaktor = teile.some((t) => t.klammer && t.vz < 0 && t.faktor > 1);
  const mitPlus = teile.some((t, i) => t.klammer && t.vz > 0 && t.faktor === 1 && i > 0);
  const k = (f: Flags): string => alsEingabeKandidat(entwickle(teile, f));
  const roh: { nr: number; meldung: string; kandidaten: string[] }[] = [];
  if (mitFaktor) roh.push({ nr: NR.nurErstes, meldung: MELDUNG.nurErstes, kandidaten: [k({ nurErstes: true })] });
  if (mitMinus) {
    roh.push({ nr: NR.minus, meldung: MELDUNG.minusIgnoriert, kandidaten: [k({ minus: "ignoriert" })] });
    roh.push({ nr: NR.minus, meldung: MELDUNG.minusErstes, kandidaten: [k({ minus: "nurErstes" })] });
  }
  if (mitMinusFaktor) {
    roh.push({ nr: NR.minus, meldung: MELDUNG.minusFaktor, kandidaten: [k({ minus: "ignoriert" })] });
  }
  if (mitPlus) roh.push({ nr: NR.plusDreht, meldung: MELDUNG.plusDreht, kandidaten: [k({ plusDreht: true })] });
  if (mitFaktor) roh.push({ nr: NR.letztesVz, meldung: MELDUNG.letztesVz, kandidaten: [k({ letztesVz: true })] });
  if (nurFaktorArt && mitFaktor)
    roh.push({ nr: NR.addiert, meldung: MELDUNG.addiert, kandidaten: [k({ addiert: true })] });
  const zusammen = zusammenKandidat(loesungP);
  if (zusammen !== undefined) roh.push({ nr: NR.zusammen, meldung: MELDUNG.zusammen, kandidaten: [zusammen] });
  return roh;
}

/** Ergebnis aus einem Glied mit Variable und einer Zahl: beides fälschlich zu (k + c)x zusammengezählt. */
function zusammenKandidat(p: Polynom): string | undefined {
  const mitVariable = p.filter((g) => Object.keys(g.e).length > 0);
  const zahlen = p.filter((g) => Object.keys(g.e).length === 0);
  const [g] = mitVariable;
  const [c] = zahlen;
  if (mitVariable.length !== 1 || zahlen.length !== 1 || g === undefined || c === undefined) return undefined;
  return g.k + c.k === 0 ? undefined : alsEingabe([{ k: g.k + c.k, e: { ...g.e } }]);
}

// --- Aufgaben ---------------------------------------------------------------

const VARIABLEN = ["x", "y", "n", "t"] as const;
const zeichen = (z: Zufall, minusProzent: number): 1 | -1 => (z.ganzzahl(1, 100) <= minusProzent ? -1 : 1);

/** Ruft `versuch` auf, bis er etwas liefert (deterministisch, der Zufall läuft weiter). */
function bis<T>(versuch: () => T | undefined): T {
  for (let i = 0; i < 500; i++) {
    const wert = versuch();
    if (wert !== undefined) return wert;
  }
  throw new Error("keine passende Aufgabe gefunden");
}

const vorzeichenSumme = (liste: { k: number; s: number }[]): number => liste.reduce((s, x) => s + x.k * x.s, 0);

function wechsel(arten: string[]): number {
  return arten.filter((a, i) => i > 0 && a !== arten[i - 1]).length;
}

interface Roh {
  teile: Teil[];
  fehler: (loesungP: Polynom) => { nr: number; meldung: string; kandidaten: string[] }[];
  variablen: string[];
  bild?: TermeAufgabe["bild"];
}

function gleichartig(z: Zufall): Roh {
  const v = z.wahl(VARIABLEN);
  return bis(() => {
    const n = z.wahl([2, 2, 3]);
    const liste = Array.from({ length: n }, (_, i) => ({ k: z.ganzzahl(1, 9), s: i === 0 ? 1 : zeichen(z, 40) }));
    const s = vorzeichenSumme(liste);
    if (s === 0 || liste.every((x) => x.k === 1)) return undefined;
    const teile = liste.map((x) => einzel(x.k, x.s as 1 | -1, v));
    const produkt = liste.reduce((p, x) => p * x.k * x.s, 1);
    return {
      teile,
      variablen: [v],
      fehler: () => [
        {
          nr: NR.produkt,
          meldung: MELDUNG.produkt,
          kandidaten: [alsEingabe([glied(produkt, v)])],
        },
        {
          nr: NR.variable,
          meldung: MELDUNG.variable,
          kandidaten: [alsEingabe([glied(s, v, v)]), alsEingabe([glied(s)])],
        },
        ...(liste.some((x) => x.s < 0)
          ? [
              {
                nr: NR.vorzeichen,
                meldung: MELDUNG.vorzeichen,
                kandidaten: [
                  alsEingabe([
                    glied(
                      liste.reduce((t, x) => t + x.k, 0),
                      v,
                    ),
                  ]),
                ],
              },
            ]
          : []),
      ],
    };
  });
}

interface Posten {
  k: number;
  s: 1 | -1;
  typ: string;
}

function gemischt(z: Zufall): Roh {
  const v = z.wahl(VARIABLEN);
  return bis(() => {
    const nv = z.wahl([2, 2, 3]);
    const nc = z.wahl([1, 2]);
    const posten: Posten[] = z.mischen([
      ...Array.from({ length: nv }, (): Posten => ({ k: z.ganzzahl(1, 9), s: zeichen(z, 40), typ: v })),
      ...Array.from({ length: nc }, (): Posten => ({ k: z.ganzzahl(1, 9), s: zeichen(z, 40), typ: "" })),
    ]);
    if (posten[0]) posten[0].s = 1;
    if (wechsel(posten.map((p) => p.typ)) < 2) return undefined;
    const sv = vorzeichenSumme(posten.filter((p) => p.typ === v));
    const sc = vorzeichenSumme(posten.filter((p) => p.typ === ""));
    if (sv === 0 || sc === 0) return undefined;
    const teile = posten.map((p) => (p.typ ? einzel(p.k, p.s, v) : einzel(p.k, p.s)));
    const betragVar = posten.filter((p) => p.typ === v).reduce((t, p) => t + p.k, 0);
    const betragZahl = posten.filter((p) => p.typ === "").reduce((t, p) => t + p.k, 0);
    return {
      teile,
      variablen: [v],
      fehler: () => [
        {
          nr: NR.zusammen,
          meldung: MELDUNG.zusammen,
          kandidaten: [alsEingabe([glied(sv + sc, v)]), alsEingabe([glied(sv + sc)])],
        },
        ...(posten.some((p) => p.s < 0)
          ? [
              {
                nr: NR.vorzeichen,
                meldung: MELDUNG.vorzeichen,
                kandidaten: [alsEingabe([glied(betragVar, v), glied(betragZahl)])],
              },
            ]
          : []),
      ],
    };
  });
}

function zweivariablen(z: Zufall): Roh {
  const [p, q] = z.wahl([
    ["a", "b"],
    ["x", "y"],
    ["m", "n"],
  ]) as [string, string];
  return bis(() => {
    const na = z.wahl([2, 2, 3]);
    const nc = z.wahl([0, 0, 1]);
    const posten: Posten[] = z.mischen([
      ...Array.from({ length: na }, (): Posten => ({ k: z.ganzzahl(1, 9), s: zeichen(z, 40), typ: p })),
      ...Array.from({ length: 2 }, (): Posten => ({ k: z.ganzzahl(1, 9), s: zeichen(z, 40), typ: q })),
      ...Array.from({ length: nc }, (): Posten => ({ k: z.ganzzahl(1, 9), s: zeichen(z, 40), typ: "" })),
    ]);
    if (posten[0]) posten[0].s = 1;
    if (wechsel(posten.filter((x) => x.typ !== "").map((x) => x.typ)) < 2) return undefined;
    const sp = vorzeichenSumme(posten.filter((x) => x.typ === p));
    const sq = vorzeichenSumme(posten.filter((x) => x.typ === q));
    const sc = vorzeichenSumme(posten.filter((x) => x.typ === ""));
    if (sp === 0 || sq === 0 || (nc === 1 && sc === 0)) return undefined;
    const teile = posten.map((x) => (x.typ ? einzel(x.k, x.s, x.typ) : einzel(x.k, x.s)));
    const betragVon = (typ: string): number => posten.filter((x) => x.typ === typ).reduce((t, x) => t + x.k, 0);
    return {
      teile,
      variablen: [p, q].sort(),
      fehler: () => [
        { nr: NR.verschieden, meldung: MELDUNG.verschieden, kandidaten: [alsEingabe([glied(sp + sq, p, q)])] },
        ...(posten.some((x) => x.s < 0)
          ? [
              {
                nr: NR.vorzeichen,
                meldung: MELDUNG.vorzeichen,
                kandidaten: [
                  alsEingabe([
                    glied(betragVon(p), p),
                    glied(betragVon(q), q),
                    ...(nc === 1 ? [glied(betragVon(""))] : []),
                  ]),
                ],
              },
            ]
          : []),
      ],
    };
  });
}

/** Eine Klammer mit einem Glied mit Variable und einer Zahl: kx ± c. */
function innen(z: Zufall, v: string, maxK: number): Polynom {
  return [glied(z.ganzzahl(1, maxK), v), glied(zeichen(z, 50) * z.ganzzahl(1, 9))];
}

/** Hat die Lösung ein Glied mit der Variablen und eine Zahl (beides ≠ 0)? Sonst fehlt der Aufgabe das Lehrreiche. */
function brauchbar(teile: Teil[], v: string): boolean {
  const l = loese(teile);
  return l.length === 2 && l.some((g) => g.e[v] !== undefined) && l.some((g) => Object.keys(g.e).length === 0);
}

function plusminus(z: Zufall): Roh {
  const v = z.wahl(VARIABLEN);
  return bis(() => {
    const typ = z.wahl(["konst", "gleich", "allein"]);
    const vorK = typ === "allein" ? -1 : z.wahl([-1, -1, 1] as const);
    const klammer = mitKlammer(vorK, 1, innen(z, v, 6));
    const teile =
      typ === "konst"
        ? [einzel(z.ganzzahl(2, 15), 1), klammer]
        : typ === "gleich"
          ? [einzel(z.ganzzahl(2, 9), 1, v), klammer]
          : [klammer];
    if (!brauchbar(teile, v)) return undefined;
    return { teile, variablen: [v], fehler: (l: Polynom) => klammerFehler(teile, l, false) };
  });
}

function faktor(z: Zufall): Roh {
  const v = z.wahl(VARIABLEN);
  return bis(() => {
    const f = z.ganzzahl(2, 9);
    const vorF = zeichen(z, 35);
    const inhalt = innen(z, v, z.wahl([1, 1, 2, 3, 4, 5]));
    const teile = [mitKlammer(vorF, f, inhalt)];
    const [g, c] = inhalt;
    if (!g || !c) return undefined;
    return {
      teile,
      variablen: [v],
      fehler: (l: Polynom) => klammerFehler(teile, l, true),
      ...(vorF > 0 ? { bild: { a: f, k: g.k, c: c.k, variable: v } } : {}),
    };
  });
}

function kombiniert(z: Zufall): Roh {
  const v = z.wahl(VARIABLEN);
  return bis(() => {
    const typ = z.wahl(["konst-faktor", "faktor-klammer", "faktor-faktor"]);
    const f = z.ganzzahl(2, 6);
    const teile =
      typ === "konst-faktor"
        ? [einzel(z.ganzzahl(1, 12), 1), mitKlammer(z.wahl([-1, 1] as const), f, innen(z, v, 3))]
        : typ === "faktor-klammer"
          ? [mitKlammer(1, f, innen(z, v, 3)), mitKlammer(z.wahl([-1, -1, 1] as const), 1, innen(z, v, 4))]
          : [mitKlammer(1, f, innen(z, v, 3)), mitKlammer(z.wahl([-1, 1] as const), z.ganzzahl(2, 6), innen(z, v, 3))];
    if (!brauchbar(teile, v)) return undefined;
    return { teile, variablen: [v], fehler: (l: Polynom) => klammerFehler(teile, l, false) };
  });
}

const FRAGE: Record<Art, string> = {
  gleichartig: "Fasse zusammen:",
  gemischt: "Fasse zusammen:",
  zweivariablen: "Fasse zusammen:",
  plusminus: "Löse die Klammer auf und fasse zusammen:",
  faktor: "Löse die Klammer auf:",
  kombiniert: "Löse die Klammern auf und fasse zusammen:",
};

const TIPP: Record<Art, string> = {
  gleichartig:
    "Gleichartig sind Glieder mit derselben Variablen. Zähle die Zahlen vor der Variablen zusammen, mit ihren Vorzeichen.",
  gemischt:
    "Zahlen und Glieder mit Variable sind nicht gleichartig. Fasse die Glieder mit der Variablen zusammen und, getrennt davon, die Zahlen.",
  zweivariablen:
    "Fasse Glieder mit derselben Variablen zusammen und lass die verschiedenen Variablen getrennt. Das Vorzeichen davor gehört zum Glied.",
  plusminus:
    "Plus vor der Klammer: Klammer weglassen. Minus vor der Klammer: Jedes Vorzeichen in der Klammer dreht sich um. Danach zusammenfassen.",
  faktor: "Multipliziere den Faktor mit jedem Glied in der Klammer und achte auf die Vorzeichen.",
  kombiniert: "Löse jede Klammer für sich auf. Dann stellst du gleichartige Glieder zusammen und fasst sie zusammen.",
};

const ERZEUGER: Record<Art, (z: Zufall) => Roh> = {
  gleichartig,
  gemischt,
  zweivariablen,
  plusminus,
  faktor,
  kombiniert,
};

export interface TermeProps {
  art: Art;
}

export function generate(seed: number, props: TermeProps): TermeAufgabe {
  const art = props.art;
  const roh = ERZEUGER[art](erzeugeZufall(seed));
  const loesungP = loese(roh.teile);
  const loesung = alsEingabe(loesungP);
  const term = termText(roh.teile);
  return {
    art,
    frage: FRAGE[art],
    term,
    loesung,
    ergebnis: `${term} = ${alsAnzeige(loesungP)}`,
    schritte: rechenweg(roh.teile, loesungP),
    tipp: TIPP[art],
    fehler: fehlerListe(loesung, roh.fehler(loesungP)),
    variablen: roh.variablen,
    ...(roh.bild ? { bild: roh.bild } : {}),
  };
}

// --- Prüfen und Rückmeldung --------------------------------------------------

const FORM: Record<string, string> = {
  "nicht-ausmultipliziert": "Der Term stimmt. Schreib ihn noch ohne Klammer.",
  "nicht-zusammengefasst":
    "Der Term stimmt. Fasse noch gleichartige Glieder zusammen, bis jede Art nur einmal vorkommt.",
};

const FALSCH: Record<Art, string> = {
  gleichartig:
    "Das stimmt noch nicht. Zähle die Zahlen vor der Variablen mit ihren Vorzeichen zusammen. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
  gemischt:
    "Das stimmt noch nicht. Fasse die Glieder mit der Variablen und die Zahlen getrennt zusammen. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
  zweivariablen:
    "Das stimmt noch nicht. Fasse jede Variable für sich zusammen, mit den Vorzeichen. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
  plusminus:
    "Das stimmt noch nicht. Schreib erst den Term ohne Klammer auf und denk an das Vorzeichen vor der Klammer. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
  faktor:
    "Das stimmt noch nicht. Schreib zu jedem Glied in der Klammer ein Produkt mit dem Faktor auf. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
  kombiniert:
    "Das stimmt noch nicht. Löse jede Klammer für sich auf, dann fasse zusammen. Die Probe mit Zahlen zeigt dir, ob dein Term stimmt.",
};

export function check(aufgabe: TermeAufgabe, antwort: string): boolean {
  return pruefeTerm(antwort, aufgabe.loesung, "ausmultipliziert").korrekt;
}

/** Warum die Antwort nicht stimmt: Lesefehler, Form oder der passende typische Fehler; "" bei einer richtigen. */
export function grund(aufgabe: TermeAufgabe, antwort: string): string {
  const ergebnis = pruefeTerm(antwort, aufgabe.loesung, "ausmultipliziert");
  if (ergebnis.korrekt) return "";
  if (ergebnis.fehler === "kein-term") {
    return ergebnis.meldung ?? "Das konnte ich nicht lesen. Schreib einen Term wie 3x+5 oder 2(x-1).";
  }
  if (ergebnis.fehler !== undefined && ergebnis.fehler !== "falsch") {
    return FORM[ergebnis.fehler] ?? FALSCH[aufgabe.art];
  }
  const fehler = aufgabe.fehler.find((f) => f.kandidaten.some((k) => gleich(antwort, k)));
  return fehler?.meldung ?? FALSCH[aufgabe.art];
}

/** Die Antwort aus dem Feld; undefined, solange es leer ist. */
export const antwortAus = (getippt: string): string | undefined => (getippt.trim() === "" ? undefined : getippt);

/** Wie man den Term tippt. */
export const eingabeHinweis = (_aufgabe?: TermeAufgabe): string =>
  "Schreib den Term, z. B. 3x+5. Minus tippst du mit -, das Mal darf fehlen (2x).";

export const feldLabel = (aufgabe: TermeAufgabe): string => `${aufgabe.term} =`;

/** Was die Übung aus der Eingabe gelesen hat: "Gelesen: 3x + 5", eine Meldung bei Syntaxfehlern, sonst "". */
export function vorschau(antwort: string): string {
  if (antwort.trim() === "") return "";
  const gelesen = leseTerm(antwort);
  return gelesen.fehler === undefined ? `Gelesen: ${gelesen.text}` : gelesen.meldung;
}

// --- Probe mit Zahlen (Wertetabelle) ------------------------------------------

export interface ProbeZeile {
  belegung: string;
  aufgabe: string;
  antwort: string;
  gleich: boolean;
}

const ZAHLEN_A = [2, 3, 5];
const ZAHLEN_B = [3, 1, 4];

const zahlText = (w: number): string =>
  Number.isFinite(w)
    ? String(Math.round(w * 1e6) / 1e6)
        .replace("-", "−")
        .replace(".", ",")
    : "?";

/**
 * Die Wertetabelle: Aufgabe und eingegebener Term bei drei Belegungen der Variablen. Leer, solange die Eingabe nicht
 * lesbar ist. Sie zeigt nur, ob beide Terme dort denselben Wert haben, nicht, ob der Term zusammengefasst ist.
 */
export function probe(aufgabe: TermeAufgabe, antwort: string): ProbeZeile[] {
  const eigene = leseTerm(antwort);
  const vorgabe = leseTerm(aufgabe.term);
  if (eigene.fehler !== undefined || vorgabe.fehler !== undefined) return [];
  return ZAHLEN_A.map((a, i) => {
    const belegung: Record<string, number> = {};
    aufgabe.variablen.forEach((name, j) => {
      belegung[name] = j === 0 ? a : (ZAHLEN_B[i] ?? 1);
    });
    const links = auswerten(vorgabe.baum, belegung);
    const rechts = auswerten(eigene.baum, belegung);
    return {
      belegung: aufgabe.variablen.map((name) => `${name} = ${belegung[name]}`).join(", "),
      aufgabe: zahlText(links),
      antwort: zahlText(rechts),
      gleich: Number.isFinite(rechts) && Math.abs(links - rechts) < 1e-9,
    };
  });
}

// --- Vertrag der Übung -------------------------------------------------------

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: TermeAufgabe, antwort: string, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

export function solution(aufgabe: TermeAufgabe): string {
  return aufgabe.loesung;
}

/** Ein typischer Fehlterm der Aufgabe; sonst die Lösung plus 1. */
export function wrong(aufgabe: TermeAufgabe): string {
  const kandidat = aufgabe.fehler.flatMap((f) => f.kandidaten).find((k) => !gleich(aufgabe.loesung, k));
  return kandidat ?? `${aufgabe.loesung}+1`;
}

/**
 * Die Antwort jedes typischen Fehlers aus about.mistakes, den es bei dieser Aufgabe gibt: der erste Fehlterm dieser
 * Nummer, der falsch ist; undefined für die anderen.
 */
export function mistakes(aufgabe: TermeAufgabe, _props?: unknown): (string | undefined)[] {
  return about.mistakes.map((_text, nr) =>
    aufgabe.fehler
      .filter((f) => f.nr === nr)
      .flatMap((f) => f.kandidaten)
      .find((k) => !gleich(aufgabe.loesung, k) && !check(aufgabe, k)),
  );
}

/** Die Aufgabe, wie das Kind sie liest, mit {Auftrag} und {Term}. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Auftrag} {Term} Das Kind tippt das Ergebnis als Term (Minus mit -, Mal darf fehlen).";

/** Was eine Aufgabe festlegt: der Auftrag und der Term. */
export const params = (aufgabe: TermeAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Auftrag: aufgabe.frage,
  Term: aufgabe.term,
});

/** Eine Antwort als Text: der Term, wie die Übung ihn gelesen hat (3x + 5), sonst wie getippt. */
export function show(antwort: string, _aufgabe?: TermeAufgabe, _props?: unknown, _lang?: string): string {
  const gelesen = leseTerm(antwort);
  return gelesen.fehler === undefined ? gelesen.text : antwort.trim();
}

export function describe(aufgabe: TermeAufgabe, _props: TermeProps, _lang: string): { task: string; solution: string } {
  return {
    task: `${aufgabe.frage} $${zuLatex(aufgabe.term)}$. Gib das Ergebnis als Term ein.`,
    solution: [`$${zuLatex(aufgabe.ergebnis)}$`, ...aufgabe.schritte.map((s) => `- ${schrittMarkdown(s)}`)].join("\n"),
  };
}

export const about = {
  task: "Du formst einen Term um, ohne seinen Wert zu ändern: gleichartige Glieder zusammenfassen (mit einer oder zwei Variablen, mit Zahlen) oder Klammern auflösen (Plus oder Minus vor der Klammer, ein Faktor vor der Klammer, beides zusammen).",
  answer:
    "Ein Term, getippt mit - für Minus (z. B. 3x+5 oder 2x-7, Malzeichen dürfen fehlen); dann „Prüfen“ unter der Aufgabe. Unter dem Feld steht, wie die Übung den Term gelesen hat; die Probe mit Zahlen zeigt, ob beide Terme denselben Wert haben; nach einer falschen Antwort gibt es „Lösung zeigen“.",
  correct:
    "Jeder Term, der dem richtigen gleichwertig ist und ohne Klammer und zusammengefasst dasteht. Die Reihenfolge der Glieder ist egal.",
  mistakes: [
    "Die Zahlen vor der Variablen multipliziert statt addiert: 3x + 5x = 15x.",
    "Die Variable verändert oder weggelassen: 3x + 5x = 8x² oder 8.",
    "Zahl und Variable zusammengezählt: 3x + 5 = 8x.",
    "Verschiedene Variablen zusammengefasst: 2a + 3b = 5ab.",
    "Das Vorzeichen eines Glieds nicht beachtet: 7x − 2x = 9x.",
    "Minus vor der Klammer nicht auf alle Glieder angewendet: −(a − b) = −a − b.",
    "Den Faktor nur auf das erste Glied verteilt: 3(x + 4) = 3x + 4.",
    "Vorzeichenregel beim Multiplizieren verletzt: −2(x − 5) = −2x − 10.",
    "Den Faktor addiert statt multipliziert: 3(x + 4) = 4x + 7.",
    "Plus vor der Klammer wie ein Minus behandelt: 5 + (x − 2) = 5 − x + 2.",
  ],
};
