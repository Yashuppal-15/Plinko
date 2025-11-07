import { XorShift32 } from "./rng";
import { sha256hex } from "./combiner";

export function generateRound(combinedSeedHex: string, rows = 12, dropColumn = 6) {
  const seedBytes = Buffer.from(combinedSeedHex, "hex").slice(0, 4);
  const seed32 = seedBytes.readUInt32BE(0);
  const rng = new XorShift32(seed32);
  const pegMap: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let p = 0; p < r + 1; p++) {
      const leftBias = 0.5 + (rng.rand() - 0.5) * 0.2;
      row.push(Number(leftBias.toFixed(6)));
    }
    pegMap.push(row);
  }
  const pegMapHash = sha256hex(JSON.stringify(pegMap));
  let pos = 0;
  const path: ("L" | "R")[] = [];
  for (let r = 0; r < rows; r++) {
    const pegIdx = Math.min(pos, r);
    const leftBias = pegMap[r][pegIdx];
    const adj = (dropColumn - Math.floor(rows / 2)) * 0.01;
    const biasP = Math.min(1, Math.max(0, leftBias + adj));
    const rnd = rng.rand();
    if (rnd < biasP) {
      path.push("L");
    } else {
      path.push("R");
      pos += 1;
    }
  }
  const binIndex = pos;
  return { pegMap, pegMapHash, path, binIndex };
}