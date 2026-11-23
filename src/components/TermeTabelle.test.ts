// Use Case: Zwei Terme in einer Tabelle vergleichen (Kapitel terme, Seite terme-aufstellen).
// Die Logik von TermeTabelle.ts: Terme lesen, Werte für n, gleich oder verschieden, weitere Zeilen, das Urteil.
import { describe, expect, test } from "vite-plus/test";
import {
  ERSTE_ZEILEN,
  MAX_ZEILEN,
  leseTermN,
  startZeilen,
  trageEin,
  urteil,
  wert,
  zahlText,
  zeichenWort,
  zeile,
  zelle,
  zelleRechts,
} from "./TermeTabelle.ts";

const lies = (text: string) => leseTermN(text).term;
const lena = lies("4 + 3 · (n − 1)");
const jonas = lies("3n + 1");

describe("leseTermN", () => {
  test("liest Terme mit n, mit Malpunkt und Minus U+2212", () => {
    expect(leseTermN("3n+1").meldung).toBe("");
    expect(leseTermN("4 + 3 · (n − 1)").meldung).toBe("");
    expect(leseTermN("7").meldung).toBe("");
  });
  test("andere Buchstaben und Unleserliches bekommen eine Meldung", () => {
    expect(leseTermN("3x + 1").meldung).toContain("als n, nicht als x");
    expect(leseTermN("3n +").meldung).toContain("unvollständig");
    expect(leseTermN("").meldung).toContain("Term mit n");
  });
});

describe("Werte", () => {
  test("Rechenprobe: 4 + 3 · (n − 1) und 3n + 1 für n = 1 bis 4", () => {
    expect([1, 2, 3, 4].map((n) => wert(lena, n))).toEqual([4, 7, 10, 13]);
    expect([1, 2, 3, 4].map((n) => wert(jonas, n))).toEqual([4, 7, 10, 13]);
  });
  test("Lena und Jonas sind für alle ganzen n von 1 bis 200 gleich (beide Wege zählen dasselbe)", () => {
    for (let n = 1; n <= 200; n++) expect(zeile(lena, jonas, n).gleich, `n = ${n}`).toBe(true);
  });
  test("ohne Wert: Unlesbares und Division durch 0", () => {
    expect(wert(lies("3n +"), 1)).toBeUndefined();
    expect(wert(lies("1 : (n − 2)"), 2)).toBeUndefined();
    expect(zeile(lies("3n +"), jonas, 1).gleich).toBe(false);
    expect(zelle(undefined)).toBe("?");
  });
  test("negative und gebrochene Werte mit Komma und Minus U+2212", () => {
    expect(zelle(wert(lies("n − 5"), 2))).toBe("−3");
    expect(zelle(wert(lies("n : 4"), 1))).toBe("0,25");
  });
});

describe("startZeilen und trageEin", () => {
  test("sechs Zeilen für n = 1 bis 6", () => {
    const zeilen = startZeilen(lena, jonas);
    expect(zeilen.length).toBe(ERSTE_ZEILEN);
    expect(zeilen.map((z) => z.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(zeilen.every((z) => z.gleich)).toBe(true);
  });
  test("ein weiteres n kommt hinten dazu, auch mit Komma", () => {
    const e = trageEin(lena, jonas, startZeilen(lena, jonas), "100");
    expect(e.meldung).toBe("");
    expect(e.zeilen[ERSTE_ZEILEN]).toMatchObject({ n: 100, links: 301, rechts: 301, gleich: true });
    expect(trageEin(lena, jonas, startZeilen(lena, jonas), "2,5").zeilen[ERSTE_ZEILEN]?.n).toBe(2.5);
  });
  test("Meldungen: keine Zahl, doppelt, voll", () => {
    const start = startZeilen(lena, jonas);
    expect(trageEin(lena, jonas, start, "abc").meldung).toContain("Zahl für n");
    expect(trageEin(lena, jonas, start, "3").meldung).toContain("steht schon");
    let zeilen = start;
    for (let n = 10; zeilen.length < MAX_ZEILEN; n++) zeilen = trageEin(lena, jonas, zeilen, String(n)).zeilen;
    expect(trageEin(lena, jonas, zeilen, "99").meldung).toContain("voll");
  });
});

describe("Urteil und Zeichen", () => {
  test("gleich in allen Zeilen: spricht dafür, beweist nicht", () => {
    const t = urteil(startZeilen(lena, jonas), false);
    expect(t).toContain("In allen 6 Zeilen");
    expect(t).toContain("umformst");
  });
  test("2n + 1 und 3n − 1 sind nur bei n = 2 gleich: nicht gleich", () => {
    const zeilen = startZeilen(lies("2n + 1"), lies("3n − 1"));
    expect(zeilen.filter((z) => z.gleich).map((z) => z.n)).toEqual([2]);
    const t = urteil(zeilen, false);
    expect(t).toContain("Gleich bei n = 2");
    expect(t).toContain("verschieden bei n = 1, 3, 4, 5, 6");
    expect(t).toContain("Diese beiden sind es nicht");
  });
  test("in keiner Zeile gleich", () => {
    expect(urteil(startZeilen(lies("2n + 1"), lies("2n + 2")), false)).toContain("nicht gleich");
  });
  test("Zeichen und Wort stehen in der Zelle, nicht nur Farbe", () => {
    const z = zeile(lies("2n + 1"), lies("3n − 1"), 3);
    expect(zelleRechts(z)).toBe("8 ≠");
    expect(zeichenWort(z)).toBe("verschieden");
    const g = zeile(lies("2n + 1"), lies("3n − 1"), 2);
    expect(zelleRechts(g)).toBe("5 =");
    expect(zeichenWort(g)).toBe("gleich");
  });
  test("mit Fehler sagt das Urteil, was zu tun ist; Zahlen mit Komma", () => {
    expect(urteil([], true)).toContain("zwei Terme");
    expect(zahlText(2.5)).toBe("2,5");
  });
});
