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

function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return undefined;
  }
  const parts = id.split("node_modules");
  const last = parts[parts.length - 1].replace(/^[\\/]+/, "");
  const [first, second] = last.split("/");
  const pkgName = last.startsWith("@") && second ? `${first}/${second}` : first;

  const is = (...names: string[]) => names.some((n) => pkgName === n);
  const starts = (...prefixes: string[]) =>
    prefixes.some((p) => pkgName.startsWith(p));

  if (
    ["@react-pdf-viewer", "pdfjs-dist"].some((n) => pkgName.startsWith(n))
  ) {
    return "chunk-pdf";
  }
  if (is("react-ace") || pkgName.startsWith("ace-builds")) {
    return "chunk-editor";
  }
  if (
    is("@uiw/react-md-editor", "react-markdown", "katex") ||
    starts(
      "remark",
      "rehype",
      "unified",
      "micromark",
      "mdast",
      "hast",
      "unist",
      "vfile",
      "character-entities",
      "comma-separated-tokens",
      "decode-named-character-reference",
      "html-void-elements",
      "css-selector-parser",
      "style-to-object",
      "inline-style-parser",
      "property-information",
      "space-separated-tokens",
      "stringify-entities",
      "web-namespaces",
      "zwitch",
      "bail",
      "trough",
      "devlop",
      "extend"
    )
  ) {
    return "chunk-markdown";
  }
  if (
    starts("@floating-ui") ||
    is("react-select", "react-dropdown-tree-select", "memoize-one", "use-memo-one")
  ) {
    return "chunk-select";
  }
  if (
    is(
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "react-redux",
      "redux",
      "redux-persist",
      "scheduler",
      "use-sync-external-store",
      "react-is",
      "hoist-non-react-statics"
    )
  ) {
    return "chunk-react";
  }
  if (
    starts("@popperjs") ||
    is(
      "react-toastify",
      "react-paginate",
      "overlayscrollbars"
    )
  ) {
    return "chunk-ui";
  }
  return undefined;
}

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

function backendTarget(env: Record<string, string>): string {
  const host = stripTrailingSlash(env.REACT_APP_DEV_BACKEND_URL || "http://localhost");
  const port = env.REACT_APP_DEV_BACKEND_PORT;
  return port && !/:\d+$/.test(host) ? `${host}:${port}` : host;
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
      proxy: {
        "/api": {
          target: backendTarget(env),
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
    base: "./",
    define,
  };
});