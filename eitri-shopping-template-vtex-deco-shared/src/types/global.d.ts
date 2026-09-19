export {}

// window.__eitriAppConf is already declared (as `any`) by eitri-bifrost's own Bifrost.d.ts —
// redeclaring it here with a tighter shape conflicts ("all declarations must have identical
// modifiers"). Consumers cast the specific fields they read instead.
