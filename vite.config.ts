import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve(process.cwd(), "src");

function resolveAliases() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
  const depNames = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  const aliases: { find: string | RegExp; replacement: string }[] = [];
  const filePriority: Record<string, number> = {
    ".tsx": 0,
    ".ts": 1,
    ".jsx": 2,
    ".js": 3,
    ".mjs": 4,
  };
  const baseAliases = new Map<string, { priority: number; replacement: string }>();

  for (const entry of fs.readdirSync(srcDir)) {
    const full = path.join(srcDir, entry);
    const fullUrl = full.split(path.sep).join("/");
    if (fs.statSync(full).isDirectory()) {
      if (depNames.has(entry)) {
        aliases.push({ find: new RegExp(`^${entry}\\/`), replacement: `${fullUrl}/` });
      } else {
        aliases.push({ find: entry, replacement: fullUrl });
      }
    } else {
      const ext = path.extname(entry);
      aliases.push({ find: entry, replacement: fullUrl });
      if (ext in filePriority) {
        const base = path.basename(entry, ext);
        const priority = filePriority[ext];
        const current = baseAliases.get(base);
        if (!current || priority < current.priority) {
          baseAliases.set(base, { priority, replacement: fullUrl });
        }
      }
    }
  }

  for (const [base, { replacement }] of baseAliases.entries()) {
    aliases.push({ find: base, replacement });
  }
  return aliases;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const define = {
    "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    ...Object.fromEntries(
      Object.keys(env)
        .filter((key) => key.startsWith("REACT_APP_"))
        .map((key) => [`process.env.${key}`, JSON.stringify(env[key] ?? "")])
    ),
  };

  return {
    plugins: [react()],
    resolve: {
      alias: resolveAliases(),
    },
    server: {
      port: 3000,
      host: true,
    },
    css: {
      preprocessorOptions: {
        scss: { includePaths: [srcDir] },
        sass: { includePaths: [srcDir] },
      },
    },
    build: {
      outDir: "dist",
    },
    define,
  };
});