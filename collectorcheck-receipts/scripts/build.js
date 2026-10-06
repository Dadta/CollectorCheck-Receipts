import { accessSync } from "node:fs";

const requiredFiles = [
  "backend/server.js",
  "backend/db/init.js",
  "frontend/index.html",
  "frontend/main.js"
];

let failed = false;

for (const file of requiredFiles) {
  try {
    accessSync(file);
  } catch {
    console.error(`Build check failed: required file not found: ${file}`);
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Build check passed (no compilation step required).");
}