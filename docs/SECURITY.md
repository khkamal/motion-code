# Frame-script security

Imported projects are parsed and displayed but not automatically executed. The user must explicitly press Run or start an export.

The validator blocks common network, DOM, navigation, storage, dynamic import and dynamic compilation identifiers. This reduces accidental access, but string construction and language tricks can bypass lexical checks. Preview currently compiles with `Function` in the page and is **not a complete sandbox**. Only run trusted source.

A production hardening milestone is a sandboxed, opaque-origin iframe for preview plus a disposable worker/OffscreenCanvas for rendering, with a message-only API, network-blocking CSP, watchdog termination, CPU limits, and asset transfer by validated bytes. A worker alone is not treated as a security boundary.

SVG assets are not currently imported. When implemented, scripts, event attributes, foreign objects and external references must be removed before decoding.
