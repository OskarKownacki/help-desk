import { prisma } from "@/lib/prisma";
import { prisma as mongodb } from "@/lib/mongodb";

async function main() {
  await prisma.komputer.create({
    data: {
      name: "PC-001",
      room: "101",
      owner: "John Doe",
    },
  });
  console.log("Stworzono testowy komputer.");
  await mongodb.ticket.create({
    data: {
      title: "Testowy ticket",
      content: "To jest testowy ticket.",
      author: "Jane Doe",
    },
  });
  console.log("Stworzono testowy ticket.");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
