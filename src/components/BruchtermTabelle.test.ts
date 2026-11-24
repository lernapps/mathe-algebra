// Use Case: Wann ein Bruchterm nicht definiert ist – die Tabelle zum Einsetzen (Kapitel bruchterme).
// Die Logik von BruchtermTabelle.ts mit Rechenprobe: Wert gleich Zähler durch Nenner, nicht definiert genau bei Nenner 0.
import { describe, expect, test } from "vite-plus/test";
import {
  MAX_ZEILEN,
  einsetzenText,
  hinweis,
  kuerzeBruch,
  linText,
  probiere,
  startZeilen,
  trageEin,
  zeichen,
} from "./BruchtermTabelle.ts";

const zwoelfDurchXMinus2 = { a: 0, b: 12, c: 1, d: -2 };

/** Rechnet einen angezeigten Text wie „2 · (−3) + 1“ nach. */
function rechne(text: string): number {
  const ausdruck = text.replaceAll("−", "-").replaceAll("·", "*");
  if (!/^[-+*() \d]+$/.test(ausdruck)) throw new Error(`unerwartet: ${text}`);
  return Function(`"use strict"; return (${ausdruck});`)() as number;
}

describe("linText und einsetzenText", () => {
  test("schreiben mit Minus U+2212", () => {
    expect(linText(1, -2)).toBe("x − 2");
    expect(linText(2, 1)).toBe("2x + 1");
    expect(linText(-1, 0)).toBe("−x");
    expect(linText(0, 12)).toBe("12");
    expect(linText(3, -9)).toBe("3x − 9");
  });
  test("eingesetzt: Klammer um negative Zahlen", () => {
    expect(einsetzenText(2, 1, 3)).toBe("2 · 3 + 1");
    expect(einsetzenText(2, 1, -3)).toBe("2 · (−3) + 1");
    expect(einsetzenText(1, -2, 3)).toBe("3 − 2");
    expect(einsetzenText(-1, 4, 3)).toBe("−3 + 4");
    expect(einsetzenText(0, 12, 5)).toBe("12");
  });
  test("Rechenprobe: der Text rechnet denselben Wert wie a · x + b", () => {
    for (let a = -3; a <= 3; a++)
      for (let b = -5; b <= 5; b++)
        for (let x = -6; x <= 6; x++) expect(rechne(einsetzenText(a, b, x))).toBeCloseTo(a * x + b, 10);
  });
});

describe("kuerzeBruch", () => {
  test("kürzt und setzt das Vorzeichen in den Zähler", () => {
    expect(kuerzeBruch(6, 4)).toEqual({ p: 3, q: 2 });
    expect(kuerzeBruch(6, -4)).toEqual({ p: -3, q: 2 });
    expect(kuerzeBruch(-12, -3)).toEqual({ p: 4, q: 1 });
    expect(kuerzeBruch(0, 5)).toEqual({ p: 0, q: 1 });
  });
});

describe("probiere", () => {
  test("12 : (x − 2) hat bei x = 2 die Lücke", () => {
    expect(probiere(zwoelfDurchXMinus2, 2).wert).toBeUndefined();
    expect(probiere(zwoelfDurchXMinus2, 2).nennerText).toBe("2 − 2");
    expect(probiere(zwoelfDurchXMinus2, 5).wert).toEqual({ p: 4, q: 1 });
    expect(probiere(zwoelfDurchXMinus2, 0).wert).toEqual({ p: -6, q: 1 });
    expect(probiere(zwoelfDurchXMinus2, 4).wert).toEqual({ p: 6, q: 1 });
  });
  test("Rechenprobe: nicht definiert genau bei Nenner 0, sonst Zähler : Nenner", () => {
    for (const a of [-2, 0, 1, 3])
      for (const b of [-4, 0, 5])
        for (const c of [-2, 1, 2])
          for (const d of [-6, -2, 0, 3])
            for (let x = -8; x <= 8; x++) {
              const z = probiere({ a, b, c, d }, x);
              const nenner = c * x + d;
              expect(z.nenner).toBe(nenner);
              if (nenner === 0) expect(z.wert).toBeUndefined();
              else {
                expect(z.wert).toBeDefined();
                expect(z.wert!.q).toBeGreaterThan(0);
                expect(z.wert!.p / z.wert!.q).toBeCloseTo((a * x + b) / nenner, 10);
                expect(rechne(z.zaehlerText)).toBeCloseTo(a * x + b, 10);
                expect(rechne(z.nennerText)).toBeCloseTo(nenner, 10);
              }
            }
  });
  test("nach dem Kürzen bleibt der Wert, nur die Lücke bleibt: (4x + 12) : (x + 3)", () => {
    const t = { a: 4, b: 12, c: 1, d: 3 };
    for (let x = -10; x <= 10; x++) {
      const z = probiere(t, x);
      if (x === -3) expect(z.wert).toBeUndefined();
      else expect(z.wert).toEqual({ p: 4, q: 1 });
    }
  });
});

describe("trageEin und hinweis", () => {
  test("ganze Zahl, mit Minus U+2212 und Bindestrich", () => {
    expect(trageEin(zwoelfDurchXMinus2, [], "3").zeilen).toHaveLength(1);
    expect(trageEin(zwoelfDurchXMinus2, [], "−2").zeilen[0]?.x).toBe(-2);
    expect(trageEin(zwoelfDurchXMinus2, [], "-2").zeilen[0]?.x).toBe(-2);
  });
  test("keine ganze Zahl: Meldung, keine Zeile", () => {
    for (const s of ["", "abc", "2,5", "1/2"]) {
      const r = trageEin(zwoelfDurchXMinus2, [], s);
      expect(r.zeilen).toHaveLength(0);
      expect(r.meldung).toContain("ganze Zahl");
    }
  });
  test("die Tabelle wird nicht endlos lang", () => {
    let zeilen = startZeilen(zwoelfDurchXMinus2, []);
    for (let i = 0; i < MAX_ZEILEN + 3; i++) zeilen = trageEin(zwoelfDurchXMinus2, zeilen, String(i)).zeilen;
    expect(zeilen).toHaveLength(MAX_ZEILEN);
    expect(trageEin(zwoelfDurchXMinus2, zeilen, "1").meldung).toContain("voll");
  });
  test("der Hinweis nennt die Lücke in Worten und enthält keinen Bruch mit Schrägstrich", () => {
    const luecke = hinweis([probiere(zwoelfDurchXMinus2, 2)]);
    expect(luecke).toContain("nicht definiert");
    expect(luecke).toContain("Nenner 0");
    const ok = hinweis([probiere(zwoelfDurchXMinus2, 5)]);
    expect(ok).toContain("Nenner 3");
    expect(luecke + ok + hinweis([])).not.toMatch(/\d\/\d/);
  });
});

describe("zeichen", () => {
  test("x, Zahlen und Operatoren für MathML", () => {
    expect(zeichen("2x + 12")).toEqual([
      { art: "mn", t: "2" },
      { art: "mi", t: "x" },
      { art: "mo", t: "+" },
      { art: "mn", t: "12" },
    ]);
    expect(
      zeichen("2 · (−3)")
        .map((z) => z.t)
        .join(""),
    ).toBe("2·(−3)");
  });
});
