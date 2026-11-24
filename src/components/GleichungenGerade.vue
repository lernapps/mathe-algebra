<script setup lang="ts">
// Zahlengerade für das Kapitel "Lineare Gleichungen": zeigt die Lösungsmenge einer Ungleichung (x < 4, x ≥ −2, …) mit
// offenem oder gefülltem Punkt und dem Rand als Text („ohne die 4“). Lernende geben eine Probezahl ein und sehen, ob sie
// dazugehört. Ein Werkzeug zum Ausprobieren, keine Aufgabe (GleichungenGerade.ts); gespeichert wird nichts.
import { computed, ref, useId } from "vue";
import { probiere, zeichne } from "./GleichungenGerade.ts";

const props = defineProps<{
  grenze: number;
  zeichen: "<" | "≤" | ">" | "≥";
  eingabeLabel: string;
  pruefenKnopf: string;
  neuAnfangen: string;
}>();

const eingabe = ref("");
const probe = ref<number | undefined>(undefined);
const meldung = ref("");
const id = useId();

const bild = computed(() =>
  zeichne(props.zeichen, props.grenze, probe.value === undefined ? { platz: true } : { probe: probe.value }),
);

function pruefen(): void {
  const ergebnis = probiere(props.zeichen, props.grenze, eingabe.value);
  meldung.value = ergebnis.meldung;
  probe.value = ergebnis.x;
}

function neu(): void {
  eingabe.value = "";
  probe.value = undefined;
  meldung.value = "";
}

const pfeil = computed(() => {
  const s = bild.value.strahl;
  const y = bild.value.achseY;
  const d = s.richtung === "rechts" ? -9 : 9;
  return `${s.bis},${y} ${s.bis + d},${y - 7} ${s.bis + d},${y + 7}`;
});
const dreieck = computed(() => {
  const p = bild.value.probe;
  if (p === undefined) return "";
  const y = bild.value.achseY;
  return `${p.x},${y - 7} ${p.x - 7},${y - 21} ${p.x + 7},${y - 21}`;
});
</script>

<template>
  <div class="gerade">
    <svg :viewBox="`0 0 ${bild.breite} ${bild.hoehe}`" role="img" :aria-label="bild.label" class="gerade-bild">
      <line :x1="bild.achseVon" :y1="bild.achseY" :x2="bild.achseBis" :y2="bild.achseY" class="gerade-achse" />
      <g v-for="(m, i) in bild.marken" :key="i">
        <line
          :x1="m.x"
          :y1="bild.achseY - 5"
          :x2="m.x"
          :y2="bild.achseY + 5"
          :class="m.null ? 'gerade-strich gerade-null' : 'gerade-strich'"
        />
        <text :x="m.x" :y="bild.achseY + 22" class="gerade-zahl" :class="{ 'gerade-null-text': m.null }">
          {{ m.text }}
        </text>
      </g>
      <line :x1="bild.strahl.von" :y1="bild.achseY" :x2="bild.strahl.bis" :y2="bild.achseY" class="gerade-strahl" />
      <polygon :points="pfeil" class="gerade-pfeil" />
      <circle
        :cx="bild.punkt.x"
        :cy="bild.achseY"
        r="7"
        :class="bild.punkt.gefuellt ? 'gerade-voll' : 'gerade-offen'"
      />
      <text :x="bild.randText.x" :y="34" :text-anchor="bild.randText.anker" class="gerade-rand">
        {{ bild.randText.text }}
      </text>
      <text v-if="bild.mengeText" :x="bild.mengeText.x" y="16" text-anchor="middle" class="gerade-menge">
        {{ bild.mengeText.text }}
      </text>
      <template v-if="bild.probe">
        <polygon :points="dreieck" :class="bild.probe.gilt ? 'gerade-probe-ja' : 'gerade-probe-nein'" />
      </template>
      <text v-if="bild.probe" :x="bild.breite / 2" :y="bild.hoehe - 6" text-anchor="middle" class="gerade-rand">
        {{ bild.probe.text }}
      </text>
    </svg>
    <div class="gerade-eingabe">
      <label :for="`${id}-x`">{{ eingabeLabel }}</label>
      <input
        :id="`${id}-x`"
        v-model="eingabe"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="pruefen"
      />
      <button type="button" class="gerade-knopf" @click="pruefen">{{ pruefenKnopf }}</button>
      <button v-if="probe !== undefined || meldung !== ''" type="button" class="gerade-zweit" @click="neu">
        {{ neuAnfangen }}
      </button>
    </div>
    <p class="gerade-hinweis" aria-live="polite">{{ meldung }}</p>
  </div>
</template>

<style scoped>
.gerade-bild {
  width: 100%;
  max-width: 30rem;
  height: auto;
  display: block;
}
.gerade-achse {
  stroke: var(--page-text);
  stroke-width: 2;
}
.gerade-strich {
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.gerade-null {
  stroke-width: 3;
}
.gerade-zahl {
  font-size: 11px;
  text-anchor: middle;
  fill: var(--page-text);
}
.gerade-null-text {
  font-weight: 700;
}
.gerade-strahl {
  stroke: var(--page-accent);
  stroke-width: 6;
  stroke-linecap: butt;
}
.gerade-pfeil {
  fill: var(--page-accent);
}
.gerade-voll {
  fill: var(--page-accent);
  stroke: var(--page-text);
  stroke-width: 2;
}
.gerade-offen {
  fill: var(--page-background);
  stroke: var(--page-accent);
  stroke-width: 3;
}
.gerade-rand,
.gerade-menge {
  font-size: 13px;
  fill: var(--page-text);
}
.gerade-menge {
  font-weight: 700;
}
.gerade-probe-ja {
  fill: var(--page-right);
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.gerade-probe-nein {
  fill: var(--page-wrong);
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.gerade-eingabe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.gerade-eingabe input {
  font: inherit;
  width: 6rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.gerade-knopf,
.gerade-zweit {
  font: inherit;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  cursor: pointer;
}
.gerade-knopf {
  background: var(--page-accent);
  color: var(--page-on-accent);
}
.gerade-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.gerade-eingabe input:focus-visible,
.gerade-knopf:focus-visible,
.gerade-zweit:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.gerade-hinweis {
  margin: 0.5rem 0 0;
}
</style>
