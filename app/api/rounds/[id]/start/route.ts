// app/api/rounds/[id]/start/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Simple deterministic PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Payout table for bins 0-12 (symmetric)
const PAYTABLE = [9, 6, 4, 3, 2, 1.5, 1, 1.5, 2, 3, 4, 6, 9];

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const body = await request.json();
    const clientSeed: string = body.clientSeed ?? "";
    const dropColumn: number = Number(body.dropColumn ?? 6);
    const betCents: number = Number(body.betCents ?? 100);

    // --- validation ---
    if (!clientSeed)
      return NextResponse.json({ error: "clientSeed required" }, { status: 400 });
    if (dropColumn < 0 || dropColumn > 12)
      return NextResponse.json({ error: "dropColumn invalid" }, { status: 400 });
    if (isNaN(betCents) || betCents <= 0)
      return NextResponse.json({ error: "betCents invalid" }, { status: 400 });

    // --- fetch existing round ---
    const round = await prisma.round.findUnique({ where: { id } });
    if (!round || !round.serverSeed) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const { serverSeed, nonce } = round;

    // combined seed
    const combinedSeed = crypto
      .createHash("sha256")
      .update(`${serverSeed}:${clientSeed}:${nonce}`)
      .digest("hex");

    // Seed PRNG from first 4 bytes of combinedSeed (big-endian)
    const seedInt = parseInt(combinedSeed.slice(0, 8), 16);
    const rand = mulberry32(seedInt);

    // --- build deterministic peg map ---
    const rows = 12;
    const pegMap: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let i = 0; i <= r; i++) {
        const leftBias = 0.5 + (rand() - 0.5) * 0.2;
        row.push(Number(leftBias.toFixed(6)));
      }
      pegMap.push(row);
    }
    const pegMapHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(pegMap))
      .digest("hex");

    // --- simulate deterministic path ---
    let pos = 0;
    const path: string[] = [];
    for (let r = 0; r < rows; r++) {
      const peg = pegMap[r][Math.min(pos, r)];
      const adj = (dropColumn - Math.floor(rows / 2)) * 0.01;
      const bias = Math.min(Math.max(peg + adj, 0, 1), 1);
      const rnd = rand();
      if (rnd < bias) path.push("L");
      else {
        path.push("R");
        pos++;
      }
    }
    const binIndex = pos;

    // --- determine payout multiplier ---
    const payoutMultiplier = PAYTABLE[binIndex] ?? 1;

    // --- update DB ---
    const updated = await prisma.round.update({
      where: { id },
      data: {
        clientSeed,
        combinedSeed,
        pegMapHash,
        pathJson: JSON.stringify(path),
        binIndex,
        betCents,
        payoutMultiplier,
        dropColumn,
        status: "STARTED",
      },
    });

    return NextResponse.json({
      roundId: updated.id,
      pegMapHash,
      binIndex,
      payoutMultiplier,
      betCents,
      path,
      rows,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
