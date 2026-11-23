// Use Case: Terme mit Variablen aufstellen (Kapitel terme, Seite terme-aufstellen).
// Die Übung mit Termeingabe (TermeAufstellen.ts): beide Arten, andere richtige Schreibweisen, die typischen Fehler mit
// ihrer Meldung, Randfälle und die Beschreibung für Tutor und Seite ohne JavaScript.
import { describe, expect, test } from "vite-plus/test";
import { auswerten, leseTerm } from "./BinomParser.ts";
import {
  about,
  antwortAus,
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
  wertFuer,
  wrong,
  type Art,
  type Aufgabe,
} from "./TermeAufstellen.ts";

const ARTEN: Art[] = ["kette", "preis"];
const wertVon = (term: string, n: number): number => {
  const t = leseTerm(term);
  if (t.fehler !== undefined) throw new Error(term);
  return auswerten(t.baum, { n });
};
/** Die erste Aufgabennummer, deren Aufgabe passt. */
function finde(art: Art, passt: (a: Aufgabe) => boolean): Aufgabe {
  for (let seed = 1; seed < 500; seed++) {
    const a = generate(seed, { art });
    if (passt(a)) return a;
  }
  throw new Error(`keine Aufgabe für ${art}`);
}

describe("für jede Art und viele Aufgabennummern", () => {
  test.each(ARTEN)("%s: gleiche Nummer, gleiche Aufgabe; Lösung richtig, Fehler falsch mit Grund", (art) => {
    for (let seed = 1; seed <= 300; seed++) {
      const a = generate(seed, { art });
      expect(generate(seed, { art })).toEqual(a);
      expect(check(a, solution(a)), `${seed}`).toBe(true);
      expect(grund(a, solution(a))).toBe("");
      expect(check(a, wrong(a)), `${seed} ${a.text}`).toBe(false);
      expect(grund(a, wrong(a)).length).toBeGreaterThan(20);
      for (const f of a.fehler) {
        expect(check(a, f.kandidat), `${seed} ${f.kandidat}`).toBe(false);
        expect(grund(a, f.kandidat)).toBe(f.meldung);
      }
      expect(a.schritte.length).toBeGreaterThanOrEqual(3);
      const { task, solution: loesung } = beschreibe(a, { art }, "de");
      expect(task).toContain(a.text);
      expect(loesung).toContain("$");
    }
  });

  test.each(ARTEN)("%s: die Rechenprobe: der Term gibt für n = 1 bis 30 den gezählten oder gerechneten Wert", (art) => {
    for (let seed = 1; seed <= 100; seed++) {
      const a = generate(seed, { art });
      for (let n = 1; n <= 30; n++) expect(wertVon(a.loesung, n), `${seed} n=${n}`).toBe(wertFuer(a, n));
    }
  });

  test("Kette: n = 1 ist das erste Vieleck mit allen Ecken, jedes weitere bringt eine Ecke weniger", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const a = generate(seed, { art: "kette" });
      const ecken = wertFuer(a, 1);
      expect([3, 4, 5, 6]).toContain(ecken);
      expect(a.text).toContain(`braucht ${ecken} Hölzer`);
      expect(a.text).toContain(`braucht darum nur ${ecken - 1} Hölzer dazu`);
      expect(wertFuer(a, 2) - wertFuer(a, 1)).toBe(ecken - 1);
    }
  });

  test("Preis: Grundgebühr und Preis je Stunde sind verschieden, der Text nennt beide", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const a = generate(seed, { art: "preis" });
      const je = wertFuer(a, 2) - wertFuer(a, 1);
      const grundgebuehr = wertFuer(a, 0);
      expect(je).not.toBe(grundgebuehr);
      expect(a.text).toContain(`${grundgebuehr} € Grundgebühr`);
      expect(a.text).toContain(`${je} € für jede Stunde`);
    }
  });

  test("alle vier Formen kommen vor", () => {
    const formen = new Set(Array.from({ length: 60 }, (_, i) => wertFuer(generate(i + 1, { art: "kette" }), 1)));
    expect(formen.size).toBe(4);
  });

  test("about nennt Aufgabe, Antwort, was zählt und Fehler", () => {
    expect(about.mistakes.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Kette aus Quadraten (3n + 1)", () => {
  const a = finde("kette", (x) => x.loesung === "3n+1");
  test("andere richtige Schreibweisen zählen, auch anders gezählt", () => {
    expect(a.text).toContain("Quadrat");
    for (const e of ["3n+1", "1 + 3n", "3*n+1", "3 · n + 1", "4 + 3 · (n − 1)", "4+3(n-1)", "n+n+n+1", "3(n+1)−2"]) {
      expect(check(a, e), e).toBe(true);
    }
  });
  test("typische Fehler mit ihrem Grund", () => {
    expect(grund(a, "4n")).toMatch(/nur das erste braucht 4/);
    expect(grund(a, "3n")).toMatch(/ein Holz mehr/);
    expect(grund(a, "n+3")).toMatch(/mit 3 malgenommen/);
    expect(grund(a, "4n+1")).toMatch(/Bei n = 3 gibt dein Term 13, gezählt sind es 10/);
  });
  test("kein Term, falscher Buchstabe, kein n, leer", () => {
    expect(grund(a, "3n+")).toMatch(/unvollständig/);
    expect(grund(a, "3x+1")).toMatch(/als n, nicht als x/);
    expect(grund(a, "10")).toMatch(/kommt n gar nicht vor/);
    expect(check(a, "")).toBe(false);
    expect(antwortAus("  ")).toBeUndefined();
    expect(antwortAus("3n+1")).toBe("3n+1");
  });
  test("Vorschau und Anzeige", () => {
    expect(vorschau("3n+1")).toBe("Gelesen: 3n + 1");
    expect(vorschau("4+3*(n-1)")).toBe("Gelesen: 4 + 3(n − 1)");
    expect(vorschau("")).toBe("");
    expect(show("3*n+1", a)).toBe("3n + 1");
  });
});

describe("Preis (je · n + Grundgebühr)", () => {
  const a = finde("preis", (x) => x.loesung === "4n+7");
  test("andere richtige Schreibweisen zählen", () => {
    expect(a.text).toContain("7 € Grundgebühr");
    for (const e of ["4n+7", "7+4n", "4*n+7", "n·4+7", "4(n+1)+3", "4n + 7"]) expect(check(a, e), e).toBe(true);
  });
  test("typische Fehler mit ihrem Grund", () => {
    expect(grund(a, "7n+4")).toMatch(/vertauscht/);
    expect(grund(a, "(4+7)n")).toMatch(/nur einmal/);
    expect(grund(a, "4n")).toMatch(/Grundgebühr von 7 € fehlt/);
    expect(grund(a, "7+4+n")).toMatch(/nur addiert/);
    expect(grund(a, "5n+7")).toMatch(/Bei n = 3 gibt dein Term 22, gezählt sind es 19/);
  });
});

describe("für das Tutor-Verzeichnis", () => {
  test("template, params und mistakes passen zusammen", () => {
    for (const art of ARTEN) {
      const a = generate(1, { art });
      expect(template()).toContain("{Aufgabe}");
      expect(Object.keys(params(a))).toEqual(["Aufgabe"]);
      const m = mistakes(a);
      expect(m.length).toBe(about.mistakes.length);
      expect(m.filter((x) => x !== undefined).length).toBeGreaterThanOrEqual(3);
      for (const x of m) if (x !== undefined) expect(check(a, x)).toBe(false);
    }
  });
});
