<script setup lang="ts">
// Übung mit Termeingabe für das Kapitel "Terme aufstellen und umformen": zeigt die Aufgabe der Aufgabennummer (seed) und
// liest den getippten Term mit Vorschau. Sie ist die Eingabe der Aufgabe: Sie gibt den Term mit answer weiter
// (undefined, solange das Feld leer ist); „Prüfen“ und die Rückmeldung kommen vom explainer (TermeAufstellen.ts).
// Nach einer geprüften richtigen Antwort (checked) oder auf Wunsch zeigt sie den Rechenweg.
import { computed, ref, useId, watch } from "vue";
import { antwortAus, check, eingabeHinweis, generate, vorschau } from "./TermeAufstellen.ts";

const props = defineProps<{
  seed: number;
  art: "kette" | "preis";
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

watch(antwort, (getippt) => emit("answer", antwortAus(getippt)));
</script>

<template>
  <div class="terme-aufgabe">
    <p>{{ aufgabe.text }}</p>
    <div class="terme-form">
      <label :for="`${id}-antwort`">{{ aufgabe.feld }}</label>
      <input
        :id="`${id}-antwort`"
        v-model="antwort"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :aria-describedby="`${id}-hinweis`"
      />
      <span :id="`${id}-hinweis`" class="terme-hinweis">{{ eingabeHinweis }}</span>
      <span class="terme-hinweis" aria-live="polite">{{ vorschau(antwort) }}</span>
      <span v-if="falsch && !geloest" class="terme-knoepfe">
        <button type="button" @click="loesungOffen = true">{{ loesungZeigen }}</button>
      </span>
    </div>
    <details v-if="!geloest" class="terme-tipp">
      <summary>{{ tipp }}</summary>
      <p>{{ aufgabe.tipp }}</p>
    </details>
    <div v-if="geloest" class="terme-weg">
      <p>
        <strong>{{ rechenweg }}</strong> {{ aufgabe.anzeige }}
      </p>
      <ol>
        <li v-for="(schritt, i) in aufgabe.schritte" :key="i">{{ schritt }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
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
