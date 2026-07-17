import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return console.log("No users");
  const user = users[0];
  console.log("User:", user.email, user.id);
  
  const res = await fetch("http://localhost:3000/api/seed", {
    method: "POST",
    headers: {
      "Cookie": `token=YOUR_JWT_HERE` // Wait, I can't easily mock the JWT for fetch.
    }
  });
  console.log(await res.text());
}

run().catch(console.error).finally(() => prisma.$disconnect());
