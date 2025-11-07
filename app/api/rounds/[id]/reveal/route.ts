import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCommitHex } from "@/lib/combiner";

const prisma = new PrismaClient();

// ✅ FIXED version for Next.js 15+/16 with async params
export async function POST(request: Request, context: any) {
  const params = await context.params; // 👈 must await this
  const body = await request.json();
  const serverSeed = body.serverSeed;
  const id = Number(params.id); // now safe to use

  // 1️⃣ Fetch round from DB
  const round = await prisma.round.findUnique({ where: { id } });
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  // 2️⃣ Verify commit hash
  const validCommit = getCommitHex(serverSeed, round.nonce);
  if (validCommit !== round.commitHex) {
    return NextResponse.json({ error: "Invalid reveal" }, { status: 400 });
  }

  // 3️⃣ Save revealed serverSeed and mark status
  await prisma.round.update({
    where: { id },
    data: { serverSeed, status: "REVEALED", revealedAt: new Date() },
  });

  return NextResponse.json({ success: true, roundId: id });
}
