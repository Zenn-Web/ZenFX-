// jest.server-setup.js — CJS format
// Polyfill Web APIs required by Next.js route handlers in Jest node environment
const { TextEncoder, TextDecoder } = require("util")
Object.assign(global, { TextEncoder, TextDecoder })

// Polyfill fetch/Request/Response/Headers using undici (built into Node 18+)
try {
  const { fetch, Request, Response, Headers } = require("undici")
  Object.assign(global, { fetch, Request, Response, Headers })
} catch (e) {
  // If undici not available, use Node 18 built-in
  if (typeof globalThis.fetch === "undefined") {
    console.warn("fetch polyfill not available — some server tests may fail")
  }
}
