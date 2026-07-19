/** Best-effort tactile feedback for touch devices; silently degrades elsewhere. */
export function tapHaptic(durationMs = 15): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(durationMs);
}
