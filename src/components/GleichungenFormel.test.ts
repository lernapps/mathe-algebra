// Die Übung GleichungenFormel.ts: für jede Art und viele Aufgabennummern die Rechenprobe (Lösung und jeder Fehlterm
// an Zahlen), andere richtige Schreibweisen, die typischen Fehler mit ihrer Meldung, Randfälle der Eingabe und die
// Beschreibung für Tutor und Seite ohne JavaScript.
import { describe, expect, test } from "vite-plus/test";
import { auswerten, leseTerm } from "./BinomParser.ts";
import {
  about,
  check,
  describe as beschreibe,
  generate,
  grund,
  mistakes,
  params,
  show,
  solution,
  template,
  vorschau,
  wrong,
  type Art,
  type FormelAufgabe,
} from "./GleichungenFormel.ts";

const ARTEN: Art[] = ["einfach", "zwei", "schwer"];

/** Die erste Aufgabennummer, deren Aufgabe zur Formel und Zielgröße passt. */
function finde(art: Art, formel: string, ziel: string): FormelAufgabe {
  for (let seed = 1; seed < 500; seed++) {
    const a = generate(seed, { art });
    if (a.formel === formel && a.ziel === ziel) return a;
  }
  throw new Error(`keine Aufgabe ${formel} nach ${ziel}`);
}

/** Rechenprobe: Werte für alle Größen; das Ziel wird aus der umgestellten Formel berechnet und in die Ausgangsformel eingesetzt. */
const WERTE: Record<string, number> = {
  U: 30,
  a: 7,
  b: 8,
  A: 24,
  g: 6,
  h: 4,
  c: 5,
  F: 45,
  m: 4.5,
  v: 12,
  s: 36,
  t: 3,
  y: 19,
  x: 4,
  n: 3,
};

/** Auswerten einer Formel "links = rechts" (Unicode) an den Werten; liefert [links, rechts]. */
function beideSeiten(formel: string, werte: Record<string, number>): [number, number] {
  const [l, r] = formel.split(" = ") as [string, string];
  // Der Parser kennt nur kleine Buchstaben: U, A, F tauschen wir gegen j, q, k (in keiner Formel sonst benutzt).
  const klein: Record<string, string> = { U: "j", A: "q", F: "k" };
  const belegung = Object.fromEntries(Object.entries(werte).map(([b, w]) => [klein[b] ?? b, w]));
  const wert = (t: string): number => {
    const gelesen = leseTerm(t.replace(/[UAF]/g, (b) => klein[b] ?? b));
    if (gelesen.fehler !== undefined) throw new Error(`nicht lesbar: ${t}`);
    return auswerten(gelesen.baum, belegung);
  };
  return [wert(l), wert(r)];
}

describe("für jede Art und viele Aufgabennummern", () => {
  test.each(ARTEN)("%s: gleiche Nummer, gleiche Aufgabe; Lösung richtig, Fehlterm falsch mit Grund", (art) => {
    for (let seed = 1; seed <= 120; seed++) {
      const a = generate(seed, { art });
      expect(generate(seed, { art })).toEqual(a);
      expect(check(a, solution(a)), `${seed} ${a.formel}`).toBe(true);
      expect(grund(a, solution(a))).toBe("");
      expect(check(a, wrong(a)), `${seed} ${a.formel}`).toBe(false);
      expect(grund(a, wrong(a)).length).toBeGreaterThan(20);
      expect(a.schritte.length).toBeGreaterThanOrEqual(3);
      const { task, solution: loesung } = beschreibe(a, { art }, "de");
      expect(task).toContain("$");
      expect(loesung).toContain("$");
      expect(a.auftrag).toContain(a.ziel);
      for (const f of a.fehler) {
        expect(check(a, f.kandidat), `${a.formel}: ${f.kandidat}`).toBe(false);
        expect(grund(a, f.kandidat)).toBe(f.meldung);
        expect(f.nr).toBeLessThan(about.mistakes.length);
      }
    }
  });

  test.each(ARTEN)("%s: die umgestellte Formel stimmt für Zahlen (Rechenprobe)", (art) => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed, { art });
      const werte = { ...WERTE };
      const ziel = a.ziel;
      werte[ziel] = beideSeiten(a.ergebnis, werte)[1]; // Wert der rechten Seite der Lösung an den Werten
      const [l, r] = beideSeiten(a.formel, werte);
      expect(Math.abs(l - r), `${a.formel} nach ${ziel}: ${l} ≠ ${r}`).toBeLessThan(1e-9);
    }
  });
});

describe("andere richtige Schreibweisen zählen", () => {
  const a = finde("zwei", "U = 2a + 2b", "a");
  test.each([
    "(U-2b)/2",
    "(U − 2b) : 2",
    "a = (U-2b)/2",
    "U/2 - b",
    "0,5U - b",
    "0.5*U-b",
    "(U-2*b)/2",
    "(U - 2·b) : 2",
  ])("%s", (e) => expect(check(a, e), e).toBe(true));
  test("Großbuchstaben und Klein: U ist nicht u", () => {
    expect(check(a, "(u-2b)/2")).toBe(false);
    expect(grund(a, "(u-2b)/2")).toMatch(/Buchstaben u gibt es in dieser Formel nicht/);
  });
});

describe("typische Fehler bei U = 2a + 2b nach a", () => {
  const a = finde("zwei", "U = 2a + 2b", "a");
  test("nur ein Glied geteilt", () => {
    expect(grund(a, "U - 2b : 2")).toMatch(/nur 2b durch 2 geteilt/);
    expect(grund(a, "a = U − 2b : 2")).toMatch(/nur 2b durch 2 geteilt/);
  });
  test("Vorzeichen", () => expect(grund(a, "(U+2b):2")).toMatch(/Vorzeichen/));
  test("mal statt geteilt", () => expect(grund(a, "2(U-2b)")).toMatch(/mal und geteilt verwechselt/));
  test("Schritt vergessen", () => expect(grund(a, "U-2b")).toMatch(/noch nicht durch 2 geteilt/));
  test("Größe steht noch rechts", () => {
    expect(check(a, "U - 2b - a")).toBe(false);
    expect(grund(a, "U - 2b - a")).toMatch(/steht noch a/);
  });
  test("falsches Gleichheitszeichen, kein Term, leer", () => {
    expect(grund(a, "b = (U-2b)/2")).toMatch(/Links vom Gleichheitszeichen darf nur a stehen/);
    expect(grund(a, "(U-2b")).toMatch(/Klammer/);
    expect(grund(a, "(U-2b):")).toMatch(/unvollständig/);
    expect(check(a, "")).toBe(false);
    expect(check(a, "a")).toBe(false);
  });
  test("ein anderer Fehler bekommt den Hinweis zur Probe", () => {
    expect(grund(a, "U/2 + 3")).toMatch(/Probe/);
  });
});

describe("Trapez, Dreieck und Gerade", () => {
  test("Trapez nach h: durch die ganze Klammer", () => {
    const a = finde("schwer", "A = (a + c) · h : 2", "h");
    expect(check(a, "2A/(a+c)")).toBe(true);
    expect(check(a, "2*A : (c + a)")).toBe(true);
    expect(grund(a, "2A/a+c")).toMatch(/ganze Klammer/);
    expect(grund(a, "A/(2(a+c))")).toMatch(/durch 2 geteilt/);
  });
  test("Trapez nach a: erst mal 2 und durch h, dann minus c", () => {
    const a = finde("schwer", "A = (a + c) · h : 2", "a");
    expect(check(a, "2A/h - c")).toBe(true);
    expect(check(a, "(2A-c*h)/h")).toBe(true);
    expect(grund(a, "(2A-c)/h")).toMatch(/zu früh abgezogen/);
    expect(grund(a, "2A/h+c")).toMatch(/Vorzeichen/);
  });
  test("Dreieck nach h", () => {
    const a = finde("zwei", "A = g · h : 2", "h");
    expect(check(a, "2*A/g")).toBe(true);
    expect(check(a, "A/g*2")).toBe(true);
    expect(grund(a, "A/(2g)")).toMatch(/mal 2/);
  });
  test("Geschwindigkeit und Gewichtskraft", () => {
    const s = finde("einfach", "v = s : t", "s");
    expect(check(s, "v·t")).toBe(true);
    expect(check(s, "t*v")).toBe(true);
    expect(grund(s, "v/t")).toMatch(/mal und geteilt/);
    const t = finde("einfach", "v = s : t", "t");
    expect(grund(t, "v:s")).toMatch(/vertauscht/);
    const m = finde("einfach", "F = m · g", "m");
    expect(check(m, "F:g")).toBe(true);
    expect(grund(m, "F·g")).toMatch(/mal und geteilt/);
  });
  test("Gerade nach x", () => {
    const a = finde("schwer", "y = m · x + n", "x");
    expect(check(a, "(y-n)/m")).toBe(true);
    expect(grund(a, "y-n/m")).toMatch(/nur n durch m geteilt/);
  });
});

describe("Vorschau, Tutor und Beschreibung", () => {
  const a = finde("zwei", "U = 2a + 2b", "a");
  test("Vorschau zeigt Großbuchstaben und Doppelpunkt", () => {
    expect(vorschau(a, "(U-2b)/2")).toBe("Gelesen: a = (U − 2b) : 2");
    expect(vorschau(a, "")).toBe("");
    expect(vorschau(a, "(U-2b").length).toBeGreaterThan(5);
    expect(show("(U-2b)/2", a)).toBe("(U − 2b) : 2");
  });
  test("mistakes liefert je Fehlertyp eine falsche Antwort oder undefined", () => {
    const m = mistakes(a);
    expect(m).toHaveLength(about.mistakes.length);
    expect(m.filter((x) => x !== undefined).length).toBeGreaterThanOrEqual(3);
    for (const antwort of m) if (antwort !== undefined) expect(check(a, antwort)).toBe(false);
    expect(params(a)["Formel"]).toBe("U = 2a + 2b nach a");
    expect(template()).toContain("{Formel}");
    for (const name of Object.keys(params(a))) expect(template()).toContain(`{${name}}`);
  });
  test("about nennt Fehler", () => {
    expect(about.mistakes.length).toBeGreaterThanOrEqual(3);
  });
});
