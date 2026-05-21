import {prisma} from "@/lib/prisma";

async function main() {
  await prisma.komputer.create({
    data: {
      name: "PC-001",
      room: "101",
      owner: "John Doe",
    },
  });
  console.log("Stworzono testowy komputer.");

}
main().then(async () => {
  await prisma.$disconnect();
} ).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
);