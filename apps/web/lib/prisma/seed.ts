import { prisma } from "./client";

const main = async () => {
  //TODO - Upsert default ladders (all QueueType values)
};

main()
  .then(async () => {
    console.info("Seeding completed successfully.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
