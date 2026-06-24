-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "kickoffAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textTranslit" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 60,
    "lettersPerSec" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Chant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "matchId" TEXT NOT NULL,
    "currentChantId" TEXT,
    "startedAt" TIMESTAMP(3),
    "nextChantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("matchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- AddForeignKey
ALTER TABLE "Chant" ADD CONSTRAINT "Chant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
