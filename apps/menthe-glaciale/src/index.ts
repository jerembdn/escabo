process.on("SIGINT", () => {
  console.info("SIGINT signal received: closing cron service");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received: closing cron service");
  process.exit(0);
});
