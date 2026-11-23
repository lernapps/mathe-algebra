// Use Case: Gleichungen mit x auf beiden Seiten an der Waage lösen (Kapitel gleichungen).
// Die Logik von GleichungenWaage.ts: Schritte, Teilbarkeit, Begründung, Sonderfälle, Hinweise und die Rechenprobe,
// dass jeder Schritt die Lösung erhält.
import { describe, expect, test } from "vite-plus/test";
import {
  beschreibung,
  geloest,
  gleichungText,
  grundText,
  hinweis,
  loesung,
  seiteText,
  sonderfall,
  tue,
  zahl,
  type Stand,
} from "./GleichungenWaage.ts";

const start: Stand = { a: 3, b: 2, c: 1, d: 8 };

/** Beide Seiten für ein x. */
const links = (s: Stand, x: number): number => s.a * x + s.b;
const rechts = (s: Stand, x: number): number => s.c * x + s.d;

describe("Text der Gleichung", () => {
  test("mit Malpunkt und Minus U+2212", () => {
    expect(gleichungText(start)).toBe("3 · x + 2 = x + 8");
    expect(gleichungText({ a: 5, b: -4, c: 2, d: 11 })).toBe("5 · x − 4 = 2 · x + 11");
    expect(gleichungText({ a: 1, b: 0, c: 0, d: 4 })).toBe("x = 4");
    expect(gleichungText({ a: 0, b: 3, c: 0, d: 7 })).toBe("3 = 7");
    expect(gleichungText({ a: -1, b: 0, c: 2, d: -3 })).toBe("−x = 2 · x − 3");
    expect(seiteText(0, -5)).toBe("−5");
    expect(zahl(-3)).toBe("−3");
  });
});

describe("tue", () => {
  test("Päckchen auf beiden Seiten wegnehmen oder dazulegen", () => {
    expect(tue(start, "minusX", 1).stand).toEqual({ a: 2, b: 2, c: 0, d: 8 });
    expect(tue(start, "plusX", 2).stand).toEqual({ a: 5, b: 2, c: 3, d: 8 });
  });
  test("Gewichte auf beiden Seiten wegnehmen oder dazulegen", () => {
    expect(tue(start, "minus", 2).stand).toEqual({ a: 3, b: 0, c: 1, d: 6 });
    expect(tue(start, "plus", 5).stand).toEqual({ a: 3, b: 7, c: 1, d: 13 });
  });
  test("teilen, wenn alles aufgeht", () => {
    expect(tue({ a: 2, b: 0, c: 0, d: 6 }, "geteilt", 2).stand).toEqual({ a: 1, b: 0, c: 0, d: 3 });
  });
  test("teilen geht nicht, wenn etwas nicht aufgeht", () => {
    const r = tue({ a: 2, b: 0, c: 0, d: 7 }, "geteilt", 2);
    expect(r.stand).toBeUndefined();
    expect(r.meldung).toContain("geht nicht auf");
  });
  test("keine gültige Zahl", () => {
    expect(tue(start, "minus", 0).meldung).toContain("ganze Zahl");
    expect(tue(start, "minus", 2.5).meldung).toContain("ganze Zahl");
    expect(tue(start, "minusX", -1).meldung).toContain("ganze Zahl");
    expect(tue(start, "minusX", NaN).meldung).toContain("ganze Zahl");
  });
  test("Rechenprobe: x = 3 löst 3x + 2 = x + 8 und bleibt bei jedem Schritt Lösung", () => {
    const schritte: [Parameters<typeof tue>[1], number][] = [
      ["minusX", 1],
      ["minus", 2],
      ["geteilt", 2],
    ];
    let s = start;
    expect(links(s, 3)).toBe(rechts(s, 3));
    for (const [art, n] of schritte) {
      s = tue(s, art, n).stand!;
      expect(links(s, 3)).toBe(rechts(s, 3));
    }
    expect(s).toEqual({ a: 1, b: 0, c: 0, d: 3 });
    expect(geloest(s)).toBe(true);
    expect(loesung(s)).toBe(3);
  });
  test("x kann auch rechts allein liegen", () => {
    // 2x + 10 = 5x + 1: Löse mit x rechts: minus 2x, minus 1, teilen durch 3
    let s: Stand = { a: 2, b: 10, c: 5, d: 1 };
    s = tue(s, "minusX", 2).stand!;
    s = tue(s, "minus", 1).stand!;
    expect(s).toEqual({ a: 0, b: 9, c: 3, d: 0 });
    s = tue(s, "geteilt", 3).stand!;
    expect(s).toEqual({ a: 0, b: 3, c: 1, d: 0 });
    expect(geloest(s)).toBe(true);
    expect(loesung(s)).toBe(3);
  });
});

describe("Sonderfälle", () => {
  test("keine Lösung: 2x + 3 = 2x + 7", () => {
    const s = tue({ a: 2, b: 3, c: 2, d: 7 }, "minusX", 2).stand!;
    expect(sonderfall(s)).toBe("keine");
    expect(hinweis(s, [])).toContain("keine Lösung");
    expect(gleichungText(s)).toBe("3 = 7");
  });
  test("alle Zahlen: 2x + 6 = 2x + 6", () => {
    const s = tue({ a: 2, b: 6, c: 2, d: 6 }, "minusX", 2).stand!;
    expect(sonderfall(s)).toBe("alle");
    expect(hinweis(s, [])).toContain("Alle Zahlen");
  });
  test("mit Päckchen kein Sonderfall", () => {
    expect(sonderfall(start)).toBeUndefined();
  });
});

describe("Begründung und Hinweise", () => {
  test("Begründung zum Rand", () => {
    expect(grundText("minusX", 2)).toBe("− 2 · x");
    expect(grundText("minusX", 1)).toBe("− x");
    expect(grundText("plusX", 3)).toBe("+ 3 · x");
    expect(grundText("minus", 4)).toBe("− 4");
    expect(grundText("plus", 4)).toBe("+ 4");
    expect(grundText("geteilt", 3)).toBe(": 3");
  });
  test("Hinweis nach Stand", () => {
    expect(hinweis(start, [])).toContain("Päckchen");
    const schritt = [{ art: "minusX" as const, n: 1, stand: start, grund: "" }];
    expect(hinweis({ a: 2, b: 2, c: 1, d: 8 }, schritt)).toContain("Auf beiden Seiten liegen noch Päckchen");
    expect(hinweis({ a: 2, b: 2, c: 0, d: 8 }, schritt)).toContain("Gegenteil");
    expect(hinweis({ a: 2, b: 0, c: 0, d: 6 }, schritt)).toContain("durch 2");
    expect(hinweis({ a: 1, b: 0, c: 0, d: 3 }, schritt)).toContain("x = 3");
  });
  test("Beschreibung für Bildschirmleser", () => {
    const text = beschreibung(start);
    expect(text).toContain("Links liegen 3 Päckchen x und 2 Gewichte");
    expect(text).toContain("Rechts liegen 1 Päckchen x und 8 Gewichte");
  });
});
