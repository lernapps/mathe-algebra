// Use Case: Bruchterme kürzen – das Rechteckmodell (Kapitel bruchterme).
// Prüft das Bild von BruchtermRechteck.ts: dieselbe gemeinsame Seite vor dem Kürzen, danach nur noch die übrigen Seiten.
import { describe, expect, test } from "vite-plus/test";
import { LAENGE, beschreibung, rechteck } from "./BruchtermRechteck.ts";

const modell = { faktor: "x + 2", zaehler: "5", nenner: "3" };

const texte = (z: ReturnType<typeof rechteck>): string[] => z.formen.filter((f) => f.art === "text").map((f) => f.text);
const felder = (z: ReturnType<typeof rechteck>) => z.formen.filter((f) => f.art === "rect");

describe("rechteck", () => {
  test("vor dem Kürzen steht der gemeinsame Faktor an beiden Rechtecken", () => {
    for (const teil of ["zaehler", "nenner"] as const) {
      const t = texte(rechteck(modell, teil, false, "Titel"));
      expect(t).toContain("(x + 2)");
      expect(t).toContain("(x + 2) · " + (teil === "zaehler" ? "5" : "3"));
    }
  });
  test("nach dem Kürzen ist der Faktor rot und trägt das Wort, darunter der Streifen der Höhe 1", () => {
    const z = rechteck(modell, "zaehler", true, "Titel", "weg");
    expect(texte(z)).toContain("weg");
    expect(texte(z)).toContain("1");
    expect(texte(z).join("|")).not.toContain("·");
    expect(felder(z).map((f) => f.flaeche)).toEqual(["minus", "a"]);
  });
  test("das Rechteck bleibt gleich groß: der Streifen ist so hoch wie das Bild minus die gekürzte Seite, die Breite bleibt", () => {
    for (const teil of ["zaehler", "nenner"] as const) {
      const vorher = felder(rechteck(modell, teil, false, "T"))[0]!;
      const [weg, streifen] = felder(rechteck(modell, teil, true, "T"));
      expect(weg!.w).toBe(vorher.w);
      expect(streifen!.w).toBe(vorher.w);
      expect(streifen!.h).toBeLessThan(weg!.h);
      expect(weg!.h + streifen!.h).toBeCloseTo(vorher.h, 0);
    }
  });
  test("Rechenprobe: Zähler und Nenner haben vorher und nachher das gleiche Seitenverhältnis des Rests, der Faktor kürzt sich", () => {
    // gedachte Längen: Zähler 16 · 12, Nenner 10 · 12; gekürzt 16 · 3 und 10 · 3. Das Verhältnis der Flächen bleibt.
    const verhaeltnisVorher = (LAENGE.zaehler * LAENGE.faktor) / (LAENGE.nenner * LAENGE.faktor);
    const verhaeltnisNachher = (LAENGE.zaehler * LAENGE.eins) / (LAENGE.nenner * LAENGE.eins);
    expect(verhaeltnisNachher).toBeCloseTo(verhaeltnisVorher, 10);
    // Der Wert des Bruchterms (x + 2) · 5 : ((x + 2) · 3) ist für jedes x außer −2 fünf Drittel.
    for (let x = -10; x <= 10; x++) {
      if (x === -2) continue;
      expect(((x + 2) * 5) / ((x + 2) * 3)).toBeCloseTo(5 / 3, 10);
    }
  });
  test("das Bild hat einen Namen für Screenreader", () => {
    expect(rechteck(modell, "zaehler", false, "Zähler").label).toContain("Zähler");
    expect(rechteck(modell, "zaehler", false, "Zähler").hoehe).toBeGreaterThan(0);
  });
});

describe("beschreibung", () => {
  test("nennt vor dem Kürzen den Faktor, danach die Reste", () => {
    expect(beschreibung(modell, false)).toContain("dieselbe Seite x + 2");
    expect(beschreibung(modell, true)).toContain("weggekürzt");
    expect(beschreibung(modell, true)).toContain("nur noch 5 und 3");
  });
});
