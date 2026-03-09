// jest-expo SDK 55 loads expo/src/winter at setup time, which installs lazy
// getters for global polyfills. Some of those getters try to load ESM-only
// packages (e.g. @ungap/structured-clone), which crash in Jest's CommonJS env.
// This file runs AFTER jest-expo's setupFiles, so we can replace the lazy
// getters with concrete values before any test code accesses them.

const v8 = require('v8');

// structuredClone: expo tries to load @ungap/structured-clone (ESM-only).
// Use Node 17+'s native v8 implementation instead.
Object.defineProperty(global, 'structuredClone', {
    value: (obj) => v8.deserialize(v8.serialize(obj)),
    writable: true,
    configurable: true,
});

// __ExpoImportMetaRegistry: used for import.meta support — not needed in Jest.
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: {},
    writable: true,
    configurable: true,
});
