/**
 * Polyfill for React to expose act on React object for React 19 compatibility
 *
 * React 19 moved act from react-dom/test-utils to react package, but doesn't
 * expose it on the React object. @testing-library/react expects React.act to exist.
 *
 * This file is not used directly - the setup.ts file handles attaching act to React.
 */

// This file is kept for reference but the actual polyfill is in setup.ts
export {};
