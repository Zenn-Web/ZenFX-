// jest.config.js — CommonJS format (project uses Babel, not SWC)
const nextJest = require("next/jest")

const createJestConfig = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.server-setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "<rootDir>/__tests__/unit/**/*.test.ts",
    "<rootDir>/__tests__/integration/**/*.test.ts",
    "<rootDir>/__tests__/api/**/*.test.ts",
    "<rootDir>/__tests__/security/**/*.test.ts",
    "<rootDir>/__tests__/performance/**/*.test.ts",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/e2e/"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "components/slides/**/*.tsx",
    "app/api/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },
}

module.exports = createJestConfig(config)
