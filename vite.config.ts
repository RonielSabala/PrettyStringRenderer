import react from "@vitejs/plugin-react";
import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

const userData = ["userData/profile.json", "userData/keybindings.json"];
for (const file of userData) {
  const path = resolve(__dirname, file);
  if (!existsSync(path)) {
    writeFileSync(path, "{}");
  }
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
    {
      name: "full-reload",
      handleHotUpdate({ server }) {
        server.ws.send({ type: "full-reload" });
        return [];
      },
    },
  ],
});
