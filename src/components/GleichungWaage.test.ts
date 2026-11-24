// Use Case: Gleichungen mit der Waage lösen – auf beiden Seiten dasselbe tun (Kapitel raetsel und gleichungen).
// Die Logik von GleichungWaage.ts: Schritte, Teilbarkeit, Begründung, Hinweise und Randfälle.
import { describe, expect, test } from "vite-plus/test";
import { beschreibung, geloest, gleichungText, grundText, hinweis, tue, zahl } from "./GleichungWaage.ts";

const start = { a: 3, b: 4, c: 19 };

describe("gleichungText", () => {
  test("mit Malpunkt und Minus U+2212", () => {
    expect(gleichungText(start)).toBe("3 · x + 4 = 19");
    expect(gleichungText({ a: 1, b: 0, c: 5 })).toBe("x = 5");
    expect(gleichungText({ a: 2, b: -6, c: 10 })).toBe("2 · x − 6 = 10");
    expect(zahl(-3)).toBe("−3");
  });
});

describe("tue", () => {
  test("minus und plus auf beiden Seiten", () => {
    expect(tue(start, "minus", 4).stand).toEqual({ a: 3, b: 0, c: 15 });
    expect(tue(start, "plus", 6).stand).toEqual({ a: 3, b: 10, c: 25 });
  });
  test("teilen, wenn alles aufgeht", () => {
    expect(tue({ a: 3, b: 0, c: 15 }, "geteilt", 3).stand).toEqual({ a: 1, b: 0, c: 5 });
  });
  test("teilen geht nicht, wenn etwas nicht aufgeht", () => {
    const r = tue(start, "geteilt", 3);
    expect(r.stand).toBeUndefined();
    expect(r.meldung).toContain("geht nicht auf");
  });
  test("keine gültige Zahl", () => {
    expect(tue(start, "minus", 0).meldung).toContain("ganze Zahl");
    expect(tue(start, "minus", 2.5).meldung).toContain("ganze Zahl");
    expect(tue(start, "minus", -1).meldung).toContain("ganze Zahl");
  });
  test("die Lösung bleibt bei jedem Schritt dieselbe", () => {
    // x = 5 löst 3x + 4 = 19; nach minus 4 und geteilt durch 3 gilt x = 5 weiter
    const a = tue(start, "minus", 4).stand!;
    const b = tue(a, "geteilt", 3).stand!;
    expect(geloest(b)).toBe(true);
    expect(b.c).toBe(5);
  });
});

describe("Begründung und Hinweise", () => {
  test("Begründung zum Rand", () => {
    expect(grundText("minus", 4)).toBe("auf beiden Seiten − 4");
    expect(grundText("geteilt", 3)).toBe("beide Seiten durch 3 teilen");
  });
  test("Hinweis nach Stand", () => {
    expect(hinweis(start, [])).toContain("dasselbe");
    expect(hinweis({ a: 3, b: 0, c: 15 }, [{ art: "minus", n: 4, stand: start, grund: "" }])).toContain("durch 3");
    expect(hinweis({ a: 1, b: 0, c: 5 }, [])).toContain("x = 5");
  });
  test("Beschreibung für Bildschirmleser", () => {
    expect(beschreibung(start)).toContain("3 Päckchen x");
    expect(beschreibung(start)).toContain("19 Gewichte");
  });
});
