"use strict";

const app = require("./app");
const { sequelize } = require("./models");
const logger = require("./utils/logger");
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connection established successfully.");

    // Sync models (use migrations in production)
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    logger.info("Database models synchronized.");

    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
      );
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();
