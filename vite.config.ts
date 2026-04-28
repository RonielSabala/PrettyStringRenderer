import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    hmr: {
      overlay: true,
    },
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
        server.ws.send({
          type: "full-reload",
        });
        return [];
      },
    },
  ],
});
