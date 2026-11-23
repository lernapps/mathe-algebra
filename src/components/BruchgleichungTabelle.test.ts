// Use Case: Bruchgleichungen durch Einsetzen lösen und die Lücke beim Nenner 0 sehen (Kapitel bruchterme).
// Die Logik von BruchgleichungTabelle.ts: Brüche, Texte, genaue Rechnung, Lücken und die Rechenprobe der Lösungen.
import { describe, expect, test } from "vite-plus/test";
import {
  ausgeschlossen,
  ausgeschlossenText,
  bruch,
  bruchText,
  gleichungText,
  hinweis,
  leseZahl,
  MAX_ZEILEN,
  probiere,
  trageEin,
  type Gleichung,
  type Summand,
} from "./BruchgleichungTabelle.ts";

const malX = (z: number): Summand => ({ za: z, zb: 0, na: 0, nb: 1 });
const konst = (z: number): Summand => ({ za: 0, zb: z, na: 0, nb: 1 });
/** z : (a · x + b) */
const durch = (z: number, a: number, b: number): Summand => ({ za: 0, zb: z, na: a, nb: b });

// 6 : x = 2, Lösung 3
const sechsDurchX: Gleichung = { links: [durch(6, 1, 0)], rechts: [konst(2)] };
// 3 : (x − 1) = 2 : (x + 1), Lösung −5
const dreiZwei: Gleichung = { links: [durch(3, 1, -1)], rechts: [durch(2, 1, 1)] };
// 1 : x + 1 : 6 = 1 : 3, Lösung 6
const summe: Gleichung = { links: [durch(1, 1, 0), durch(1, 0, 6)], rechts: [durch(1, 0, 3)] };
// (x + 1) : (x − 2) = 2, Lösung 5
const einsPlus: Gleichung = { links: [{ za: 1, zb: 1, na: 1, nb: -2 }], rechts: [konst(2)] };
// x : (x − 3) = 3 : (x − 3): die „Lösung“ 3 liegt nicht in der Definitionsmenge, es gibt keine
const keineLoesung: Gleichung = { links: [{ za: 1, zb: 0, na: 1, nb: -3 }], rechts: [durch(3, 1, -3)] };

const faelle: { gleichung: Gleichung; loesungen: number[] }[] = [
  { gleichung: sechsDurchX, loesungen: [3] },
  { gleichung: dreiZwei, loesungen: [-5] },
  { gleichung: summe, loesungen: [6] },
  { gleichung: einsPlus, loesungen: [5] },
  { gleichung: keineLoesung, loesungen: [] },
];

describe("Rechenprobe: nur die Lösungen machen beide Seiten gleich", () => {
  for (const { gleichung, loesungen } of faelle) {
    test(gleichungText(gleichung), () => {
      const gleiche: number[] = [];
      for (let x = -40; x <= 40; x += 1) {
        if (probiere(gleichung, bruch(x)).stand === "gleich") gleiche.push(x);
      }
      expect(gleiche).toEqual(loesungen);
    });
  }
});

describe("Lücke beim Nenner 0", () => {
  test("6 : x = 2 bei x = 0", () => {
    const z = probiere(sechsDurchX, bruch(0));
    expect(z.stand).toBe("luecke");
    expect(z.links).toBeUndefined();
    expect(z.rechts).toEqual(bruch(2));
  });
  test("3 : (x − 1) = 2 : (x + 1) bei x = 1 und x = −1", () => {
    expect(probiere(dreiZwei, bruch(1)).stand).toBe("luecke");
    expect(probiere(dreiZwei, bruch(-1)).stand).toBe("luecke");
    expect(probiere(dreiZwei, bruch(0)).stand).toBe("kleiner");
  });
  test("x = 3 ist bei x : (x − 3) = 3 : (x − 3) eine Lücke, keine Lösung", () => {
    expect(probiere(keineLoesung, bruch(3)).stand).toBe("luecke");
  });
  test("die ausgeschlossenen Zahlen", () => {
    expect(ausgeschlossen(dreiZwei)).toEqual([bruch(-1), bruch(1)]);
    expect(ausgeschlossenText(dreiZwei)).toBe("x ≠ −1 und x ≠ 1");
    expect(ausgeschlossenText(summe)).toBe("x ≠ 0");
    expect(ausgeschlossenText({ links: [konst(1)], rechts: [konst(1)] })).toBe("");
    expect(ausgeschlossen({ links: [durch(1, 2, 1)], rechts: [durch(1, 2, 1)] })).toEqual([bruch(-1, 2)]);
  });
});

describe("genaue Rechnung", () => {
  test("1 : x + 1 : 6 bei x = 6 ist 1 : 3, ohne Rundung", () => {
    const z = probiere(summe, bruch(6));
    expect(z.links).toEqual(bruch(1, 3));
    expect(z.rechts).toEqual(bruch(1, 3));
    expect(z.stand).toBe("gleich");
  });
  test("Brüche als Eingabe gehen ein", () => {
    expect(probiere(sechsDurchX, bruch(1, 2)).links).toEqual(bruch(12));
  });
  test("Vergleich links kleiner und größer", () => {
    expect(probiere(sechsDurchX, bruch(4)).stand).toBe("kleiner");
    expect(probiere(sechsDurchX, bruch(2)).stand).toBe("groesser");
  });
});

describe("leseZahl", () => {
  test("ganz, mit Komma, mit Punkt, als Bruch, mit Minus", () => {
    expect(leseZahl("4")).toEqual(bruch(4));
    expect(leseZahl("0,75")).toEqual(bruch(3, 4));
    expect(leseZahl("0.75")).toEqual(bruch(3, 4));
    expect(leseZahl("3/4")).toEqual(bruch(3, 4));
    expect(leseZahl("−2,5")).toEqual(bruch(-5, 2));
    expect(leseZahl("-2")).toEqual(bruch(-2));
    expect(leseZahl(" 7 ")).toEqual(bruch(7));
  });
  test("keine Zahl", () => {
    expect(leseZahl("")).toBeUndefined();
    expect(leseZahl("x")).toBeUndefined();
    expect(leseZahl("3/0")).toBeUndefined();
    expect(leseZahl("1,2,3")).toBeUndefined();
    expect(leseZahl("1,2345")).toBeUndefined();
  });
});

describe("Texte", () => {
  test("Gleichungen mit Doppelpunkt und Minus U+2212", () => {
    expect(gleichungText(sechsDurchX)).toBe("6 : x = 2");
    expect(gleichungText(dreiZwei)).toBe("3 : (x − 1) = 2 : (x + 1)");
    expect(gleichungText(summe)).toBe("1 : x + 1 : 6 = 1 : 3");
    expect(gleichungText(einsPlus)).toBe("(x + 1) : (x − 2) = 2");
    expect(gleichungText({ links: [{ za: 1, zb: 0, na: 0, nb: 2 }, durch(1, 1, 0)], rechts: [malX(3)] })).toBe(
      "x : 2 + 1 : x = 3 · x",
    );
  });
  test("Zahlen mit Komma und Rundung", () => {
    expect(bruchText(bruch(-3))).toBe("−3");
    expect(bruchText(bruch(3, 4))).toBe("0,75");
    expect(bruchText(bruch(-1, 2))).toBe("−0,5");
    expect(bruchText(bruch(1, 3))).toBe("≈ 0,333");
    expect(bruchText(bruch(-2, 3))).toBe("≈ −0,667");
  });
  test("Hinweise", () => {
    expect(hinweis([])).toContain("Trag eine Zahl");
    expect(hinweis([probiere(sechsDurchX, bruch(0))])).toContain("Nenner 0");
    expect(hinweis([probiere(sechsDurchX, bruch(3))])).toContain("Treffer");
    expect(hinweis([probiere(sechsDurchX, bruch(4))])).toContain("kleiner");
    expect(hinweis([probiere(sechsDurchX, bruch(2))])).toContain("größer");
  });
});

describe("trageEin", () => {
  test("eine neue Zeile hinten", () => {
    const r = trageEin(sechsDurchX, [], "3");
    expect(r.meldung).toBe("");
    expect(r.zeilen).toHaveLength(1);
    expect(r.zeilen[0]?.stand).toBe("gleich");
  });
  test("keine Zahl: Meldung, Tabelle bleibt", () => {
    const r = trageEin(sechsDurchX, [], "abc");
    expect(r.zeilen).toHaveLength(0);
    expect(r.meldung).toContain("Zahl");
  });
  test("die Tabelle wird voll", () => {
    let zeilen = trageEin(sechsDurchX, [], "1").zeilen;
    for (let i = 1; i < MAX_ZEILEN; i += 1) zeilen = trageEin(sechsDurchX, zeilen, String(i + 1)).zeilen;
    expect(zeilen).toHaveLength(MAX_ZEILEN);
    const r = trageEin(sechsDurchX, zeilen, "5");
    expect(r.zeilen).toHaveLength(MAX_ZEILEN);
    expect(r.meldung).toContain("voll");
  });
});
