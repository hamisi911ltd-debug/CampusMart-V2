#!/usr/bin/env node
/**
 * Picks a free port (starting at 5001) and runs API + Vite with matching
 * PORT and VITE_API_URL so the stack survives EADDRINUSE from stale processes.
 */
import getPort from "get-port";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = await getPort({ port: 5001 });
const env = {
  ...process.env,
  PORT: String(port),
  VITE_API_URL: `http://localhost:${port}`,
  CAMPUSMART_PORT: process.env.CAMPUSMART_PORT ?? "5173",
};

console.log(`[dev] API → http://localhost:${port} (VITE_API_URL set for the app)\n`);

const child = spawn(
  "pnpm",
  ["--parallel", "--filter", "@workspace/api-server", "--filter", "@workspace/campusmart", "run", "dev"],
  { cwd: root, env, stdio: "inherit" },
);

function forward(signal) {
  try {
    child.kill(signal);
  } catch {
    /* ignore */
  }
}
process.on("SIGINT", () => forward("SIGINT"));
process.on("SIGTERM", () => forward("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
