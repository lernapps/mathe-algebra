// Use Case: Gleichungen mit x auf beiden Seiten durch Probieren lösen und prüfen (Kapitel gleichungen).
// Die Logik von GleichungenTabelle.ts: beide Seiten ausrechnen, vergleichen, Hinweise, Eingabe mit Komma und Punkt.
import { describe, expect, test } from "vite-plus/test";
import {
  gleichungText,
  hinweis,
  leseZahl,
  MAX_ZEILEN,
  probiere,
  seitenText,
  trageEin,
  vergleichText,
  type Gleichung,
  type Zeile,
} from "./GleichungenTabelle.ts";

const g: Gleichung = { a: 3, b: 2, c: 1, d: 8 };

describe("Gleichung als Text", () => {
  test("mit Malpunkt und Minus U+2212", () => {
    expect(gleichungText(g)).toBe("3 · x + 2 = x + 8");
    expect(gleichungText({ a: 5, b: -4, c: 2, d: 11 })).toBe("5 · x − 4 = 2 · x + 11");
    expect(gleichungText({ a: 2, b: 3, c: 2, d: 7 })).toBe("2 · x + 3 = 2 · x + 7");
  });
});

describe("probiere", () => {
  test("rechnet beide Seiten aus und vergleicht", () => {
    expect(probiere(g, 1)).toEqual({ x: 1, links: 5, rechts: 9, vergleich: "kleiner" });
    expect(probiere(g, 5)).toEqual({ x: 5, links: 17, rechts: 13, vergleich: "groesser" });
    expect(probiere(g, 3)).toEqual({ x: 3, links: 11, rechts: 11, vergleich: "gleich" });
  });
  test("Rechenprobe: 5x − 4 = 2x + 11 hat die Lösung 5", () => {
    expect(probiere({ a: 5, b: -4, c: 2, d: 11 }, 5).vergleich).toBe("gleich");
    expect(probiere({ a: 5, b: -4, c: 2, d: 11 }, 4).vergleich).toBe("kleiner");
  });
  test("negative Lösung und Dezimalzahlen", () => {
    // 4x + 3 = 2x − 5 hat die Lösung −4
    expect(probiere({ a: 4, b: 3, c: 2, d: -5 }, -4).vergleich).toBe("gleich");
    // 2x + 1 = x + 1,5 hat die Lösung 0,5; gerechnet wird ohne Rundungsfehler
    expect(probiere({ a: 2, b: 1, c: 1, d: 1.5 }, 0.5).vergleich).toBe("gleich");
    expect(probiere({ a: 1, b: 0.1, c: 0, d: 0.3 }, 0.2).vergleich).toBe("gleich");
  });
  test("keine Lösung und alle Zahlen", () => {
    for (const x of [-3, 0, 2.5, 10]) {
      expect(probiere({ a: 2, b: 3, c: 2, d: 7 }, x).vergleich).toBe("kleiner");
      expect(probiere({ a: 2, b: 6, c: 2, d: 6 }, x).vergleich).toBe("gleich");
    }
  });
});

describe("Texte", () => {
  test("Vergleich mit Wort und Zeichen", () => {
    expect(vergleichText("gleich")).toContain("=");
    expect(vergleichText("kleiner")).toContain("kleiner");
    expect(vergleichText("groesser")).toContain("größer");
  });
  test("beide Seiten in einer Zelle", () => {
    expect(seitenText(probiere(g, 1))).toBe("5 < 9");
    expect(seitenText(probiere(g, 3))).toBe("11 = 11");
    expect(seitenText(probiere({ a: 4, b: 3, c: 2, d: -5 }, 0))).toBe("3 > −5");
  });
});

describe("trageEin und Hinweise", () => {
  test("Komma, Punkt und Minus", () => {
    expect(leseZahl("2,5")).toBe(2.5);
    expect(leseZahl("2.5")).toBe(2.5);
    expect(leseZahl("−4")).toBe(-4);
    expect(leseZahl("-4")).toBe(-4);
    expect(leseZahl("abc")).toBeUndefined();
    expect(trageEin(g, [], "2,5").zeilen[0]?.x).toBe(2.5);
  });
  test("keine Zahl, Tabelle voll", () => {
    expect(trageEin(g, [], "x").meldung).toContain("Schreib eine Zahl");
    const voll: Zeile[] = Array.from({ length: MAX_ZEILEN }, () => probiere(g, 1));
    expect(trageEin(g, voll, "2").meldung).toContain("voll");
  });
  test("Hinweis: Treffer, Richtung nach dem Unterschied", () => {
    expect(hinweis(g, [])).toContain("Trag eine Zahl");
    expect(hinweis(g, [probiere(g, 3)])).toContain("Treffer");
    expect(hinweis(g, [probiere(g, 1)])).toContain("zweite Zahl");
    expect(hinweis(g, [probiere(g, 1), probiere(g, 2)])).toContain("kleiner geworden");
    expect(hinweis(g, [probiere(g, 2), probiere(g, 1)])).toContain("größer geworden");
  });
  test("Hinweis bei gleich steigenden Seiten", () => {
    const keine: Gleichung = { a: 2, b: 3, c: 2, d: 7 };
    expect(hinweis(keine, [probiere(keine, 1)])).toContain("bleibt bei jeder Zahl gleich");
    const alle: Gleichung = { a: 2, b: 6, c: 2, d: 6 };
    expect(hinweis(alle, [probiere(alle, 1)])).toContain("Gilt das immer");
  });
});
