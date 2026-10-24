# Animation API

Frame scripts draw a complete Canvas 2D frame. The runtime passes `ctx`, `width`, `height`, `time`, `frame`, `fps`, and immutable `api`. `time` is exactly `frame / fps`, so direct seeking is deterministic.

```js
ctx.fillStyle = '#101827';
ctx.fillRect(0, 0, width, height);
const t = (time % 2) / 2;
ctx.globalAlpha = api.easeInOutCubic(t);
ctx.fillStyle = '#7c5cff';
ctx.beginPath();
ctx.arc(api.lerp(width*.2, width*.8, t), height/2, height*.1, 0, Math.PI*2);
ctx.fill();
```

`api.random(index)` is derived from project seed, frame, and index. Use stable indices for repeatable particles. Do not use `Math.random`, wall clocks, asynchronous work, DOM, storage, or network requests. The validator rejects known unsafe globals and module syntax.

Scripts should scale geometry from `width`/`height`, render the entire frame, and avoid relying on prior calls. Canvas gradients, text, paths, transforms, clips, shadows, compositing, and image-free procedural effects work as normal.
