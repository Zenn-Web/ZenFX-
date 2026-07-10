/**
 * Server-side Jest setup: polyfill Web APIs required by Next.js route handlers.
 * `Request`, `Response`, `Headers`, `fetch` are available in Next.js edge/node
 * runtime but not in plain Jest node environment.
 */
import { TextEncoder, TextDecoder } from "util"

// Polyfill TextEncoder/TextDecoder
Object.assign(global, { TextEncoder, TextDecoder })

// Polyfill fetch, Request, Response, Headers using undici (bundled with Node 18+)
const { fetch, Request, Response, Headers } = require("undici")
Object.assign(global, { fetch, Request, Response, Headers })
