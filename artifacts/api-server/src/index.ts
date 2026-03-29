import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT) || 5001;

// Only start the server when not running in Vercel's serverless environment
if (!process.env.VERCEL) {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

// Export for Vercel serverless function
export default app;
