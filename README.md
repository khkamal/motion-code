# Motion Studio

A browser-first, code-driven motion-graphics editor built with React, TypeScript, Canvas 2D, IndexedDB, MediaRecorder, and Vite. It opens directly into an editable workspace and works without an account, backend, or AI key.

## What works

- Deterministic frame scripts with direct seeking, playback, validation, frame stepping, a timeline, and editable presets.
- Composition presets from HD through 16K target, seven aspect-ratio presets, custom dimensions, 1–120 fps, render ranges, background/alpha, seed, pixel aspect, and loop controls.
- Real client-side WebM recording when `MediaRecorder` provides VP8/VP9, and real lossless PNG still export.
- Every successful export yields a non-empty Blob, metadata, in-dialog video preview (for video), verification state, and a real Download button.
- Render progress, current/total frames, cancellation, errors, retry, and resource warnings.
- IndexedDB project persistence; JSON project import/export does not auto-run imported code.
- Carbon dark, Studio light, and Midnight themes; accent, density, and reduced-motion preferences.
- Responsive desktop/tablet interface and keyboard operation.
- Deterministic random utility, easing/interpolation, keyframes core, high-resolution tile planner with guards, and bounded-memory estimates.

## Quick start

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the displayed URL. Node 18.18+ is required (Node 22 is used in CI/development).

### Commands

```bash
npm run dev          # Vite development server
npm run typecheck    # strict TypeScript check
npm test             # all automated unit/high-resolution algorithm tests
npm run test:unit    # core tests
npm run test:hirez   # tile-planner tests under Node
npm run build        # production build to dist/
npm run preview      # preview production build
npm run test:e2e     # Playwright tests when browser binaries are installed
```

## User workflow

1. Edit the sample JavaScript in **Frame script**, or select a template.
2. Press **Run**. Space plays/pauses; arrows step frames.
3. Click the resolution in the stage toolbar for composition settings.
4. Save locally (Ctrl/Cmd+S) or open **Projects** to restore an IndexedDB project.
5. Choose **Export**, select WebM or PNG, and start the export.
6. Inspect the actual filename, codec/MIME, dimensions, duration, frame count, and size, then click **Download real file**.

## Architecture

- `src/core`: versioned project types, composition/time/math utilities, serialization.
- `src/animation`: code contract, validation/runtime, easing-backed keyframes.
- `src/rendering`: browser capability model, resource estimate, tile planner, PNG/WebM exporter.
- `src/projects`: native IndexedDB persistence.
- `src/themes`: token-driven persisted workspace preferences.
- `src/App.tsx`: workspace, stage, editor, timeline, dialogs, project/export flows.
- `tests`: math, validation, determinism, serialization and high-resolution tile coverage.
- `docs`: animation API, rendering/export architecture, and security model.

State has one `Project` model. Composition settings drive preview, timeline, estimates, and export. Frame N always receives `time = N / fps`; no playback history is an input.

## Animation API

A frame script receives lexical variables:

```ts
ctx: CanvasRenderingContext2D
width: number
height: number
time: number      // frame / fps
frame: number
fps: number
api: {
  clamp, lerp, easeInOutCubic, alpha,
  random(index?: number): number // deterministic from project seed + frame
}
```

Draw one complete frame. Do not accumulate state between invocations. See [docs/ANIMATION_API.md](docs/ANIMATION_API.md).

## Export support

| Format | Availability | Notes |
|---|---|---|
| WebM VP9/VP8 | Capability detected | MediaRecorder + manual frame requests; codec chosen from browser support. |
| PNG | Canvas 2D browsers | Lossless still at render-range start; alpha supported. |
| MP4/H.264 | Not exposed | Browsers do not reliably provide an MP4 recorder/portable muxer. The UI does not fake it. |
| PNG sequence archive | Not yet implemented | Use still PNG; a streaming ZIP worker is future work. |

WebM timing uses browser `MediaRecorder`; exact container timing and maximum dimensions remain browser/codec dependent. Output verification checks non-empty retrieval and completed assembly. It does **not** claim bitstream-level validation.

## High-resolution status

The editor accepts up to 16384 px per axis and contains a tested tile planner (default 2048 px tiles, 32 px effect guards). At 15360×8640, tile coverage and bounded tile memory are unit tested. The estimator reports decoded-frame, tile and total pixel workload and warns about common codec limits.

**16K is a target, not claimed as verified video export.** A full 16K browser video was not run in ordinary CI or on representative hardware. Canvas/codec maximums vary. PNG still export may work where the browser permits a 15360×8640 canvas, but the current exporter still assembles that one full canvas. Tiled frame-to-file streaming/stitching is not yet implemented, so the planner alone does not make 16K video safe. Use WebM at dimensions accepted by your browser; for extreme dimensions prefer a future streaming image-sequence path. Blur/shadow guard pixels are planned, but arbitrary script effects cannot be proven tile-safe.

## Browser support

Current Chromium desktop is recommended. Firefox typically supports WebM but lacks manual `requestFrame` in some releases. Safari support depends on its advertised MediaRecorder MIME types. PNG, editing, and IndexedDB are broadly available. Exports require the tab to remain active; browser background throttling can affect long recordings.

## AI provider setup

The AI panel is intentionally optional and currently provides configuration guidance rather than a network adapter. No key is bundled. Never place private keys in `VITE_*` variables: Vite exposes them to clients. A future provider adapter should keep a key in session memory by default, explain persistence explicitly, and show code/assets before sending them. Core operation has no AI dependency.

## Project format

`.motion.json` is UTF-8 JSON with `schemaVersion`, metadata, composition, code, scene nodes, assets metadata, and versions. Binary assets are intended for IndexedDB and are not embedded today. Import performs structural validation and imported frame code only runs after explicit **Run**.

## Keyboard shortcuts

- Space: play/pause
- Left/Right: previous/next frame
- Ctrl/Cmd+S: save locally
- Tab/Shift+Tab: standard focus traversal

## Deploy

### Vercel

Import the repository. Framework preset: **Vite**; build command: `npm run build`; output directory: `dist`. `vercel.json` is included.

### GitHub Pages / subpath

```bash
VITE_BASE=/motion-code/ npm run build
```

Publish `dist/`. The app does not use client-side routes, so no SPA rewrite is needed.

### Any static host

Run `npm run build` and serve `dist/` over HTTPS. No application server is required.

## Troubleshooting

- **WebM unavailable:** choose PNG; the browser did not advertise a supported WebM MediaRecorder codec.
- **Export is slow:** lower dimensions/fps/duration. Recording intentionally renders each requested frame instead of hiding work.
- **Canvas is blank:** press Validate and inspect the visible script error.
- **Project save fails:** private browsing or storage quota may disable IndexedDB; export project JSON immediately.
- **16K fails:** this is an actual browser/device limit, not silently downscaled. Choose 8K/4K or a supported image workflow.

## Known limitations

Scene-object inspector/layer manipulation, asset import, worker-isolated execution, multi-file PNG sequences, MP4 muxing, audio, AI provider calls, render-history persistence, and fully streamed tile stitching are not implemented. Preview compilation runs dynamic script code in the page after an explicit action; restricted token validation is defense-in-depth, not a complete security boundary. Do not run untrusted scripts. See [docs/SECURITY.md](docs/SECURITY.md).

## License

MIT. Runtime dependencies are React and React DOM (MIT); build/test tools retain their own licenses.
