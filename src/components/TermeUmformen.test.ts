// Die Übung mit Termeingabe für "Terme aufstellen und umformen" (TermeUmformen.ts, Bild TermeBilder.ts): je Art die
// Aufgaben mit Rechenprobe (Term und Lösung sind gleichwertig), andere richtige Schreibweisen, die typischen Fehler mit
// ihrer Meldung, die Probe mit Zahlen und die Beschreibung für Tutor und Seite ohne JavaScript.
import { describe, expect, test } from "vite-plus/test";
import { sindGleichwertig } from "./BinomTerm.ts";
import { faktorBild } from "./TermeBilder.ts";
import * as uebung from "./TermeUmformen.ts";
import {
  ARTEN,
  about,
  check,
  describe as beschreibe,
  generate,
  grund,
  probe,
  solution,
  vorschau,
  wrong,
} from "./TermeUmformen.ts";

const findeLoesung = (art: (typeof ARTEN)[number], loesung: string): ReturnType<typeof generate> => {
  for (let seed = 1; seed < 20000; seed++) {
    const a = generate(seed, { art });
    if (a.loesung === loesung) return a;
  }
  throw new Error(`keine Aufgabe mit ${loesung}`);
};

describe("für jede Art und viele Aufgabennummern", () => {
  test.each(ARTEN)(
    "%s: gleiche Nummer, gleiche Aufgabe; Rechenprobe; Lösung richtig, Fehlterm falsch mit Grund",
    (art) => {
      for (let seed = 1; seed <= 300; seed++) {
        const a = generate(seed, { art });
        expect(generate(seed, { art })).toEqual(a);
        expect(sindGleichwertig(a.term, a.loesung), `${seed} ${a.term} = ${a.loesung}`).toBe(true);
        expect(check(a, solution(a)), `${seed} ${a.term}`).toBe(true);
        expect(grund(a, solution(a))).toBe("");
        expect(check(a, wrong(a)), `${seed} ${a.term}`).toBe(false);
        expect(grund(a, wrong(a)).length).toBeGreaterThan(20);
        expect(a.schritte.length).toBeGreaterThanOrEqual(1);
        expect(a.fehler.length).toBeGreaterThanOrEqual(1);
        expect(a.term).not.toContain("*");
        expect(a.term).not.toContain("-");
        expect(a.ergebnis).not.toMatch(/\d\/\d/);
        for (const f of a.fehler) {
          for (const k of f.kandidaten) {
            expect(sindGleichwertig(k, a.loesung), `${seed} ${a.term}: ${k}`).toBe(false);
            expect(check(a, k)).toBe(false);
          }
        }
        const { task, solution: loesung } = beschreibe(a, { art }, "de");
        expect(task).toContain("$");
        expect(loesung).toContain("$");
        // die Probe: die Lösung hat überall denselben Wert, ein Fehlterm irgendwo nicht
        expect(probe(a, a.loesung).every((z) => z.gleich)).toBe(true);
        expect(probe(a, a.loesung)).toHaveLength(3);
      }
    },
  );

  test("die Arten unterscheiden sich in dem, was sie üben", () => {
    const hat = (art: (typeof ARTEN)[number], f: (term: string) => boolean): boolean =>
      Array.from({ length: 60 }, (_, i) => generate(i + 1, { art }).term).every(f);
    expect(hat("gleichartig", (t) => !t.includes("(") && /^[a-z0-9 +−]+$/.test(t))).toBe(true);
    expect(hat("gemischt", (t) => !t.includes("(") && /\d( |$)/.test(t))).toBe(true);
    expect(hat("zweivariablen", (t) => !t.includes("("))).toBe(true);
    expect(hat("plusminus", (t) => t.includes("(") && !/\d\(/.test(t))).toBe(true);
    expect(hat("faktor", (t) => /^−?\d\(/.test(t))).toBe(true);
    expect(hat("kombiniert", (t) => t.includes("(") && / [+−] /.test(t))).toBe(true);
  });

  test("about nennt Aufgabe, Antwort, was zählt und Fehler", () => {
    expect(about.mistakes.length).toBeGreaterThanOrEqual(5);
  });
});

describe("Zusammenfassen: feste Beispiele", () => {
  // (seed so gesucht, dass der Term passt)
  const finde = (art: (typeof ARTEN)[number], term: string): ReturnType<typeof generate> => {
    for (let seed = 1; seed < 20000; seed++) {
      const a = generate(seed, { art });
      if (a.term === term) return a;
    }
    throw new Error(`keine Aufgabe ${term}`);
  };

  test("gleichartige Glieder: andere Schreibweisen und typische Fehler", () => {
    const a = generate(1, { art: "gleichartig" });
    expect(check(a, a.loesung)).toBe(true);
    const mit = finde("gleichartig", "3x + 5x");
    for (const e of ["8x", "x*8", "8·x", " 8 x ", "x+7x"]) expect(check(mit, e) === (e !== "x+7x"), e).toBe(true);
    expect(grund(mit, "15x")).toMatch(/multipliziert/);
    expect(grund(mit, "8x^2")).toMatch(/Variable bleibt/);
    expect(grund(mit, "8")).toMatch(/Variable bleibt/);
    expect(grund(mit, "3x+5x")).toMatch(/gleichartige Glieder/);
    expect(grund(mit, "(3+5)x")).toMatch(/ohne Klammer/);
    expect(grund(mit, "9x")).toMatch(/Probe/);
    expect(grund(mit, "8x+")).toMatch(/unvollständig/);
  });

  test("Zahl und Variable bleiben getrennt", () => {
    const a = findeLoesung("gemischt", "5x+4");
    expect(check(a, "4 + 5x")).toBe(true);
    expect(grund(a, "9x")).toMatch(/nicht gleichartig/);
  });

  test("zwei Variablen", () => {
    const a = findeLoesung("zweivariablen", "a+7b");
    expect(check(a, "7b + a")).toBe(true);
    expect(grund(a, "8ab")).toMatch(/Verschiedene Variablen/);
    expect(grund(a, "3a+7b")).toMatch(/Probe/);
  });
});

describe("Klammern auflösen: feste Beispiele", () => {
  const finde = (art: (typeof ARTEN)[number], term: string): ReturnType<typeof generate> => {
    for (let seed = 1; seed < 40000; seed++) {
      const a = generate(seed, { art });
      if (a.term === term) return a;
    }
    throw new Error(`keine Aufgabe ${term}`);
  };

  test("Minus vor der Klammer dreht jedes Vorzeichen", () => {
    const a = finde("plusminus", "7 − (2x − 3)");
    expect(a.loesung).toBe("-2x+10");
    expect(check(a, "10-2x")).toBe(true);
    expect(grund(a, "7-2x-3")).toMatch(/nur das erste Vorzeichen/);
    expect(grund(a, "2x+4")).toMatch(/Es gilt für alle Glieder/);
    expect(grund(a, "7-2x+3")).toMatch(/gleichartige Glieder/);
    expect(grund(a, "7-(2x-3)")).toMatch(/ohne Klammer/);
  });

  test("nur das erste Vorzeichen gedreht", () => {
    const a = finde("plusminus", "−(x − 3)");
    expect(grund(a, "-x-3")).toMatch(/nur das erste Vorzeichen/);
  });

  test("Faktor nur auf das erste Glied, Vorzeichenregel, addiert", () => {
    const a = finde("faktor", "3(x + 4)");
    expect(a.loesung).toBe("3x+12");
    expect(a.bild).toEqual({ a: 3, k: 1, c: 4, variable: "x" });
    expect(check(a, "12+3x")).toBe(true);
    expect(grund(a, "3x+4")).toMatch(/nur mit dem ersten Glied/);
    expect(grund(a, "3x-12")).toMatch(/Vorzeichenregeln/);
    expect(grund(a, "4x+7")).toMatch(/addiert/);
    const b = finde("faktor", "−2(x − 5)");
    expect(b.loesung).toBe("-2x+10");
    expect(b.bild).toBeUndefined();
    expect(grund(b, "-2x-10")).toMatch(/Vorzeichenregeln/);
    expect(grund(b, "-2x-5")).toMatch(/nur mit dem ersten Glied/);
  });

  test("beides zusammen", () => {
    const a = finde("kombiniert", "4 + 3(x − 2)");
    expect(a.loesung).toBe("3x-2");
    expect(grund(a, "3x-6")).toMatch(/Probe/);
    expect(grund(a, "3x+4-2")).toMatch(/nur mit dem ersten Glied/);
    expect(grund(a, "x")).toMatch(/nicht gleichartig/);
  });
});

describe("Rechteckmodell", () => {
  test("Plus: zwei Teilflächen nebeneinander, vor der Lösung Rechnungen, danach Werte", () => {
    const offen = faktorBild(3, 1, 4, "x", false);
    const fertig = faktorBild(3, 1, 4, "x", true);
    const felder = (z: typeof offen) =>
      z.formen.filter((f) => f.art === "text" && f.ton === "innen").map((f) => f.text);
    expect(felder(offen)).toEqual(["3 · x", "3 · 4"]);
    expect(felder(fertig)).toEqual(["3x", "12"]);
    const rechtecke = fertig.formen.filter((f) => f.art === "rect");
    expect(rechtecke.map((f) => f.flaeche)).toEqual(["a", "ab"]);
    expect(rechtecke.reduce((s, f) => s + f.w, 0)).toBeCloseTo(220);
    expect(offen.label).toBe("3(x + 4) = ?. Zwei Teilflächen: jedes Mal Höhe mal Breite.");
    expect(fertig.label).toContain("3x + 12");
  });

  test("Minus: ein gestrichelter Streifen wird abgezogen", () => {
    const z = faktorBild(3, 1, -2, "x", true);
    const streifen = z.formen.filter((f) => f.art === "rect" && f.flaeche === "minus");
    expect(streifen).toHaveLength(1);
    expect(streifen[0]?.gestrichelt).toBe(true);
    expect(z.formen.filter((f) => f.art === "text").map((f) => f.text)).toEqual(
      expect.arrayContaining(["3x − 6", "− 6", "3(x − 2) = 3x − 6"]),
    );
    const rechtecke = z.formen.filter((f) => f.art === "rect");
    expect(rechtecke.reduce((s, f) => s + f.w, 0)).toBeCloseTo(220);
  });

  test("zu jeder Aufgabe von art faktor mit Plus gehört ein Bild, sonst keines", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const a = generate(seed, { art: "faktor" });
      expect(a.bild !== undefined).toBe(!a.term.startsWith("−"));
      if (a.bild) {
        const { a: f, k, c, variable } = a.bild;
        expect(a.term).toBe(`${f}(${k === 1 ? "" : k}${variable} ${c < 0 ? "−" : "+"} ${Math.abs(c)})`);
      }
    }
  });
});

describe("Probe mit Zahlen", () => {
  test("zeigt bei einem Fehler verschiedene Werte, bei der Lösung gleiche", () => {
    const a = generate(2, { art: "faktor" });
    const falsch = probe(a, wrong(a));
    expect(falsch.some((z) => !z.gleich)).toBe(true);
    expect(falsch.every((z) => z.belegung.startsWith(`${a.variablen[0]} = `))).toBe(true);
    expect(probe(a, "(")).toEqual([]);
    expect(probe(a, "")).toEqual([]);
  });
  test("zwei Variablen: beide stehen in der Belegung, Minus mit Minuszeichen", () => {
    const a = generate(3, { art: "zweivariablen" });
    const zeilen = probe(a, a.loesung);
    expect(zeilen[0]?.belegung).toMatch(/^\w = 2, \w = 3$/);
    expect(zeilen.map((z) => z.aufgabe + z.antwort).join("")).not.toContain("-");
  });
  test("Fehlterme, die an einer Stelle zufällig stimmen, fallen an einer anderen auf", () => {
    // 3x + 5 = 8x stimmt bei x = 1, nicht bei 2, 3 und 5
    const a = { ...generate(1, { art: "gemischt" }), term: "3x + 5", variablen: ["x"] };
    expect(probe(a, "8x").map((z) => z.gleich)).toEqual([false, false, false]);
  });
});

describe("Vorschau der Eingabe", () => {
  test("zeigt, was gelesen wurde, oder die Meldung", () => {
    expect(vorschau("3x+5")).toBe("Gelesen: 3x + 5");
    expect(vorschau("2(x-1")).toMatch(/Klammer/);
    expect(vorschau("")).toBe("");
  });
});

test("die Antwort erst, wenn etwas getippt ist", () => {
  expect(uebung.antwortAus("  ")).toBeUndefined();
  expect(uebung.antwortAus("3x")).toBe("3x");
});

describe("für den Tutor", () => {
  const { mistakes, params, reason, show, template } = uebung;
  test("Auftrag und Term; der getippte Term, wie die Übung ihn liest", () => {
    const a = generate(1, { art: "gleichartig" });
    expect(template()).toContain("{Auftrag} {Term}");
    expect(params(a)).toEqual({ Auftrag: "Fasse zusammen:", Term: a.term });
    expect(show("8*x")).toBe("8x");
  });
  for (const art of ARTEN) {
    test(`${art}: jeder typische Fehler ist falsch und hat seine Meldung`, () => {
      for (let seed = 1; seed <= 80; seed++) {
        const aufgabe = generate(seed, { art });
        const fehler = mistakes(aufgabe);
        expect(fehler).toHaveLength(about.mistakes.length);
        expect(fehler.some((antwort) => antwort !== undefined)).toBe(true);
        for (const antwort of fehler) {
          if (antwort === undefined) continue;
          expect(check(aufgabe, antwort)).toBe(false);
          expect(aufgabe.fehler.some((f) => f.meldung === reason(aufgabe, antwort))).toBe(true);
        }
      }
    });
  }
});
