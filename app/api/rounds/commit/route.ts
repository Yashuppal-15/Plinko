import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { getCommitHex } from "@/lib/combiner";

const prisma = new PrismaClient();

// Handles POST /api/rounds/commit
export async function POST() {
  // 1️⃣ Create random serverSeed (private to server)
  const serverSeed = crypto.randomBytes(32).toString("hex");

  // 2️⃣ Create a nonce (unique number)
  const nonce = Date.now().toString();

  // 3️⃣ Compute commit hash using serverSeed + nonce
  const commitHex = getCommitHex(serverSeed, nonce);

  // 4️⃣ Store round in database
  const round = await prisma.round.create({
    data: { serverSeed, nonce, commitHex },
  });

  // 5️⃣ Return public info (not serverSeed!)
  return NextResponse.json({
    roundId: round.id,
    commitHex,
    nonce,
  });
}
