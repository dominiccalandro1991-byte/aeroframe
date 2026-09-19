import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Box,
  Check,
  Layers,
  Pause,
  Play,
  Wrench,
} from "lucide-react";
import {
  FINISHES,
  MATERIALS,
  NAV,
  PROTOCOL,
  PROTOCOL_HOURS,
  derived,
  useAeroframe,
  vnPolygon,
  type ViewState,
} from "@/lib/aeroframe/engine";
import { cn } from "@/lib/utils";

const HangarScene = lazy(() =>
  import("./hangar-scene").then((m) => ({ default: m.HangarScene })),
);

const NAV_ICON: Record<ViewState, typeof Layers> = {
  MATERIALS: Box,
  ASSEMBLY: Wrench,
  RENDER: Layers,
  SIMULATION: Activity,
};

function HangarFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg">
      <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
        Loading mesh
      </p>
    </div>
  );
}

function Viewport() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <HangarFallback />;
  return (
    <Suspense fallback={<HangarFallback />}>
      <HangarScene />
    </Suspense>
  );
}

function VnDiagram() {
  const excluded = useAeroframe((s) => s.excluded);
  const plies = useAeroframe((s) => s.plies);
  const env = useMemo(
    () => derived({ excluded, plies }).env,
    [excluded, plies],
  );
  const pts = vnPolygon(env);
  const maxV = env.vne + 12;
  const maxN = 5.2;
  const minN = -2.8;
  const w = 320;
  const h = 168;
  const pad = { l: 36, r: 10, t: 12, b: 28 };
  const x = (v: number) =>
    pad.l + ((v - 40) / (maxV - 40)) * (w - pad.l - pad.r);
  const y = (n: number) =>
    pad.t + ((maxN - n) / (maxN - minN)) * (h - pad.t - pad.b);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.v).toFixed(1)} ${y(p.n).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full text-live"
      role="img"
      aria-label="V-n diagram"
    >
      <line
        x1={pad.l}
        x2={w - pad.r}
        y1={y(0)}
        y2={y(0)}
        stroke="currentColor"
        strokeOpacity={0.25}
      />
      <line
        x1={pad.l}
        x2={pad.l}
        y1={pad.t}
        y2={h - pad.b}
        stroke="currentColor"
        strokeOpacity={0.25}
      />
      <path d={d} fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeWidth={1.4} />
      <text x={pad.l} y={h - 8} fill="currentColor" fontSize={9} opacity={0.7}>
        KIAS
      </text>
      <text x={4} y={y(env.nPos) + 3} fill="currentColor" fontSize={9} opacity={0.7}>
        +{env.nPos}g
      </text>
      <text x={4} y={y(env.nNeg) + 3} fill="currentColor" fontSize={9} opacity={0.7}>
        {env.nNeg}g
      </text>
    </svg>
  );
}

function MaterialsPanel() {
  const excluded = useAeroframe((s) => s.excluded);
  const toggleLine = useAeroframe((s) => s.toggleLine);
  const finish = useAeroframe((s) => s.finish);
  const setFinish = useAeroframe((s) => s.setFinish);
  const plies = useAeroframe((s) => s.plies);
  const setPlies = useAeroframe((s) => s.setPlies);
  const selected = useAeroframe((s) => s.selectedPart);
  const { env } = derived({ excluded, plies });

  const rows = selected
    ? MATERIALS.filter((m) => m.part === selected || m.part === "airframe")
    : MATERIALS;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-live uppercase">
          1.0 BOM
        </p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-balance">
          Composite matrix
        </h2>
        <p className="mt-1 text-sm text-muted text-pretty">
          Empty {env.emptyKg} kg · MTOW {env.massKg} kg. Select a mesh part or
          omit a line to re-solve the envelope.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Finish</p>
        <div className="grid grid-cols-2 gap-2">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFinish(f.id)}
              aria-pressed={finish === f.id}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-md px-3 text-left text-sm transition-colors duration-150",
                finish === f.id
                  ? "bg-accent text-accent-fg"
                  : "bg-elevated text-muted hover:text-fg",
              )}
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ background: f.hex }}
                aria-hidden
              />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          Ply schedule
          <span className="font-mono text-fg tabular-nums">{plies} ply</span>
        </span>
        <input
          type="range"
          min={4}
          max={10}
          step={1}
          value={plies}
          onChange={(e) => setPlies(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </label>

      <ul className="flex flex-col gap-2">
        {rows.map((line) => {
          const off = Boolean(excluded[line.id]);
          return (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => toggleLine(line.id)}
                aria-pressed={!off}
                className={cn(
                  "w-full rounded-lg border border-border bg-elevated p-3 text-left transition-opacity duration-150",
                  off && "opacity-40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-fg">{line.component}</p>
                  <p className="font-mono text-xs text-muted tabular-nums">
                    {line.massKg} kg
                  </p>
                </div>
                <p className="mt-1 font-mono text-[11px] text-subtle">
                  {line.spec}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {line.qty} · {line.group}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AssemblyPanel() {
  const protocol = useAeroframe((s) => s.protocol);
  const toggleStep = useAeroframe((s) => s.toggleStep);
  const done = PROTOCOL.filter((s) => protocol[s.id]).length;
  const hoursLeft = PROTOCOL.filter((s) => !protocol[s.id]).reduce(
    (n, s) => n + s.hours,
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-live uppercase">
          2.0 VARTM
        </p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-balance">
          Assembly protocol
        </h2>
        <p className="mt-1 text-sm text-muted text-pretty">
          Negative pressure established at 26 inHg. Thermal ramp profile locked
          at 60 °C. {done}/{PROTOCOL.length} gates · {hoursLeft} h remaining of{" "}
          {PROTOCOL_HOURS} h.
        </p>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={PROTOCOL.length}
      >
        <div
          className="h-full bg-live transition-[width] duration-200"
          style={{ width: `${(done / PROTOCOL.length) * 100}%` }}
        />
      </div>
      <ol className="flex flex-col gap-2">
        {PROTOCOL.map((step) => {
          const on = Boolean(protocol[step.id]);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="flex w-full min-h-11 items-start gap-3 rounded-lg border border-border bg-elevated p-3 text-left"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border",
                    on
                      ? "border-live bg-live text-bg"
                      : "border-border text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-subtle">
                      {step.index}
                    </span>
                    <span className="text-sm font-medium text-fg">
                      {step.title}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-muted tabular-nums">
                      {step.hours} h
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-muted text-pretty">
                    {step.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SimulationPanel() {
  const excluded = useAeroframe((s) => s.excluded);
  const plies = useAeroframe((s) => s.plies);
  const running = useAeroframe((s) => s.simRunning);
  const setSimRunning = useAeroframe((s) => s.setSimRunning);
  const env = useMemo(
    () => derived({ excluded, plies }).env,
    [excluded, plies],
  );

  const stats = [
    { k: "Vx", v: `${env.vx.toFixed(0)} KIAS` },
    { k: "Vy", v: `${env.vy.toFixed(0)} KIAS` },
    { k: "Vc", v: `${env.vc.toFixed(0)} KTAS` },
    { k: "Vs", v: `${env.vs.toFixed(0)} KIAS` },
    { k: "Va", v: `${env.va.toFixed(0)} KIAS` },
    { k: "Vne", v: `${env.vne} KIAS` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-live uppercase">
          3.0 Kinematic envelope
        </p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-balance">
          Flight limits
        </h2>
        <p className="mt-1 font-mono text-sm text-muted">
          Vx: {env.vx.toFixed(0)} KIAS · Vy: {env.vy.toFixed(0)} KIAS · Vc:{" "}
          {env.vc.toFixed(0)} KTAS · Load {env.nPos > 0 ? "+" : ""}
          {env.nPos}g / {env.nNeg}g
        </p>
      </div>
      <button
        type="button"
        onClick={() => setSimRunning(!running)}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
      >
        {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        {running ? "Hold envelope" : "Run envelope"}
      </button>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.k}
            className="rounded-md border border-border bg-elevated px-3 py-2"
          >
            <p className="font-mono text-[10px] tracking-wider text-subtle uppercase">
              {s.k}
            </p>
            <p className="font-mono text-sm text-fg tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>
      <VnDiagram />
    </div>
  );
}

function SidePanel() {
  const view = useAeroframe((s) => s.view);
  if (view === "RENDER") return null;
  return (
    <aside className="pointer-events-auto absolute inset-x-0 bottom-28 z-10 max-h-[48%] overflow-y-auto border-t border-border bg-bg/95 p-4 sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:w-[380px] sm:max-h-none sm:border-t-0 sm:border-l">
      {view === "MATERIALS" ? <MaterialsPanel /> : null}
      {view === "ASSEMBLY" ? <AssemblyPanel /> : null}
      {view === "SIMULATION" ? <SimulationPanel /> : null}
    </aside>
  );
}

function Rail() {
  const view = useAeroframe((s) => s.view);
  const setView = useAeroframe((s) => s.setView);
  return (
    <nav
      aria-label="Workstation"
      className="pointer-events-auto z-20 flex items-center justify-around border-t border-border bg-elevated px-2 py-1 max-sm:mb-14 sm:h-full sm:w-16 sm:flex-col sm:justify-start sm:gap-1 sm:border-t-0 sm:border-r sm:px-0 sm:py-4"
    >
      {NAV.map((node) => {
        const Icon = NAV_ICON[node.id];
        const active = view === node.id;
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => setView(node.id)}
            aria-label={node.label}
            aria-pressed={active}
            title={node.hint}
            className={cn(
              "flex size-11 flex-col items-center justify-center rounded-lg transition-colors duration-150",
              active
                ? "bg-accent text-accent-fg"
                : "text-muted hover:bg-surface hover:text-fg",
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
            <span className="sr-only">{node.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function AeroframeApp() {
  const hydrate = useAeroframe((s) => s.hydrate);
  const view = useAeroframe((s) => s.view);
  const excluded = useAeroframe((s) => s.excluded);
  const plies = useAeroframe((s) => s.plies);
  const selected = useAeroframe((s) => s.selectedPart);
  const { env } = derived({ excluded, plies });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="relative flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-bg text-fg sm:flex-row">
      <div className="order-2 sm:order-1 sm:h-full">
        <Rail />
      </div>

      <main className="relative order-1 min-h-0 flex-1 sm:order-2">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-live uppercase">
              Voltcore · VC-4 Lamina
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              AEROFRAME
            </h1>
            <p className="mt-1 max-w-md text-sm text-muted text-pretty">
              Composite airframe workstation — bill of materials, VARTM
              protocol, hangar mesh, kinematic envelope.
            </p>
          </div>
          <dl className="hidden gap-4 sm:flex">
            {[
              { k: "Empty", v: `${env.emptyKg} kg` },
              { k: "MTOW", v: `${env.massKg} kg` },
              { k: "Vc", v: `${env.vc.toFixed(0)} kt` },
            ].map((s) => (
              <div
                key={s.k}
                className="pointer-events-none rounded-md border border-border bg-bg/80 px-3 py-2"
              >
                <dt className="font-mono text-[10px] tracking-wider text-subtle uppercase">
                  {s.k}
                </dt>
                <dd className="font-mono text-sm tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="absolute inset-0">
          <Viewport />
        </div>

        {view === "RENDER" && selected ? (
          <p className="pointer-events-none absolute bottom-6 left-4 z-10 font-mono text-xs tracking-wider text-live uppercase sm:left-6">
            Selected · {selected}
          </p>
        ) : null}

        <SidePanel />
      </main>
    </div>
  );
}
