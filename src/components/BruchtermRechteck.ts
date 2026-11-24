// Das Rechteckmodell beim Kürzen (BruchtermRechteck.vue, Kapitel bruchterme): Zähler und Nenner sind je ein Rechteck,
// beide haben dieselbe Seite (den gemeinsamen Faktor). Kürzen nimmt diese Seite weg: Sie wird rot und trägt das Wort
// „gekürzt“, übrig bleibt der schmale Streifen der Höhe 1 mit den anderen Seiten. Gezeichnet wird mit raster() und
// BinomSvg.vue aus dem Kapitel binom.
import { raster, type Zeichnung, type Zelle } from "./BinomFlaeche.ts";

/** Gedachte Längen im Bild (nicht maßstäblich): die gemeinsame Seite, die Seite des Zählers, die Seite des Nenners, die Seite 1. */
export const LAENGE = { faktor: 12, zaehler: 16, nenner: 10, eins: 3 } as const;

export interface Modell {
  /** Der gemeinsame Faktor, z. B. „x + 2“. */
  faktor: string;
  /** Die übrige Seite des Zählers und des Nenners, z. B. „5“ und „3“. */
  zaehler: string;
  nenner: string;
}

export type Teil = "zaehler" | "nenner";

/**
 * Das Rechteck für den Zähler oder den Nenner. Vor dem Kürzen eine Fläche (Faktor mal Rest); danach der gekürzte Teil
 * oben (rot, mit dem Wort `weg`) und der Streifen der Höhe 1 mit dem Rest darunter.
 */
export function rechteck(m: Modell, teil: Teil, gekuerzt: boolean, titel: string, weg = "gekürzt"): Zeichnung {
  const rest = teil === "zaehler" ? m.zaehler : m.nenner;
  const restLaenge = teil === "zaehler" ? LAENGE.zaehler : LAENGE.nenner;
  const farbe = teil === "zaehler" ? "a" : "b";
  const spalten = [{ text: rest, laenge: restLaenge }];
  const faktorZeile = { text: `(${m.faktor})`, laenge: LAENGE.faktor };
  if (!gekuerzt) {
    const zelle: Zelle = { flaeche: farbe, text: `(${m.faktor}) · ${rest}` };
    return raster(spalten, [faktorZeile], [[zelle]], titel, `Fläche: (${m.faktor}) · ${rest}`);
  }
  const oben: Zelle = { flaeche: "minus", text: weg };
  const unten: Zelle = { flaeche: farbe, text: rest };
  return raster(
    spalten,
    [faktorZeile, { text: "1", laenge: LAENGE.eins }],
    [[oben], [unten]],
    titel,
    `Fläche: ${rest}`,
  );
}

/** Was das Bild zeigt, in Worten (für Screenreader und die Tests). */
export function beschreibung(m: Modell, gekuerzt: boolean): string {
  return gekuerzt
    ? `Der gemeinsame Faktor ${m.faktor} ist weggekürzt. Zähler und Nenner sind nur noch ${m.zaehler} und ${m.nenner} lang.`
    : `Zähler und Nenner haben dieselbe Seite ${m.faktor}. Die andere Seite ist ${m.zaehler} beim Zähler und ${m.nenner} beim Nenner.`;
}
