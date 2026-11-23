// Use Case: Gleichungen durch Probieren lösen – die Tabelle rechnet beide Seiten aus (Kapitel raetsel).
// Die Logik von RaetselTabelle.ts: Zahlen lesen, Gleichung setzen, Vergleich, Hinweise, Randfälle.
import { describe, expect, test } from "vite-plus/test";
import {
  gleichungText,
  hinweis,
  leseZahl,
  linkeSeite,
  MAX_ZEILEN,
  probiere,
  trageEin,
  vergleichText,
  vergleichsText,
  zahlText,
  type Zeile,
} from "./RaetselTabelle.ts";

const g = { a: 3, b: 4, c: 19 };

describe("leseZahl", () => {
  test("Komma und Punkt gelten", () => {
    expect(leseZahl("2,5")).toBe(2.5);
    expect(leseZahl("2.5")).toBe(2.5);
    expect(leseZahl(" 5 ")).toBe(5);
  });
  test("Minus als Rechenzeichen U+2212 und als Bindestrich", () => {
    expect(leseZahl("−3")).toBe(-3);
    expect(leseZahl("-3")).toBe(-3);
  });
  test("keine Zahl", () => {
    expect(leseZahl("")).toBeUndefined();
    expect(leseZahl("abc")).toBeUndefined();
    expect(leseZahl("1,2,3")).toBeUndefined();
    expect(leseZahl("5x")).toBeUndefined();
  });
});

describe("Gleichung als Text", () => {
  test("mit Malpunkt und Rechenzeichen", () => {
    expect(gleichungText(g)).toBe("3 · x + 4 = 19");
    expect(linkeSeite({ a: 1, b: 7, c: 12 })).toBe("x + 7");
    expect(linkeSeite({ a: 5, b: 0, c: 20 })).toBe("5 · x");
    expect(linkeSeite({ a: 2, b: -6, c: 10 })).toBe("2 · x − 6");
  });
  test("Dezimalzahlen mit Komma", () => {
    expect(zahlText(2.5)).toBe("2,5");
    expect(zahlText(-1)).toBe("−1");
  });
});

describe("probiere", () => {
  test("zu klein, richtig, zu groß", () => {
    expect(probiere(g, 2)).toEqual({ x: 2, links: 10, rechts: 19, vergleich: "kleiner" });
    expect(probiere(g, 5).vergleich).toBe("gleich");
    expect(probiere(g, 6).vergleich).toBe("groesser");
  });
  test("Dezimalzahlen ohne Rundungsfehler", () => {
    expect(probiere({ a: 1, b: 0.2, c: 0.3 }, 0.1).vergleich).toBe("gleich");
  });
  test("negatives x", () => {
    expect(probiere(g, -1).links).toBe(1);
  });
});

describe("Hinweise", () => {
  test("ohne Zeile, kleiner, größer, Treffer", () => {
    expect(hinweis([])).toContain("Trag eine Zahl");
    const klein = [probiere(g, 2)];
    expect(hinweis(klein)).toContain("größeres x als 2");
    expect(hinweis([probiere(g, 6)])).toContain("kleineres x als 6");
    expect(hinweis([probiere(g, 5)])).toContain("Treffer");
  });
  test("der Vergleich nennt Wort und Zeichen", () => {
    expect(vergleichText("kleiner")).toContain("<");
    expect(vergleichText("gleich")).toContain("=");
    expect(vergleichText("groesser")).toContain(">");
  });
});

describe("trageEin", () => {
  test("neue Zeile hinten", () => {
    const r = trageEin(g, [], "4");
    expect(r.zeilen).toHaveLength(1);
    expect(r.meldung).toBe("");
  });
  test("Unsinn ändert nichts und sagt warum", () => {
    const r = trageEin(g, [], "vier");
    expect(r.zeilen).toHaveLength(0);
    expect(r.meldung).toContain("Zahl");
  });
  test("volle Tabelle", () => {
    let zeilen: Zeile[] = [];
    for (let i = 0; i < MAX_ZEILEN; i++) zeilen = trageEin(g, zeilen, String(i)).zeilen;
    const r = trageEin(g, zeilen, "99");
    expect(r.zeilen).toHaveLength(MAX_ZEILEN);
    expect(r.meldung).toContain("voll");
  });
});

describe("Ungleichung", () => {
  test("kein Treffer und keine Lösung, nur der Vergleich", () => {
    expect(hinweis([probiere(g, 5)], true)).toContain("kippt");
    expect(hinweis([probiere(g, 5)], true)).not.toContain("Lösung");
    expect(hinweis([probiere(g, 2)], true)).toContain("links kleiner");
    expect(hinweis([probiere(g, 6)], true)).toContain("links größer");
  });
  test("die Überschrift ohne Gleichheitszeichen", () => {
    expect(vergleichsText(g)).toBe("3 · x + 4 gegen 19");
  });
});
