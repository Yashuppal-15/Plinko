-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "nonce" TEXT NOT NULL,
    "commitHex" TEXT NOT NULL,
    "serverSeed" TEXT,
    "clientSeed" TEXT,
    "combinedSeed" TEXT,
    "pegMapHash" TEXT,
    "pathJson" TEXT,
    "binIndex" INTEGER,
    "betCents" INTEGER,
    "payoutMultiplier" DOUBLE PRECISION,
    "dropColumn" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revealedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);
