// Polyfill for Edge Runtime environment where __dirname and __filename are not defined
if (typeof (globalThis as any).__dirname === "undefined") {
  (globalThis as any).__dirname = "/";
}
if (typeof (globalThis as any).__filename === "undefined") {
  (globalThis as any).__filename = "/index.js";
}
export {};
