<script setup lang="ts">
// Tabelle zum Probieren für das Kapitel "Rätsel mit Platzhaltern": zur Gleichung a · x + b = c trägt man Zahlen für x
// ein; die Tabelle rechnet beide Seiten aus und sagt mit Wort und Zeichen, ob links kleiner, gleich oder größer ist.
// Ein Werkzeug zum Ausprobieren, keine Aufgabe (RaetselTabelle.ts); gespeichert wird nichts.
import { computed, nextTick, ref, useId } from "vue";
import {
  gleichungText,
  hinweis,
  trageEin,
  vergleichsText,
  vergleichText,
  zahlText,
  type Zeile,
} from "./RaetselTabelle.ts";

const props = defineProps<{
  a: number;
  b: number;
  c: number;
  eingabeLabel: string;
  eintragen: string;
  neuAnfangen: string;
  spalteX: string;
  spalteLinks: string;
  spalteRechts: string;
  spalteVergleich: string;
  /** Bei true ist es eine Ungleichung: kein Gleichheitszeichen, kein „Lösung“, nur der Vergleich. */
  ungleichung?: boolean;
}>();

const gleichung = computed(() => ({ a: props.a, b: props.b, c: props.c }));
const eingabe = ref("");
const zeilen = ref<Zeile[]>([]);
const meldung = ref("");
const id = useId();

function eintragenKlick(): void {
  const ergebnis = trageEin(gleichung.value, zeilen.value, eingabe.value);
  zeilen.value = ergebnis.zeilen;
  meldung.value = ergebnis.meldung;
  if (ergebnis.meldung === "") eingabe.value = "";
}

const feld = ref<HTMLInputElement | null>(null);

async function neuAnfangenKlick(): Promise<void> {
  zeilen.value = [];
  meldung.value = "";
  eingabe.value = "";
  await nextTick();
  feld.value?.focus();
}

const rueckmeldung = computed(() =>
  meldung.value !== "" ? meldung.value : hinweis(zeilen.value, props.ungleichung === true),
);
</script>

<template>
  <div class="tabelle-probieren">
    <p class="tabelle-gleichung">
      <strong>{{ ungleichung ? vergleichsText(gleichung) : gleichungText(gleichung) }}</strong>
    </p>
    <div class="tabelle-eingabe">
      <label :for="`${id}-x`">{{ eingabeLabel }}</label>
      <input
        :id="`${id}-x`"
        ref="feld"
        v-model="eingabe"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="eintragenKlick"
      />
      <button type="button" class="tabelle-knopf" @click="eintragenKlick">{{ eintragen }}</button>
      <button v-if="zeilen.length > 0" type="button" class="tabelle-zweit" @click="neuAnfangenKlick">
        {{ neuAnfangen }}
      </button>
    </div>
    <p class="tabelle-hinweis" aria-live="polite">{{ rueckmeldung }}</p>
    <div class="tabelle-scroll" tabindex="0" role="region" :aria-label="spalteVergleich">
      <table v-if="zeilen.length > 0" class="tabelle-werte">
        <thead>
          <tr>
            <th scope="col">{{ spalteX }}</th>
            <th scope="col">{{ spalteLinks }}</th>
            <th scope="col">{{ spalteRechts }}</th>
            <th scope="col">{{ spalteVergleich }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(zeile, i) in zeilen" :key="i" :class="{ treffer: zeile.vergleich === 'gleich' }">
            <td>{{ zahlText(zeile.x) }}</td>
            <td>{{ zahlText(zeile.links) }}</td>
            <td>{{ zahlText(zeile.rechts) }}</td>
            <td>{{ vergleichText(zeile.vergleich) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tabelle-eingabe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.tabelle-eingabe input {
  font: inherit;
  width: 6rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.tabelle-knopf,
.tabelle-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.tabelle-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.tabelle-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.tabelle-eingabe input:focus-visible,
.tabelle-knopf:focus-visible,
.tabelle-zweit:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.tabelle-scroll {
  overflow-x: auto;
  margin: 0.75rem 0;
}
.tabelle-werte {
  border-collapse: collapse;
  min-width: 100%;
}
.tabelle-werte th,
.tabelle-werte td {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--page-border);
  text-align: left;
}
.tabelle-werte tr.treffer td {
  background: var(--page-right-background);
  font-weight: 700;
}
.tabelle-hinweis {
  margin: 0.5rem 0 0;
}
</style>
