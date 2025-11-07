import { createHash } from 'crypto';

export function sha256hex(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}

export function getCommitHex(serverSeed: string, nonce: string) {
  return sha256hex(`${serverSeed}:${nonce}`);
}

export function getCombinedSeed(serverSeed: string, clientSeed: string, nonce: string) {
  return sha256hex(`${serverSeed}:${clientSeed}:${nonce}`);
}
