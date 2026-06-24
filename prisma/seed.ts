import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const match = await prisma.match.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      slug: "demo",
      teamA: "Al Ahly",
      teamB: "Zamalek",
      venue: "Cairo International Stadium",
      kickoffAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
      session: { create: {} },
      chants: {
        create: [
          {
            title: "Ole Ole",
            textAr: "أُولِيه أُولِيه أُولِيه أُولَا",
            textTranslit: "Ole Ole Ole Ola",
            durationSec: 20,
            lettersPerSec: 1.5,
            sortOrder: 0,
          },
          {
            title: "Yalla Yalla",
            textAr: "يَلَّا يَلَّا يَا أَبْطَال",
            textTranslit: "Yalla Yalla Ya Abtal",
            durationSec: 15,
            lettersPerSec: 1.5,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const chants = await prisma.chant.findMany({
    where: { matchId: match.id },
    orderBy: { sortOrder: "asc" },
  });

  // Put the session live on the first chant, a few seconds in, so loading
  // /demo/live immediately demonstrates resuming mid-chant correctly.
  await prisma.liveSession.update({
    where: { matchId: match.id },
    data: {
      status: "live",
      currentChantId: chants[0]?.id,
      startedAt: new Date(Date.now() - 4000),
      nextChantId: chants[1]?.id,
    },
  });

  console.log(`Seeded match "${match.slug}" with ${chants.length} chants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
