import { PrismaClient } from '@prisma/client';
import { getAnalyticsSummary } from './src/services/analytics-service';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return console.log("No users");
  const user = users[0];
  console.log("User:", user.email, user.id);
  
  const transactions = await prisma.transaction.findMany({ where: { userId: user.id } });
  console.log("Total transactions:", transactions.length);
  console.log("Transactions:", transactions);
  
  const summary = await getAnalyticsSummary(user.id);
  console.log("Analytics summary:");
  console.log(JSON.stringify(summary, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
