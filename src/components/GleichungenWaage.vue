<script setup lang="ts">
// Waage für Gleichungen a · x + b = c · x + d (Kapitel "Lineare Gleichungen"): Päckchen (x) und Gewichte auf beiden
// Schalen; Lernende tun auf beiden Seiten dasselbe, bis ein Päckchen allein liegt. Ein Werkzeug zum Ausprobieren, keine
// Aufgabe (GleichungenWaage.ts); gespeichert wird nichts. Jeder Schritt gilt für beide Seiten, die Waage bleibt im
// Gleichgewicht.
import { computed, nextTick, ref, useId } from "vue";
import {
  beschreibung,
  gleichungText,
  grundText,
  hinweis,
  loesung,
  sonderfall,
  tue,
  type Art,
  type Schritt,
  type Stand,
} from "./GleichungenWaage.ts";

const props = defineProps<{
  a: number;
  b: number;
  c: number;
  d: number;
  schrittLabel: string;
  waehleLabel: string;
  zahlLabel: string;
  tunKnopf: string;
  neuAnfangen: string;
  bildLabel: string;
  opMinusX: string;
  opPlusX: string;
  opMinus: string;
  opPlus: string;
  opTeilen: string;
}>();

const start = computed<Stand>(() => ({ a: props.a, b: props.b, c: props.c, d: props.d }));
const stand = ref<Stand>({ ...start.value });
const schritte = ref<Schritt[]>([]);
const art = ref<Art>("minusX");
const eingabe = ref("");
const meldung = ref("");
const id = useId();
const feld = ref<HTMLInputElement | null>(null);

function tun(): void {
  const text = eingabe.value.trim();
  const n = Number(text);
  const ergebnis = tue(stand.value, art.value, text === "" ? NaN : n);
  meldung.value = ergebnis.meldung;
  if (ergebnis.stand === undefined) return;
  stand.value = ergebnis.stand;
  schritte.value = [...schritte.value, { art: art.value, n, stand: ergebnis.stand, grund: grundText(art.value, n) }];
  eingabe.value = "";
}

async function neu(): Promise<void> {
  stand.value = { ...start.value };
  schritte.value = [];
  meldung.value = "";
  eingabe.value = "";
  await nextTick();
  feld.value?.focus();
}

const GEWICHT = 22;
const MAX = 24;
const SPALTEN = 6;

function platz(i: number, links: boolean): { x: number; y: number } {
  const spalte = i % SPALTEN;
  const zeile = Math.floor(i / SPALTEN);
  return { x: (links ? 20 : 205) + spalte * GEWICHT, y: 100 - zeile * GEWICHT };
}

type Ding = { art: "paeckchen" | "gewicht" | "fehlt"; text: string };

/** Die Dinge auf einer Schale: Päckchen und Gewichte, das Fehlende gestrichelt. */
function dinge(pa: number, gewichte: number): Ding[] {
  const liste: Ding[] = [];
  for (let i = 0; i < Math.min(Math.abs(pa), MAX); i++) {
    liste.push({ art: pa < 0 ? "fehlt" : "paeckchen", text: pa < 0 ? "−x" : "x" });
  }
  for (let i = 0; i < Math.min(Math.abs(gewichte), MAX); i++) {
    liste.push({ art: gewichte < 0 ? "fehlt" : "gewicht", text: gewichte < 0 ? "−1" : "1" });
  }
  return liste.slice(0, MAX);
}

const links = computed(() => dinge(stand.value.a, stand.value.b));
const rechts = computed(() => dinge(stand.value.c, stand.value.d));
const zuViel = computed(
  () =>
    Math.abs(stand.value.a) + Math.abs(stand.value.b) > MAX || Math.abs(stand.value.c) + Math.abs(stand.value.d) > MAX,
);
const text = computed(() => beschreibung(stand.value));
const rueckmeldung = computed(() => (meldung.value !== "" ? meldung.value : hinweis(stand.value, schritte.value)));
const fertig = computed(() => loesung(stand.value) !== undefined || sonderfall(stand.value) !== undefined);
</script>

<template>
  <div class="waage">
    <svg viewBox="0 0 360 150" role="img" :aria-label="`${bildLabel} ${text}`" class="waage-bild">
      <line x1="10" y1="118" x2="350" y2="118" class="waage-balken" />
      <polygon points="170,118 190,118 180,140" class="waage-fuss" />
      <g v-for="(d, i) in links" :key="`l${i}`">
        <rect
          :x="platz(i, true).x"
          :y="platz(i, true).y"
          :width="GEWICHT - 2"
          :height="GEWICHT - 2"
          :rx="d.art === 'gewicht' ? 11 : 3"
          :class="`waage-${d.art}`"
        />
        <text :x="platz(i, true).x + 10" :y="platz(i, true).y + 15" class="waage-text">{{ d.text }}</text>
      </g>
      <g v-for="(d, i) in rechts" :key="`r${i}`">
        <rect
          :x="platz(i, false).x"
          :y="platz(i, false).y"
          :width="GEWICHT - 2"
          :height="GEWICHT - 2"
          :rx="d.art === 'gewicht' ? 11 : 3"
          :class="`waage-${d.art}`"
        />
        <text :x="platz(i, false).x + 10" :y="platz(i, false).y + 15" class="waage-text">{{ d.text }}</text>
      </g>
    </svg>
    <p v-if="zuViel" class="waage-hinweis">
      Es liegen mehr als {{ MAX }} Dinge auf einer Schale: Das Bild zeigt nur die ersten {{ MAX }}.
    </p>
    <p class="waage-gleichung">
      <strong>{{ gleichungText(stand) }}</strong>
    </p>
    <div class="waage-eingabe">
      <label :for="`${id}-art`">{{ waehleLabel }}</label>
      <select :id="`${id}-art`" v-model="art">
        <option value="minusX">{{ opMinusX }}</option>
        <option value="plusX">{{ opPlusX }}</option>
        <option value="minus">{{ opMinus }}</option>
        <option value="plus">{{ opPlus }}</option>
        <option value="geteilt">{{ opTeilen }}</option>
      </select>
      <label :for="`${id}-n`">{{ zahlLabel }}</label>
      <input
        :id="`${id}-n`"
        ref="feld"
        v-model="eingabe"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        @keydown.enter.prevent="tun"
      />
      <button type="button" class="waage-knopf" @click="tun">{{ tunKnopf }}</button>
      <button v-if="schritte.length > 0" type="button" class="waage-zweit" @click="neu">{{ neuAnfangen }}</button>
    </div>
    <p class="waage-hinweis" aria-live="polite" :class="{ fertig }">{{ rueckmeldung }}</p>
    <ol v-if="schritte.length > 0" class="waage-schritte" :aria-label="schrittLabel">
      <li>{{ gleichungText(start) }}</li>
      <li v-for="(s, i) in schritte" :key="i">
        {{ gleichungText(s.stand) }} <span class="waage-grund">({{ s.grund }})</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.waage-bild {
  width: 100%;
  max-width: 28rem;
  height: auto;
  display: block;
}
.waage-balken {
  stroke: var(--page-text);
  stroke-width: 3;
}
.waage-fuss {
  fill: var(--page-text);
}
.waage-paeckchen {
  fill: var(--page-accent);
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.waage-gewicht {
  fill: var(--page-surface);
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.waage-fehlt {
  fill: none;
  stroke: var(--page-text);
  stroke-width: 1.5;
  stroke-dasharray: 3 2;
}
.waage-text {
  font-size: 11px;
  text-anchor: middle;
  fill: var(--page-text);
}
.waage-paeckchen + .waage-text {
  fill: var(--page-on-accent);
}
.waage-eingabe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.waage-eingabe input,
.waage-eingabe select {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.waage-eingabe input {
  width: 5rem;
}
.waage-eingabe select {
  max-width: 100%;
}
.waage-knopf,
.waage-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 0.875rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.waage-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.waage-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.waage-eingabe input:focus-visible,
.waage-eingabe select:focus-visible,
.waage-knopf:focus-visible,
.waage-zweit:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.waage-gleichung,
.waage-hinweis {
  margin: 0.5rem 0;
}
.waage-hinweis.fertig {
  background: var(--page-right-background);
  padding: 0.25rem 0.5rem;
  font-weight: 700;
}
.waage-schritte {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
.waage-grund {
  color: var(--page-muted);
}
</style>
