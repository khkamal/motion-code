# Rendering and export

## Pipeline

1. Validate composition and source.
2. Estimate frame count, total pixels and decoded-frame memory.
3. Compile the frame function.
4. Render exact integer frame timestamps.
5. PNG: encode the range-start frame using `canvas.toBlob`.
6. WebM: request frames on a captured Canvas stream and collect MediaRecorder chunks.
7. Assemble a Blob, reject an empty output, show metadata and retain the Blob while the result dialog is open.
8. Download through a temporary Blob URL, revoked after 30 seconds.

Cancellation uses `AbortController`, stops recording and never marks a partial output complete. Errors remain visible and are retryable.

## Tiling

`calculateTiles` partitions every pixel exactly once while carrying left/top/right/bottom guard sizes for neighboring effects. Memory estimates use a bounded tile including guards. Core coverage is tested at 15360×8640. The current browser exporter does not yet stream/stitch those tiles into a file; therefore 16K video is not claimed.

## Verification scope

The exporter verifies successful encoder completion, a retrievable non-empty Blob, requested metadata tracked by the render, and no reported missing iteration. Video dimensions are not decoded back from the bitstream yet. “Verified” means pipeline-level, not bitstream-level, verification.
