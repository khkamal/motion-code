let counter = 0;

/** Short, collision-resistant id (monotonic counter + random suffix). */
export function uid(prefix = 'id'): string {
  counter = (counter + 1) % 0xffffff;
  const rand = Math.floor(Math.random() * 0x1000000).toString(36);
  return `${prefix}_${counter.toString(36)}${rand}`;
}

/** Deterministic id derived from a string — used for imported/preset nodes. */
export function stableId(prefix: string, input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${prefix}_${(h >>> 0).toString(36)}`;
}
