<script setup lang="ts">
// Rechteckmodell für das Kürzen (Kapitel "Bruchterme und Bruchgleichungen"): Zähler und Nenner als zwei Rechtecke mit
// derselben Seite. „Kürzen“ nimmt die gemeinsame Seite weg, „Zurück“ zeigt sie wieder. Zeichnet mit BinomSvg.vue
// (Kapitel binom); ein Werkzeug zum Anschauen, keine Aufgabe (BruchtermRechteck.ts).
import { computed, ref } from "vue";
import BinomSvg from "./BinomSvg.vue";
import { beschreibung, rechteck } from "./BruchtermRechteck.ts";

const props = defineProps<{
  faktor: string;
  zaehler: string;
  nenner: string;
  titelZaehler: string;
  titelNenner: string;
  kuerzen: string;
  zurueck: string;
  weg: string;
}>();

const gekuerzt = ref(false);
const modell = computed(() => ({ faktor: props.faktor, zaehler: props.zaehler, nenner: props.nenner }));
const bildZaehler = computed(() => rechteck(modell.value, "zaehler", gekuerzt.value, props.titelZaehler, props.weg));
const bildNenner = computed(() => rechteck(modell.value, "nenner", gekuerzt.value, props.titelNenner, props.weg));
const text = computed(() => beschreibung(modell.value, gekuerzt.value));
</script>

<template>
  <div class="br-modell">
    <div class="br-bilder">
      <BinomSvg :zeichnung="bildZaehler" class="br-bild" />
      <BinomSvg :zeichnung="bildNenner" class="br-bild" />
    </div>
    <p class="br-text" aria-live="polite">{{ text }}</p>
    <button type="button" class="br-knopf" :aria-pressed="gekuerzt" @click="gekuerzt = !gekuerzt">
      {{ gekuerzt ? zurueck : kuerzen }}
    </button>
  </div>
</template>

<style scoped>
.br-bilder {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.br-bild {
  flex: 1 1 14rem;
  min-width: 0;
  max-width: 20rem;
}
.br-text {
  margin: 0.5rem 0;
}
.br-knopf {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  background: var(--page-accent);
  color: var(--page-on-accent);
  cursor: pointer;
}
.br-knopf:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
</style>
