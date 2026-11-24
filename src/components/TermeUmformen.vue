<script setup lang="ts">
// Übung mit Termeingabe für das Kapitel "Terme aufstellen und umformen": zeigt die Aufgabe der Aufgabennummer (seed),
// liest den getippten Term mit Vorschau und bietet die Probe mit Zahlen an (Wertetabelle: Aufgabe und eigener Term bei
// drei Belegungen). Sie ist die Eingabe der Aufgabe: Sie gibt den Term mit answer weiter (undefined, solange das Feld
// leer ist); „Prüfen“ und die Rückmeldung kommen vom explainer (TermeUmformen.ts). Bei Faktor mal Klammer mit Plus
// zeigt sie das Rechteckmodell (BinomSvg.vue, Zeichnung aus TermeBilder.ts). Nach einer geprüften richtigen Antwort
// (checked) oder auf Wunsch zeigt sie den Rechenweg.
import { computed, ref, useId, watch } from "vue";
import BinomSvg from "./BinomSvg.vue";
import { faktorBild } from "./TermeBilder.ts";
import {
  antwortAus,
  check,
  eingabeHinweis,
  feldLabel,
  generate,
  probe,
  schrittText,
  vorschau,
} from "./TermeUmformen.ts";

const props = defineProps<{
  seed: number;
  art: "gleichartig" | "gemischt" | "zweivariablen" | "plusminus" | "faktor" | "kombiniert";
  loesungZeigen: string;
  tipp: string;
  rechenweg: string;
  probeZeigen: string;
  probeVerbergen: string;
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [string | undefined] }>();

const aufgabe = computed(() => generate(props.seed, { art: props.art }));
const antwort = ref("");
const richtig = computed(() => props.checked && check(aufgabe.value, antwort.value));
const falsch = computed(() => props.checked && !richtig.value);
const loesungOffen = ref(false);
const geloest = computed(() => richtig.value || loesungOffen.value);
const bild = computed(() => {
  const b = aufgabe.value.bild;
  return b === undefined ? undefined : faktorBild(b.a, b.k, b.c, b.variable, geloest.value);
});
const probeOffen = ref(false);
const zeilen = computed(() => probe(aufgabe.value, antwort.value));
const id = useId();

watch(antwort, (getippt) => emit("answer", antwortAus(getippt)));
</script>

<template>
  <div class="terme-aufgabe">
    <p>
      {{ aufgabe.frage }} <strong class="terme-term">{{ aufgabe.term }}</strong>
    </p>
    <BinomSvg v-if="bild" :zeichnung="bild" />
    <div class="terme-form">
      <label :for="`${id}-antwort`">{{ feldLabel(aufgabe) }}</label>
      <input
        :id="`${id}-antwort`"
        v-model="antwort"
        type="text"
        inputmode="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :aria-describedby="`${id}-hinweis`"
      />
      <span :id="`${id}-hinweis`" class="terme-hinweis">{{ eingabeHinweis(aufgabe) }}</span>
      <span class="terme-hinweis" aria-live="polite">{{ vorschau(antwort) }}</span>
      <span class="terme-knoepfe">
        <button type="button" class="terme-zweit" :aria-expanded="probeOffen" @click="probeOffen = !probeOffen">
          {{ probeOffen ? probeVerbergen : probeZeigen }}
        </button>
        <button v-if="falsch && !geloest" type="button" class="terme-zweit" @click="loesungOffen = true">
          {{ loesungZeigen }}
        </button>
      </span>
    </div>
    <div v-if="probeOffen" class="terme-probe">
      <table v-if="zeilen.length > 0">
        <caption>
          Probe mit Zahlen: Gleiche Werte in einer Zeile heißen noch nicht, dass der Term stimmt, aber verschiedene
          Werte zeigen sicher einen Fehler.
        </caption>
        <thead>
          <tr>
            <th scope="col">Zahlen</th>
            <th scope="col">Aufgabe</th>
            <th scope="col">Dein Term</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="zeile in zeilen" :key="zeile.belegung">
            <th scope="row">{{ zeile.belegung }}</th>
            <td>{{ zeile.aufgabe }}</td>
            <td>{{ zeile.antwort }} ({{ zeile.gleich ? "gleich" : "nicht gleich" }})</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="terme-hinweis">Schreib erst einen Term, dann rechnet die Tabelle für dich.</p>
    </div>
    <details v-if="!geloest" class="terme-tipp">
      <summary>{{ tipp }}</summary>
      <p>{{ aufgabe.tipp }}</p>
    </details>
    <div v-if="geloest" class="terme-weg">
      <p>
        <strong>{{ rechenweg }}</strong> {{ aufgabe.ergebnis }}
      </p>
      <ol>
        <li v-for="(schritt, i) in aufgabe.schritte" :key="i">{{ schrittText(schritt) }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.terme-term {
  white-space: nowrap;
}
.terme-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 26rem;
}
.terme-form input {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.terme-hinweis {
  color: var(--page-muted);
  font-size: 0.9375rem;
}
.terme-hinweis:empty {
  display: none;
}
.terme-knoepfe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.terme-knoepfe button {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-accent);
  cursor: pointer;
}
.terme-form input:focus-visible,
.terme-knoepfe button:focus-visible,
.terme-tipp summary:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.terme-probe {
  margin: 0.75rem 0 0;
  max-width: 26rem;
  overflow-x: auto;
}
.terme-probe table {
  border-collapse: collapse;
  width: 100%;
}
.terme-probe caption {
  text-align: left;
  color: var(--page-muted);
  font-size: 0.9375rem;
  padding-bottom: 0.25rem;
}
.terme-probe th,
.terme-probe td {
  border: 1px solid var(--page-border);
  padding: 0.25rem 0.5rem;
  text-align: left;
}
.terme-tipp {
  margin: 0.75rem 0 0;
}
.terme-tipp summary {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.terme-weg {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--page-accent);
  background: var(--page-surface);
}
</style>
