import app from "./app";
import { logger } from "./lib/logger";

const preferredPort = Number(process.env.PORT) || 3001;

function startServer(port: number, maxRetries = 5) {
  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "🚀 CampusMart API Server running");
    console.log(`\n========================================`);
    console.log(`  CampusMart API Server`);
    console.log(`  http://localhost:${port}/api/health`);
    console.log(`  Using: Local Laptop JSON Database`);
    console.log(`========================================\n`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  Port ${port} is already in use.`);
      if (maxRetries > 0) {
        const nextPort = port + 1;
        console.log(`🔄 Trying port ${nextPort}...`);
        startServer(nextPort, maxRetries - 1);
      } else {
        console.error("❌ Could not find a free port. Please close other servers and try again.");
        process.exit(1);
      }
    } else {
      logger.error({ err }, "Error starting server");
      process.exit(1);
    }
  });
}

startServer(preferredPort);

