import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

const USER_CONFIG_ID = "userData/profile.json";
const USER_CONFIG_PATH = resolve(__dirname, USER_CONFIG_ID);

const USER_KB_ID = "userData/keybindings.json";
const USER_KB_PATH = resolve(__dirname, USER_KB_ID);

function userFilePlugin(id: string, path: string) {
  const resolved = `\0${id}`;
  return {
    name: `user-file:${id}`,
    resolveId(source: string) {
      if (source.endsWith(id)) {
        return resolved;
      }
    },
    load(loadId: string) {
      if (loadId !== resolved) {
        return;
      }

      const json = existsSync(path) ? readFileSync(path, "utf-8") : "{}";
      return `export default ${json}`;
    },
  };
}

export default defineConfig({
  server: {
    hmr: { overlay: true },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.vscode/**", "**/.git/**"],
    },
  },
  plugins: [
    react(),
    userFilePlugin(USER_CONFIG_ID, USER_CONFIG_PATH),
    userFilePlugin(USER_KB_ID, USER_KB_PATH),
    {
      name: "full-reload",
      handleHotUpdate({ server }) {
        server.ws.send({ type: "full-reload" });
        return [];
      },
    },
  ],
});
