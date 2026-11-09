import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(
    new URL("../package.json", import.meta.url),
    "utf8"
  )
);

// 1. Validate package metadata
assert.equal(pkg.name, "disity");

assert.ok(
  pkg.main,
  "Missing main entry"
);

assert.ok(
  pkg.types,
  "Missing types entry"
);

// 2. Validate generated files
assert.ok(
  existsSync(pkg.main),
  `Missing ${pkg.main}`
);

assert.ok(
  existsSync(pkg.types),
  `Missing ${pkg.types}`
);

// 3. Validate runtime exports
const {
  Container,
  InjectionToken,
  Injectable,
  Inject,
  Singleton,
  Transient,
  Scoped,
} = require("../dist/index.js");

for (const [name, value] of Object.entries({
  Container,
  InjectionToken,
  Injectable,
  Inject,
  Singleton,
  Transient,
  Scoped,
})) {
  assert.equal(
    typeof value,
    "function",
    `Invalid export: ${name}`
  );
}

// 4. Smoke test dependency resolution
const container = new Container();

const API_URL =
  new InjectionToken("API_URL");

container.register(API_URL, {
  useValue: "https://example.com",
});

assert.equal(
  container.resolve(API_URL),
  "https://example.com"
);

// 5. Verify child inheritance
const child = container.createChild();

assert.equal(
  child.resolve(API_URL),
  "https://example.com"
);

console.log(
  "Package validation passed."
);