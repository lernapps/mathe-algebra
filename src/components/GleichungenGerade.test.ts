// Use Case: die Lösungsmenge einer linearen Ungleichung auf der Zahlengerade zeigen (Kapitel gleichungen).
// Die Logik von GleichungenGerade.ts: Rand mit/ohne Grenzzahl, Richtung, Probe, Beschriftung und Randfälle.
import { describe, expect, test } from "vite-plus/test";
import {
  beschreibung,
  gilt,
  leseZahl,
  mengeText,
  mitGrenze,
  nachRechts,
  probiere,
  randText,
  skala,
  zahlText,
  zeichne,
  type Zeichen,
} from "./GleichungenGerade.ts";

const ZEICHEN: Zeichen[] = ["<", "≤", ">", "≥"];

describe("Schreibweise", () => {
  test("Minus U+2212 und Komma", () => {
    expect(zahlText(-2)).toBe("−2");
    expect(zahlText(2.5)).toBe("2,5");
    expect(mengeText("≥", -2)).toBe("x ≥ −2");
    expect(mengeText(">", 3)).toBe("x > 3");
  });
  test("der Rand als Text neben der Farbe", () => {
    expect(randText(">", 3)).toBe("ohne die 3");
    expect(randText("≤", -2)).toBe("mit der −2");
  });
  test("Zahlen lesen mit Komma, Punkt und beiden Minuszeichen", () => {
    expect(leseZahl("−2,5")).toBe(-2.5);
    expect(leseZahl("-2.5")).toBe(-2.5);
    expect(leseZahl(" 7 ")).toBe(7);
    expect(leseZahl("")).toBeUndefined();
    expect(leseZahl("abc")).toBeUndefined();
    expect(leseZahl("1/2")).toBeUndefined();
  });
});

describe("gilt", () => {
  test("Rechenprobe an den Rändern: die Grenzzahl gehört nur bei ≤ und ≥ dazu", () => {
    expect(gilt(">", 4, 4)).toBe(false);
    expect(gilt("≥", 4, 4)).toBe(true);
    expect(gilt("<", 4, 4)).toBe(false);
    expect(gilt("≤", 4, 4)).toBe(true);
  });
  test("Richtung", () => {
    expect(gilt(">", 4, 5)).toBe(true);
    expect(gilt(">", 4, 3)).toBe(false);
    expect(gilt("<", -2, -5)).toBe(true);
    expect(gilt("<", -2, 0)).toBe(false);
  });
  test("zu 2x + 3 > 11 gehören genau die Zahlen über 4", () => {
    for (let x = -10; x <= 20; x++) expect(gilt(">", 4, x)).toBe(2 * x + 3 > 11);
  });
  test("zu −2x < 6 gehören genau die Zahlen über −3 (Zeichen gedreht)", () => {
    for (let x = -10; x <= 10; x++) expect(gilt(">", -3, x)).toBe(-2 * x < 6);
  });
  test("mitGrenze und nachRechts", () => {
    expect(ZEICHEN.map(mitGrenze)).toEqual([false, true, false, true]);
    expect(ZEICHEN.map(nachRechts)).toEqual([false, false, true, true]);
  });
});

describe("skala", () => {
  test("Null und Grenzzahl liegen im Ausschnitt, höchstens zwölf Abschnitte", () => {
    for (let g = -60; g <= 60; g++) {
      const s = skala(g);
      expect(s.von).toBeLessThanOrEqual(Math.min(0, g));
      expect(s.bis).toBeGreaterThanOrEqual(Math.max(0, g));
      expect((s.bis - s.von) / s.schritt).toBeLessThanOrEqual(24);
    }
    expect(skala(4)).toEqual({ von: -3, bis: 7, schritt: 1 });
  });
});

describe("zeichne", () => {
  test("offener Punkt bei < und >, gefüllter bei ≤ und ≥", () => {
    expect(ZEICHEN.map((z) => zeichne(z, 3).punkt.gefuellt)).toEqual([false, true, false, true]);
  });
  test("der Strahl zeigt nach rechts bei > und ≥, sonst nach links", () => {
    expect(zeichne(">", 3).strahl.richtung).toBe("rechts");
    expect(zeichne("<", 3).strahl.richtung).toBe("links");
    const rechts = zeichne("≥", 3);
    expect(rechts.strahl.bis).toBeGreaterThan(rechts.punkt.x);
    const links = zeichne("≤", 3);
    expect(links.strahl.bis).toBeLessThan(links.punkt.x);
  });
  test("negative Grenzzahl liegt links der Null", () => {
    const z = zeichne("≤", -2);
    const nullMarke = z.marken.find((m) => m.null);
    expect(nullMarke).toBeDefined();
    expect(z.punkt.x).toBeLessThan(nullMarke!.x);
    expect(z.marken.some((m) => m.text === "−2")).toBe(true);
  });
  test("Marken liegen innerhalb der Zeichnung", () => {
    for (let g = -9; g <= 9; g++)
      for (const m of zeichne(">", g).marken) {
        expect(m.x).toBeGreaterThan(0);
        expect(m.x).toBeLessThan(360);
      }
  });
  test("ohne Ungleichung im Bild, mit Probe, mit Platz", () => {
    expect(zeichne("≥", -2, { menge: false }).mengeText).toBeUndefined();
    expect(zeichne("≥", -2).mengeText?.text).toBe("x ≥ −2");
    const p = zeichne(">", 4, { probe: 5 });
    expect(p.probe?.gilt).toBe(true);
    expect(p.probe?.text).toContain("gehört dazu");
    expect(zeichne(">", 4, { probe: 4 }).probe?.gilt).toBe(false);
    expect(zeichne(">", 4).hoehe).toBeLessThan(p.hoehe);
    expect(zeichne(">", 4, { platz: true }).hoehe).toBe(p.hoehe);
  });
  test("die Textalternative nennt Seite und Rand", () => {
    expect(beschreibung(">", 3)).toContain("rechts der 3");
    expect(beschreibung(">", 3)).toContain("offen");
    expect(beschreibung("≤", -2)).toContain("links der −2");
    expect(beschreibung("≤", -2)).toContain("gefüllt");
    expect(zeichne("≤", -2).label).toBe(beschreibung("≤", -2));
  });
});

describe("probiere", () => {
  test("Zahl in der Lösungsmenge", () => {
    const r = probiere(">", 4, "5");
    expect(r.x).toBe(5);
    expect(r.meldung).toContain("gehört zur Lösungsmenge");
  });
  test("Zahl außerhalb", () => {
    expect(probiere(">", 4, "3").meldung).toContain("gehört nicht zur Lösungsmenge");
    expect(probiere("<", -3, "−1").meldung).toContain("gehört nicht zur Lösungsmenge");
  });
  test("die Grenzzahl selbst, mit Grund", () => {
    expect(probiere(">", 4, "4").meldung).toContain("gehört nicht dazu");
    expect(probiere("≥", 4, "4").meldung).toContain("gehört dazu");
    expect(probiere("≥", 4, "4").meldung).toContain("4 ≥ 4 stimmt");
  });
  test("keine Zahl", () => {
    const r = probiere(">", 4, "hallo");
    expect(r.x).toBeUndefined();
    expect(r.meldung).toContain("Schreib eine Zahl");
  });
  test("Dezimalzahl mit Komma", () => {
    expect(probiere(">", 4, "4,5").x).toBe(4.5);
    expect(probiere("<", -2, "−2,5").meldung).toContain("−2,5");
  });
});
