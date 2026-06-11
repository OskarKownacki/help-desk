import { prisma } from "@/lib/prisma";
import { prisma as mongodb } from "@/lib/mongodb";

async function main() {
  const room = await prisma.pokoj.create({
    data: {
      name: "101",
      floor: 1,
    },
  });

  await prisma.komputer.create({
    data: {
      name: "PC-001",
      roomId: room.id,
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
