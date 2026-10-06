import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["backend", "frontend", "scripts", "tests"];
const files = [];

function collectJavaScript(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectJavaScript(filePath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(filePath);
    }
  }
}

for (const root of roots) {
  try {
    collectJavaScript(root);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Syntax lint passed for ${files.length} JavaScript files.`);
}