import { create } from "zustand";

export type ViewState =
  | "MATERIALS"
  | "ASSEMBLY"
  | "RENDER"
  | "SIMULATION";

export type AirframePart =
  | "fuselage"
  | "wing"
  | "empennage"
  | "canopy"
  | "gear"
  | "prop";

export type FinishId = "carbon" | "primer" | "polar" | "graphite";

export interface MaterialLine {
  id: string;
  component: string;
  spec: string;
  qty: string;
  massKg: number;
  group: "Skin" | "Core" | "Resin" | "Hardware";
  part: AirframePart | "airframe";
}

export interface ProtocolStep {
  id: string;
  index: string;
  title: string;
  detail: string;
  hours: number;
}

export interface Finish {
  id: FinishId;
  label: string;
  hex: string;
  roughness: number;
  metalness: number;
}

export const NAV: {
  id: ViewState;
  label: string;
  hint: string;
}[] = [
  { id: "MATERIALS", label: "BOM", hint: "Composite matrix" },
  { id: "ASSEMBLY", label: "Protocol", hint: "VARTM sequence" },
  { id: "RENDER", label: "Mesh", hint: "Airframe inspect" },
  { id: "SIMULATION", label: "Envelope", hint: "Kinematic limits" },
];

export const FINISHES: Finish[] = [
  {
    id: "carbon",
    label: "Bare T700",
    hex: "#3a3e44",
    roughness: 0.42,
    metalness: 0.22,
  },
  {
    id: "primer",
    label: "Titanium primer",
    hex: "#c5ccd4",
    roughness: 0.55,
    metalness: 0.12,
  },
  {
    id: "polar",
    label: "Polar white",
    hex: "#e8ecef",
    roughness: 0.32,
    metalness: 0.08,
  },
  {
    id: "graphite",
    label: "Voltcore graphite",
    hex: "#1b2026",
    roughness: 0.38,
    metalness: 0.18,
  },
];

export const MATERIALS: MaterialLine[] = [
  {
    id: "t700",
    component: "Toray T700 Prepreg Carbon Fiber",
    spec: "UD + 2×2 twill, 200 gsm, 6-ply schedule",
    qty: "86 m²",
    massKg: 112,
    group: "Skin",
    part: "airframe",
  },
  {
    id: "h80",
    component: "Divinycell H80 PVC Foam Core",
    spec: "10 mm sandwich, 80 kg/m³, closed cell",
    qty: "18.4 m²",
    massKg: 41,
    group: "Core",
    part: "wing",
  },
  {
    id: "l285",
    component: "MGS L 285 Epoxy Resin System",
    spec: "H 287 hardener, 100:40, 60 °C post-cure",
    qty: "28 kg",
    massKg: 28,
    group: "Resin",
    part: "airframe",
  },
  {
    id: "spar-cap",
    component: "Spar caps",
    spec: "T700 unidirectional, 12-tow stacked",
    qty: "2",
    massKg: 19,
    group: "Skin",
    part: "wing",
  },
  {
    id: "bulkheads",
    component: "Fuselage bulkheads",
    spec: "T700 / H80 sandwich, 4 stations",
    qty: "4",
    massKg: 16,
    group: "Core",
    part: "fuselage",
  },
  {
    id: "canopy-plex",
    component: "Canopy",
    spec: "Formed polycarbonate, 3 mm, UV hardcoat",
    qty: "1",
    massKg: 9,
    group: "Hardware",
    part: "canopy",
  },
  {
    id: "gear-leg",
    component: "Landing gear",
    spec: "Spring-steel mains + steerable nose",
    qty: "1 set",
    massKg: 22,
    group: "Hardware",
    part: "gear",
  },
  {
    id: "prop",
    component: "Propeller",
    spec: "Two-blade composite, 68 in, ground-adjust",
    qty: "1",
    massKg: 8,
    group: "Hardware",
    part: "prop",
  },
  {
    id: "fasteners",
    component: "AN hardware + inserts",
    spec: "Stainless AN3–AN6, Click-Bond CB200",
    qty: "lot",
    massKg: 6,
    group: "Hardware",
    part: "airframe",
  },
];

export const PROTOCOL: ProtocolStep[] = [
  {
    id: "tool",
    index: "2.1",
    title: "Tool prep",
    detail: "Release wax, bag-side peel ply, leak-check the female mold.",
    hours: 3,
  },
  {
    id: "stack",
    index: "2.2",
    title: "Dry stack",
    detail: "T700 plies + H80 core keyed to the spar stations. Fiber orientation locked.",
    hours: 6,
  },
  {
    id: "bag",
    index: "2.3",
    title: "Bag and seal",
    detail: "Nylon bag, mastic, spiral wrap to the vacuum port.",
    hours: 2,
  },
  {
    id: "vac",
    index: "2.4",
    title: "Vacuum hold",
    detail: "Negative pressure established at 26 inHg. Leak rate < 1 inHg / 5 min.",
    hours: 1,
  },
  {
    id: "infuse",
    index: "2.5",
    title: "Resin infusion",
    detail: "L 285 degassed, inlet clamped at wet-out of the trailing edge.",
    hours: 2,
  },
  {
    id: "cure",
    index: "2.6",
    title: "Thermal ramp",
    detail: "Thermal ramp profile locked at 60 °C. Dwell 8 h, cool < 15 °C/h.",
    hours: 10,
  },
  {
    id: "demold",
    index: "2.7",
    title: "Demold and trim",
    detail: "Flash trim, bond-line inspect, secondary-bond spars and bulkheads.",
    hours: 5,
  },
];

export const PROTOCOL_HOURS = PROTOCOL.reduce((n, s) => n + s.hours, 0);

const WING_AREA_M2 = 10.22;
const RHO = 1.225;
const G = 9.80665;
const KT = 1.943844;
const N_POS = 4.4;
const N_NEG = -2.2;
const REF_MASS = 620;
const STORAGE_KEY = "aeroframe-v1";

export interface Envelope {
  massKg: number;
  emptyKg: number;
  vs: number;
  vso: number;
  va: number;
  vx: number;
  vy: number;
  vc: number;
  vne: number;
  nPos: number;
  nNeg: number;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function bomMassKg(excluded: Record<string, boolean>) {
  return MATERIALS.reduce(
    (sum, line) => (excluded[line.id] ? sum : sum + line.massKg),
    0,
  );
}

/** Laminar Envelope Solver — V-speeds scale with sqrt(W/Wref). */
export function solveEnvelope(emptyKg: number, plyDelta: number): Envelope {
  const empty = emptyKg + plyDelta;
  const massKg = empty + 80 + 155;
  const W = massKg * G;
  const vs = Math.sqrt((2 * W) / (RHO * WING_AREA_M2 * 1.52)) * KT;
  const vso = Math.sqrt((2 * W) / (RHO * WING_AREA_M2 * 2.05)) * KT;
  const scale = Math.sqrt(massKg / REF_MASS);
  return {
    massKg: Math.round(massKg),
    emptyKg: Math.round(empty),
    vs: round1(vs),
    vso: round1(vso),
    va: round1(vs * Math.sqrt(N_POS)),
    vx: round1(75 * scale),
    vy: round1(85 * scale),
    vc: round1(165 * scale),
    vne: 208,
    nPos: N_POS,
    nNeg: N_NEG,
  };
}

export function vnPolygon(env: Envelope) {
  const { vs, va, vc, vne, nPos, nNeg } = env;
  return [
    { v: vs, n: 1 },
    { v: va, n: nPos },
    { v: vne, n: nPos },
    { v: vne, n: 0 },
    { v: vne, n: nNeg * 0.5 },
    { v: vc, n: nNeg },
    { v: vs * 1.15, n: nNeg * 0.4 },
    { v: vs, n: 1 },
  ];
}

interface AeroState {
  view: ViewState;
  selectedPart: AirframePart | null;
  finish: FinishId;
  plies: number;
  excluded: Record<string, boolean>;
  protocol: Record<string, boolean>;
  simRunning: boolean;
  setView: (view: ViewState) => void;
  selectPart: (part: AirframePart | null) => void;
  setFinish: (finish: FinishId) => void;
  setPlies: (plies: number) => void;
  toggleLine: (id: string) => void;
  toggleStep: (id: string) => void;
  setSimRunning: (running: boolean) => void;
  hydrate: () => void;
}

function persist(partial: {
  finish: FinishId;
  plies: number;
  excluded: Record<string, boolean>;
  protocol: Record<string, boolean>;
}) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
  } catch {
    /* ignore quota */
  }
}

export const useAeroframe = create<AeroState>((set, get) => ({
  view: "RENDER",
  selectedPart: null,
  finish: "polar",
  plies: 6,
  excluded: {},
  protocol: {},
  simRunning: false,
  setView: (view) => set({ view }),
  selectPart: (selectedPart) => set({ selectedPart }),
  setFinish: (finish) => {
    set({ finish });
    const s = get();
    persist({
      finish,
      plies: s.plies,
      excluded: s.excluded,
      protocol: s.protocol,
    });
  },
  setPlies: (plies) => {
    set({ plies });
    const s = get();
    persist({
      finish: s.finish,
      plies,
      excluded: s.excluded,
      protocol: s.protocol,
    });
  },
  toggleLine: (id) => {
    const excluded = { ...get().excluded, [id]: !get().excluded[id] };
    if (!excluded[id]) delete excluded[id];
    set({ excluded });
    const s = get();
    persist({
      finish: s.finish,
      plies: s.plies,
      excluded,
      protocol: s.protocol,
    });
  },
  toggleStep: (id) => {
    const protocol = { ...get().protocol, [id]: !get().protocol[id] };
    if (!protocol[id]) delete protocol[id];
    set({ protocol });
    const s = get();
    persist({
      finish: s.finish,
      plies: s.plies,
      excluded: s.excluded,
      protocol,
    });
  },
  setSimRunning: (simRunning) => set({ simRunning }),
  hydrate: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        finish: FinishId;
        plies: number;
        excluded: Record<string, boolean>;
        protocol: Record<string, boolean>;
      }>;
      set({
        finish: parsed.finish ?? "polar",
        plies: typeof parsed.plies === "number" ? parsed.plies : 6,
        excluded: parsed.excluded ?? {},
        protocol: parsed.protocol ?? {},
      });
    } catch {
      /* ignore */
    }
  },
}));

export function derived(state: {
  excluded: Record<string, boolean>;
  plies: number;
}) {
  const empty = bomMassKg(state.excluded);
  const plyDelta = (state.plies - 6) * 9.5;
  const env = solveEnvelope(empty, plyDelta);
  return { env };
}
