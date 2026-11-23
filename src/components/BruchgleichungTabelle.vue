<script setup lang="ts">
// Tabelle zum Probieren für das Kapitel "Bruchterme und Bruchgleichungen": zu einer Gleichung aus Bruchtermen trägt man
// Zahlen für x ein; die Tabelle rechnet beide Seiten genau aus und zeigt mit Wort und Zeichen, ob sie gleich sind.
// Wird ein Nenner 0, zeigt sie eine Lücke. Ein Werkzeug zum Ausprobieren, keine Aufgabe (BruchgleichungTabelle.ts).
import { computed, nextTick, ref, useId } from "vue";
import { bruchText, gleichungText, hinweis, standText, trageEin, type Zeile } from "./BruchgleichungTabelle.ts";

type Summand = { za: number; zb: number; na: number; nb: number };

const props = defineProps<{
  links: Summand[];
  rechts: Summand[];
  eingabeLabel: string;
  eintragen: string;
  neuAnfangen: string;
  spalteX: string;
  spalteLinks: string;
  spalteRechts: string;
  spalteVergleich: string;
}>();

const gleichung = computed(() => ({ links: props.links, rechts: props.rechts }));
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

function wert(w: Zeile["links"]): string {
  return w === undefined ? "nicht definiert" : bruchText(w);
}

const rueckmeldung = computed(() => (meldung.value !== "" ? meldung.value : hinweis(zeilen.value)));
</script>

<template>
  <div class="bruchtabelle">
    <p class="bruchtabelle-gleichung">
      <strong>{{ gleichungText(gleichung) }}</strong>
    </p>
    <div class="bruchtabelle-eingabe">
      <label :for="`${id}-x`">{{ eingabeLabel }}</label>
      <input
        :id="`${id}-x`"
        ref="feld"
        v-model="eingabe"
        type="text"
        inputmode="text"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="eintragenKlick"
      />
      <button type="button" class="bruchtabelle-knopf" @click="eintragenKlick">{{ eintragen }}</button>
      <button v-if="zeilen.length > 0" type="button" class="bruchtabelle-zweit" @click="neuAnfangenKlick">
        {{ neuAnfangen }}
      </button>
    </div>
    <p class="bruchtabelle-hinweis" aria-live="polite">{{ rueckmeldung }}</p>
    <div v-if="zeilen.length > 0" class="bruchtabelle-scroll" tabindex="0" role="region" :aria-label="spalteVergleich">
      <table class="bruchtabelle-werte">
        <thead>
          <tr>
            <th scope="col">{{ spalteX }}</th>
            <th scope="col">{{ spalteLinks }}</th>
            <th scope="col">{{ spalteRechts }}</th>
            <th scope="col">{{ spalteVergleich }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(zeile, i) in zeilen"
            :key="i"
            :class="{ treffer: zeile.stand === 'gleich', luecke: zeile.stand === 'luecke' }"
          >
            <td>{{ bruchText(zeile.x) }}</td>
            <td>{{ wert(zeile.links) }}</td>
            <td>{{ wert(zeile.rechts) }}</td>
            <td>{{ standText(zeile.stand) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bruchtabelle-eingabe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.bruchtabelle-eingabe input {
  font: inherit;
  width: 6rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.bruchtabelle-knopf,
.bruchtabelle-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.bruchtabelle-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.bruchtabelle-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.bruchtabelle-eingabe input:focus-visible,
.bruchtabelle-knopf:focus-visible,
.bruchtabelle-zweit:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.bruchtabelle-scroll {
  overflow-x: auto;
  margin: 0.75rem 0;
}
.bruchtabelle-werte {
  border-collapse: collapse;
  min-width: 100%;
}
.bruchtabelle-werte th,
.bruchtabelle-werte td {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--page-border);
  text-align: left;
}
.bruchtabelle-werte tr.treffer td {
  background: var(--page-right-background);
  font-weight: 700;
}
.bruchtabelle-werte tr.luecke td {
  background: var(--page-wrong-background);
  font-style: italic;
}
.bruchtabelle-hinweis {
  margin: 0.5rem 0 0;
}
</style>
