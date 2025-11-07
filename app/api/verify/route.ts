import { NextResponse } from "next/server";
import { getCommitHex, getCombinedSeed } from "@/lib/combiner";
import { generateRound } from "@/lib/engine";

// Handles POST /api/verify
export async function POST(request: Request) {
  const body = await request.json();
  const { serverSeed, clientSeed, nonce, dropColumn = 6 } = body;

  const commitHex = getCommitHex(serverSeed, nonce);
  const combinedSeed = getCombinedSeed(serverSeed, clientSeed, nonce);
  const { pegMapHash, binIndex } = generateRound(combinedSeed, 12, Number(dropColumn));

  return NextResponse.json({
    commitHex,
    combinedSeed,
    pegMapHash,
    binIndex,
  });
}
