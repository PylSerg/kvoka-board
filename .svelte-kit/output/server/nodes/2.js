

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BP92lHt-.js","_app/immutable/chunks/Dv6m6HPm.js","_app/immutable/chunks/DEDqjojZ.js"];
export const stylesheets = ["_app/immutable/assets/2.DE6Ao8ov.css"];
export const fonts = [];
