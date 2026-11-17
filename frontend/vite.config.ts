import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Bolt's preview proxy injects the port it will reach the app on; honor it.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts: true,
  },
});
