# Rendering and export

## Pipeline

1. Validate composition and source.
2. Estimate frame count, total pixels and decoded-frame memory.
3. Compile the frame function.
4. Render exact integer frame timestamps.
5. PNG still: encode the range-start frame and verify its signature plus IHDR dimensions.
6. PNG sequence: render sequentially, verify each PNG, package frames plus a manifest in a standards-compliant STORE-method ZIP, and verify its central directory. Jobs above the in-memory safety estimate are rejected before rendering.
7. WebM: request frames on a captured Canvas stream, collect MediaRecorder chunks, then load the generated file back into a video element and verify decoded dimensions.
8. Assemble a non-empty Blob, expose actual metadata, and retain it while the result dialog is open.
9. Download through a temporary Blob URL, revoked after 30 seconds.

Cancellation uses `AbortController`, stops recording and never marks a partial output complete. Errors remain visible and are retryable.

## Tiling

`calculateTiles` partitions every pixel exactly once while carrying left/top/right/bottom guard sizes for neighboring effects. Memory estimates use a bounded tile including guards. Core coverage is tested at 15360×8640. The current browser exporter does not yet stream/stitch those tiles into a file; therefore 16K video is not claimed.

## Verification scope

The exporter verifies successful encoder completion, a retrievable non-empty Blob, requested metadata tracked by the render, and no reported missing iteration. Video dimensions are not decoded back from the bitstream yet. “Verified” means pipeline-level, not bitstream-level, verification.

## Geometry safety

Frame scripts receive a Canvas facade shared by preview, seeking, PNG, PNG ZIP, WebM, and MP4. Negative radii use their positive magnitude; non-finite radii and coordinates use zero; alpha and non-negative drawing properties are bounded. Every correction is surfaced in preview or export warnings. Scene dimensions and interpolated values are separately normalized, and zero-sized shapes are skipped.

## MP4

MP4 appears only if `MediaRecorder.isTypeSupported` reports an explicit AVC MIME (`avc1.42E01E` or `avc1.4D401F`). Generated output must have an ISO BMFF `ftyp` box and decode back at requested dimensions. Browsers without this encoder show MP4 disabled. There is no fake extension swap or bundled software fallback.
