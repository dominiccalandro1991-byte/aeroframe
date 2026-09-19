# AEROFRAME

VOLTCORE composite airframe workstation.

Four DFA stations:

1. **BOM** — T700 / Divinycell H80 / MGS L 285 matrix, ply schedule, finish
2. **Protocol** — VARTM sequence (26 inHg, 60 °C ramp)
3. **Mesh** — hangar inspect of the VC-4 Lamina airframe
4. **Envelope** — Laminar Envelope Solver (Vx / Vy / Vc, V-n diagram)

Click a mesh part to isolate its BOM lines. Omit a material line or change ply count to re-solve empty weight and V-speeds.

```
npm install
npm run dev
```
