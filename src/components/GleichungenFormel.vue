<script setup lang="ts">
// Übung mit Termeingabe für das Kapitel "Lineare Gleichungen", Seite "Formeln umstellen": zeigt die Formel der
// Aufgabennummer (seed) und liest die getippte rechte Seite mit Vorschau. Sie ist die Eingabe der Aufgabe: Sie gibt
// den Text mit answer weiter (undefined, solange das Feld leer ist); „Prüfen“ und die Rückmeldung kommen vom explainer
// (GleichungenFormel.ts). Nach einer geprüften richtigen Antwort (checked) oder auf Wunsch zeigt sie den Rechenweg.
import { computed, ref, useId, watch } from "vue";
import { antwortAus, check, eingabeHinweis, feldLabel, generate, schrittText, vorschau } from "./GleichungenFormel.ts";

const props = defineProps<{
  seed: number;
  art: "einfach" | "zwei" | "schwer";
  loesungZeigen: string;
  tipp: string;
  rechenweg: string;
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [string | undefined] }>();

const aufgabe = computed(() => generate(props.seed, { art: props.art }));
const antwort = ref("");
const richtig = computed(() => props.checked && check(aufgabe.value, antwort.value));
const falsch = computed(() => props.checked && !richtig.value);
const loesungOffen = ref(false);
const geloest = computed(() => richtig.value || loesungOffen.value);
const id = useId();

/** Der Auftrag in Stücken: einzelne Buchstaben in der Formel kursiv (Variablen), Wörter und Zeichen gerade. */
const auftragTeile = computed(() =>
  aufgabe.value.auftrag
    .split(/(?<![A-Za-zäöüÄÖÜß])([A-Za-z])(?![A-Za-zäöüÄÖÜß])/)
    .filter((t) => t !== "")
    .map((t) => ({ t, kursiv: /^[A-Za-z]$/.test(t) })),
);

watch(antwort, (getippt) => emit("answer", antwortAus(getippt)));
</script>

<template>
  <div class="gleichungen-formel">
    <p>{{ aufgabe.frage }}</p>
    <p class="gleichungen-formel-zeile">
      <template v-for="(teil, i) in auftragTeile" :key="i"
        ><i v-if="teil.kursiv">{{ teil.t }}</i
        ><template v-else>{{ teil.t }}</template></template
      >
    </p>
    <div class="gleichungen-formel-form">
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
      <span :id="`${id}-hinweis`" class="gleichungen-formel-hinweis">{{ eingabeHinweis() }}</span>
      <span class="gleichungen-formel-hinweis" aria-live="polite">{{ vorschau(aufgabe, antwort) }}</span>
      <span v-if="falsch && !geloest" class="gleichungen-formel-knoepfe">
        <button type="button" class="gleichungen-formel-zweit" @click="loesungOffen = true">
          {{ loesungZeigen }}
        </button>
      </span>
    </div>
    <details v-if="!geloest" class="gleichungen-formel-tipp">
      <summary>{{ tipp }}</summary>
      <p>{{ aufgabe.tipp }}</p>
    </details>
    <div v-if="geloest" class="gleichungen-formel-weg">
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
.gleichungen-formel-zeile {
  font-weight: 600;
}
.gleichungen-formel-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 26rem;
}
.gleichungen-formel-form input {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.gleichungen-formel-hinweis {
  color: var(--page-muted);
  font-size: 0.9375rem;
}
.gleichungen-formel-hinweis:empty {
  display: none;
}
.gleichungen-formel-knoepfe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.gleichungen-formel-knoepfe button {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  background: var(--page-accent);
  color: var(--page-on-accent);
  cursor: pointer;
}
.gleichungen-formel-knoepfe .gleichungen-formel-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.gleichungen-formel-form input:focus-visible,
.gleichungen-formel-knoepfe button:focus-visible,
.gleichungen-formel-tipp summary:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.gleichungen-formel-tipp {
  margin: 0.75rem 0 0;
}
.gleichungen-formel-tipp summary {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.gleichungen-formel-weg {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--page-accent);
  background: var(--page-surface);
}
</style>
