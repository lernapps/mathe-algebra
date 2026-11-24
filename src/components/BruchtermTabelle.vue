<script setup lang="ts">
// Tabelle für das Kapitel "Bruchterme und Bruchgleichungen": zum Bruchterm (a · x + b) : (c · x + d) trägt man ganze
// Zahlen für x ein; links steht der Bruchterm mit eingesetztem x, rechts das Ergebnis, bei Nenner 0 der Text
// „nicht definiert“ (nicht nur eine Farbe). Ein Werkzeug zum Ausprobieren, keine Aufgabe (BruchtermTabelle.ts).
import { computed, h, nextTick, onMounted, ref, useId, type FunctionalComponent } from "vue";
import { hinweis, linText, startZeilen, trageEin, zeichen, type Wert, type Zeile } from "./BruchtermTabelle.ts";
import { zahlText } from "./RaetselTabelle.ts";

const props = defineProps<{
  a: number;
  b: number;
  c: number;
  d: number;
  start: number[];
  eingabeLabel: string;
  eintragen: string;
  neuAnfangen: string;
  spalteX: string;
  spalteTerm: string;
  spalteErgebnis: string;
  nichtDefiniert: string;
  nennerNull: string;
}>();

const term = computed(() => ({ a: props.a, b: props.b, c: props.c, d: props.d }));
const eingabe = ref("");
const zeilen = ref<Zeile[]>(startZeilen(term.value, props.start));
const startAnzahl = zeilen.value.length;
const meldung = ref("");
const id = useId();
const feld = ref<HTMLInputElement | null>(null);

function eintragenKlick(): void {
  const ergebnis = trageEin(term.value, zeilen.value, eingabe.value);
  zeilen.value = ergebnis.zeilen;
  meldung.value = ergebnis.meldung;
  if (ergebnis.meldung === "") eingabe.value = "";
}

async function neuAnfangenKlick(): Promise<void> {
  zeilen.value = startZeilen(term.value, props.start);
  meldung.value = "";
  eingabe.value = "";
  await nextTick();
  feld.value?.focus();
}

// Brüche als MathML (ein <math> je Bruch). Erst nach dem Einhängen im Browser: Die Seite zählt ihre Formeln, und
// die Tabelle ist im ersten Aufbau (Server und Browser gleich) nur Text; das Werkzeug ist ohne JavaScript verborgen.
const bereit = ref(false);
onMounted(() => {
  bereit.value = true;
});
const Bruch: FunctionalComponent<{ zaehler: string; nenner: string; mathe: boolean }> = (p) =>
  p.mathe
    ? h("math", { display: "inline" }, [
        h("mfrac", [
          h(
            "mrow",
            zeichen(p.zaehler).map((z) => h(z.art, z.t)),
          ),
          h(
            "mrow",
            zeichen(p.nenner).map((z) => h(z.art, z.t)),
          ),
        ]),
      ])
    : h("span", `(${p.zaehler}) : (${p.nenner})`);

const rueckmeldung = computed(() => (meldung.value !== "" ? meldung.value : hinweis(zeilen.value)));
const ganz = (w: Wert): boolean => w.q === 1;
</script>

<template>
  <div class="bt-tabelle">
    <p class="bt-term">
      <Bruch :zaehler="linText(a, b)" :nenner="linText(c, d)" :mathe="bereit" />
    </p>
    <div class="bt-eingabe">
      <label :for="`${id}-x`">{{ eingabeLabel }}</label>
      <input
        :id="`${id}-x`"
        ref="feld"
        v-model="eingabe"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="eintragenKlick"
      />
      <button type="button" class="bt-knopf" @click="eintragenKlick">{{ eintragen }}</button>
      <button v-if="zeilen.length > startAnzahl" type="button" class="bt-zweit" @click="neuAnfangenKlick">
        {{ neuAnfangen }}
      </button>
    </div>
    <p class="bt-hinweis" aria-live="polite">{{ rueckmeldung }}</p>
    <div class="bt-scroll" tabindex="0" role="region" :aria-label="spalteErgebnis">
      <table class="bt-werte">
        <thead>
          <tr>
            <th scope="col">{{ spalteX }}</th>
            <th scope="col">{{ spalteTerm }}</th>
            <th scope="col">{{ spalteErgebnis }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(zeile, i) in zeilen" :key="i" :class="{ luecke: zeile.wert === undefined }">
            <td>{{ zahlText(zeile.x) }}</td>
            <td>
              <Bruch :zaehler="zeile.zaehlerText" :nenner="zeile.nennerText" :mathe="bereit" />
            </td>
            <td>
              <template v-if="zeile.wert === undefined">
                <strong>{{ nichtDefiniert }}</strong>
                <span class="bt-klein"> ({{ nennerNull }})</span>
              </template>
              <template v-else-if="ganz(zeile.wert)">{{ zahlText(zeile.wert.p) }}</template>
              <template v-else>
                <span v-if="zeile.wert.p < 0">−</span>
                <Bruch :zaehler="zahlText(Math.abs(zeile.wert.p))" :nenner="zahlText(zeile.wert.q)" :mathe="bereit" />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bt-term {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
.bt-eingabe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.bt-eingabe input {
  font: inherit;
  width: 6rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.bt-knopf,
.bt-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.bt-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.bt-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.bt-eingabe input:focus-visible,
.bt-knopf:focus-visible,
.bt-zweit:focus-visible,
.bt-scroll:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.bt-scroll {
  overflow-x: auto;
  margin: 0.75rem 0;
}
.bt-werte {
  border-collapse: collapse;
  min-width: 100%;
}
.bt-werte th,
.bt-werte td {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--page-border);
  text-align: left;
  vertical-align: middle;
}
.bt-werte tr.luecke td {
  background: var(--page-wrong-background);
  border-style: dashed;
}
.bt-klein {
  font-size: 0.875rem;
}
.bt-hinweis {
  margin: 0.5rem 0 0;
}
</style>
