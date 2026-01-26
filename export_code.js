import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, "codebase_export.txt");
const stream = fs.createWriteStream(outputFile);

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (
        [
          "node_modules",
          ".git",
          "dist",
          "build",
          "bia-tool",
          ".lattice",
          ".cursor",
          ".agent",
          ".Backup",
          "imgs",
          "test-results",
        ].includes(file)
      )
        return;
      walk(filePath);
    } else {
      // Exclude lock files and binary files (simplified check) and the script itself and output
      if (
        [
          "package-lock.json",
          "pnpm-lock.yaml",
          "export_code.js",
          "codebase_export.txt",
        ].includes(file)
      )
        return;
      if (
        file.endsWith(".ico") ||
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".pdf")
      )
        return;

      // Make path relative for cleaner output
      const relativePath = path.relative(__dirname, filePath);

      stream.write(`\n\n--- FILE START: ${relativePath} ---\n\n`);
      try {
        const content = fs.readFileSync(filePath, "utf8");
        stream.write(content);
      } catch (e) {
        stream.write(`[Error reading file: ${e.message}]`);
      }
      stream.write(`\n\n--- FILE END: ${relativePath} ---\n`);
    }
  });
}

console.log("Starting export...");
walk(__dirname);
stream.end(() => {
  console.log(`Export completed to ${outputFile}`);
});
