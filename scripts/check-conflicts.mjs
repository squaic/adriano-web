import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".next", "node_modules", "out"]);
const textExtensions = new Set([".css", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".yml", ".yaml"]);
const conflictMarker = /^(?:<{7}|={7}|>{7})(?:\s|$)/m;
const conflicts = [];

async function inspect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (textExtensions.has(extname(entry.name))) {
      const content = await readFile(path, "utf8");
      if (conflictMarker.test(content)) conflicts.push(relative(root, path));
    }
  }
}

await inspect(root);

if (conflicts.length) {
  console.error(`Marqueurs de conflit Git détectés :\n${conflicts.map(path => `- ${path}`).join("\n")}`);
  process.exit(1);
}

console.log("Aucun marqueur de conflit Git détecté.");
