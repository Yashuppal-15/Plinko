import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getCommitHex } from "@/lib/combiner";

export async function POST() {
  try {
    const serverSeed = crypto.randomBytes(32).toString("hex");
    const nonce = Date.now().toString();
    const commitHex = getCommitHex(serverSeed, nonce);
    const round = await prisma.round.create({
      data: {
        serverSeed, nonce, commitHex,
        clientSeed: null, combinedSeed: null, pegMapHash: null,
        pathJson: null, binIndex: null, betCents: null,
        payoutMultiplier: null, dropColumn: null, status: "CREATED",
      },
    });
    return NextResponse.json({ roundId: round.id, commitHex, nonce });
  } catch (err: any) {
    console.error("POST /api/rounds/commit error:", err);
    return NextResponse.json({ error: "Failed to create round", details: err.message }, { status: 500 });
  }
}