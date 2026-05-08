

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DRghZUKx.js","_app/immutable/chunks/Dv6m6HPm.js","_app/immutable/chunks/DEDqjojZ.js"];
export const stylesheets = [];
export const fonts = [];
