<script setup lang="ts">
// Waage für Gleichungen a · x + b = c (Kapitel "Rätsel mit Platzhaltern" und "Lineare Gleichungen"): Päckchen (x) und
// Gewichte; Lernende tun auf beiden Seiten dasselbe, bis ein Päckchen allein liegt. Ein Werkzeug zum Ausprobieren,
// keine Aufgabe (GleichungWaage.ts); gespeichert wird nichts. Die Waage bleibt im Gleichgewicht: Jeder Schritt gilt für
// beide Seiten.
import { computed, nextTick, ref, useId } from "vue";
import {
  beschreibung,
  geloest,
  gleichungText,
  grundText,
  hinweis,
  tue,
  type Art,
  type Schritt,
  type Stand,
} from "./GleichungWaage.ts";

const props = defineProps<{
  a: number;
  b: number;
  c: number;
  schrittLabel: string;
  zahlLabel: string;
  minusKnopf: string;
  plusKnopf: string;
  teilenKnopf: string;
  neuAnfangen: string;
  bildLabel: string;
}>();

const start = computed<Stand>(() => ({ a: props.a, b: props.b, c: props.c }));
const stand = ref<Stand>({ ...start.value });
const schritte = ref<Schritt[]>([]);
const eingabe = ref("");
const meldung = ref("");
const id = useId();
const feld = ref<HTMLInputElement | null>(null);

function tun(art: Art): void {
  const n = Number(eingabe.value.trim());
  const ergebnis = tue(stand.value, art, eingabe.value.trim() === "" ? NaN : n);
  meldung.value = ergebnis.meldung;
  if (ergebnis.stand === undefined) return;
  stand.value = ergebnis.stand;
  schritte.value = [...schritte.value, { art, n, stand: ergebnis.stand, grund: grundText(art, n) }];
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

/** Die Dinge auf einer Seite: Päckchen und Gewichte, das Fehlende gestrichelt. */
function dinge(pa: number, gewichte: number): { art: "paeckchen" | "gewicht" | "fehlt"; text: string }[] {
  const liste: { art: "paeckchen" | "gewicht" | "fehlt"; text: string }[] = [];
  for (let i = 0; i < Math.max(pa, 0); i++) liste.push({ art: "paeckchen", text: "x" });
  const n = Math.min(Math.abs(gewichte), MAX);
  for (let i = 0; i < n; i++) liste.push({ art: gewichte < 0 ? "fehlt" : "gewicht", text: gewichte < 0 ? "−1" : "1" });
  return liste;
}

const links = computed(() => dinge(stand.value.a, stand.value.b));
const rechts = computed(() => dinge(0, stand.value.c));
const zuViel = computed(() => Math.abs(stand.value.b) > MAX || Math.abs(stand.value.c) > MAX);
const text = computed(() => beschreibung(stand.value));
const rueckmeldung = computed(() => (meldung.value !== "" ? meldung.value : hinweis(stand.value, schritte.value)));
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
          :rx="d.art === 'paeckchen' ? 3 : 11"
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
          rx="11"
          :class="`waage-${d.art}`"
        />
        <text :x="platz(i, false).x + 10" :y="platz(i, false).y + 15" class="waage-text">{{ d.text }}</text>
      </g>
    </svg>
    <p v-if="zuViel" class="waage-hinweis">
      Es liegen mehr als {{ MAX }} Gewichte: Das Bild zeigt nur die ersten {{ MAX }}.
    </p>
    <p class="waage-gleichung">
      <strong>{{ gleichungText(stand) }}</strong>
    </p>
    <div class="waage-eingabe">
      <label :for="`${id}-n`">{{ zahlLabel }}</label>
      <input :id="`${id}-n`" ref="feld" v-model="eingabe" type="text" inputmode="numeric" autocomplete="off" />
      <button type="button" class="waage-knopf" @click="tun('minus')">{{ minusKnopf }}</button>
      <button type="button" class="waage-knopf" @click="tun('plus')">{{ plusKnopf }}</button>
      <button type="button" class="waage-knopf" @click="tun('geteilt')">{{ teilenKnopf }}</button>
      <button v-if="schritte.length > 0" type="button" class="waage-zweit" @click="neu">{{ neuAnfangen }}</button>
    </div>
    <p class="waage-hinweis" aria-live="polite" :class="{ fertig: geloest(stand) }">{{ rueckmeldung }}</p>
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
.waage-eingabe input {
  font: inherit;
  width: 5rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
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
