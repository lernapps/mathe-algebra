<script setup lang="ts">
// Tabelle zum Vergleichen zweier Terme für das Kapitel "Terme aufstellen und umformen": zwei Terme mit n, die Tabelle
// rechnet für n = 1 bis 6 beide Werte aus und sagt mit Wort und Zeichen, wo sie gleich sind. Man kann die Terme ändern
// und weitere n eintragen. Ein Werkzeug zum Ausprobieren, keine Aufgabe (TermeTabelle.ts); gespeichert wird nichts.
import { computed, nextTick, ref, useId } from "vue";
import {
  ERSTE_ZEILEN,
  leseTermN,
  startZeilen,
  trageEin,
  urteil,
  zahlText,
  zelle,
  zelleRechts,
  zeichenWort,
  zeile,
} from "./TermeTabelle.ts";

const props = defineProps<{
  term1: string;
  term2: string;
  name1: string;
  name2: string;
  feld1: string;
  feld2: string;
  weiteresN: string;
  eintragen: string;
  zuruecksetzen: string;
  spalteN: string;
  tabelleName: string;
}>();

const text1 = ref(props.term1);
const text2 = ref(props.term2);
const weitere = ref<number[]>([]);
const eingabe = ref("");
const meldung = ref("");
const id = useId();
const feld = ref<HTMLInputElement | null>(null);

const gelesen1 = computed(() => leseTermN(text1.value));
const gelesen2 = computed(() => leseTermN(text2.value));
const fehler = computed(() => gelesen1.value.meldung || gelesen2.value.meldung);
const zeilen = computed(() => {
  const links = gelesen1.value.term;
  const rechts = gelesen2.value.term;
  return [...startZeilen(links, rechts), ...weitere.value.map((n) => zeile(links, rechts, n))];
});
const sagt = computed(() => (fehler.value !== "" ? fehler.value : urteil(zeilen.value, false)));

function eintragenKlick(): void {
  const ergebnis = trageEin(gelesen1.value.term, gelesen2.value.term, zeilen.value, eingabe.value);
  meldung.value = ergebnis.meldung;
  if (ergebnis.meldung === "") {
    weitere.value = ergebnis.zeilen.slice(ERSTE_ZEILEN).map((z) => z.n);
    eingabe.value = "";
  }
}

async function zuruecksetzenKlick(): Promise<void> {
  text1.value = props.term1;
  text2.value = props.term2;
  weitere.value = [];
  eingabe.value = "";
  meldung.value = "";
  await nextTick();
  feld.value?.focus();
}
</script>

<template>
  <div class="terme-tabelle">
    <div class="terme-felder">
      <div class="terme-feld">
        <label :for="`${id}-1`">{{ feld1 }}</label>
        <input
          :id="`${id}-1`"
          ref="feld"
          v-model="text1"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>
      <div class="terme-feld">
        <label :for="`${id}-2`">{{ feld2 }}</label>
        <input :id="`${id}-2`" v-model="text2" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />
      </div>
    </div>
    <div class="terme-weiter">
      <label :for="`${id}-n`">{{ weiteresN }}</label>
      <input
        :id="`${id}-n`"
        v-model="eingabe"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="eintragenKlick"
      />
      <button type="button" class="terme-knopf" @click="eintragenKlick">{{ eintragen }}</button>
      <button type="button" class="terme-zweit" @click="zuruecksetzenKlick">{{ zuruecksetzen }}</button>
    </div>
    <p class="terme-hinweis" aria-live="polite">{{ meldung !== "" ? meldung : sagt }}</p>
    <div class="terme-scroll" tabindex="0" role="region" :aria-label="tabelleName">
      <table class="terme-werte">
        <thead>
          <tr>
            <th scope="col">{{ spalteN }}</th>
            <th scope="col">{{ name1 }}</th>
            <th scope="col">{{ name2 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="z in zeilen" :key="z.n" :class="{ gleich: z.gleich }">
            <td>{{ zahlText(z.n) }}</td>
            <td>{{ zelle(z.links) }}</td>
            <td>
              {{ zelleRechts(z) }}<span class="terme-nur-lesen"> ({{ zeichenWort(z) }})</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.terme-felder,
.terme-weiter {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
.terme-feld {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.terme-weiter {
  align-items: center;
}
.terme-tabelle input {
  font: inherit;
  min-height: 2.75rem;
  width: 9rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.terme-weiter input {
  width: 5rem;
}
.terme-knopf,
.terme-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.terme-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.terme-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.terme-tabelle input:focus-visible,
.terme-knopf:focus-visible,
.terme-zweit:focus-visible,
.terme-scroll:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.terme-scroll {
  overflow-x: auto;
  margin: 0.75rem 0;
}
.terme-werte {
  border-collapse: collapse;
  min-width: 100%;
}
.terme-werte th,
.terme-werte td {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--page-border);
  text-align: left;
}
.terme-werte tr.gleich td {
  background: var(--page-right-background);
}
.terme-hinweis {
  margin: 0.5rem 0 0;
}
.terme-nur-lesen {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
