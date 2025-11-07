"use client";

import { useState, useRef } from "react";
import axios from "axios";
import confetti from "canvas-confetti";

export default function Home() {
  const [round, setRound] = useState<any>(null);
  const [clientSeed, setClientSeed] = useState("");
  const [dropColumn, setDropColumn] = useState(6);
  const [betCents, setBetCents] = useState(100);
  const [serverSeedInput, setServerSeedInput] = useState("");
  const [verifyRes, setVerifyRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);

  const pegSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  const PAYTABLE = [9, 6, 4, 3, 2, 1.5, 1, 1.5, 2, 3, 4, 6, 9];

  function playSound(ref: React.RefObject<HTMLAudioElement | null>) {
    if (!muted && ref.current) {
      try {
        ref.current.currentTime = 0;
        ref.current.play();
      } catch {
        // ignore playback errors
      }
    }
  }

  async function createRound() {
    try {
      setLoading(true);
      console.log("Creating round...");
      
      const res = await axios.post("/api/rounds/commit");
      console.log("Commit response:", res.data);
      
      setRound({
        roundId: res.data.roundId,
        commitHex: res.data.commitHex,
        nonce: res.data.nonce,
      });
      
      setVerifyRes(null);
      alert("✅ Round created! Now click 'Start Round'");
    } catch (err: any) {
      console.error("Create error:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function startRound() {
    if (!round?.roundId) return alert("⚠️ Create a round first!");
    try {
      setLoading(true);
      console.log("Starting round...");
      
      const res = await axios.post(`/api/rounds/${round.roundId}/start`, {
        clientSeed: clientSeed || Math.random().toString(36),
        dropColumn: Number(dropColumn),
        betCents: Number(betCents),
      });

      console.log("Start response:", res.data);
      
      setRound((prev: any) => ({
        ...prev,
        ...res.data,
        binIndex: res.data.binIndex,
        payoutMultiplier: res.data.payoutMultiplier,
        pegMapHash: res.data.pegMapHash,
        path: res.data.path,
      }));

      for (let i = 0; i < 12; i++) {
        setTimeout(() => playSound(pegSoundRef), i * 150);
      }

      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
        playSound(winSoundRef);
      }, 1900);

      alert(`✅ Game Complete! Landed in bin ${res.data.binIndex}, Payout: ${res.data.payoutMultiplier}x`);
    } catch (err: any) {
      console.error("Start error:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function revealRound() {
    if (!round?.roundId) return alert("⚠️ Create a round first!");
    if (!serverSeedInput) return alert("⚠️ Enter serverSeed from Prisma Studio!");
    
    try {
      setLoading(true);
      console.log("Revealing round...");
      
      const res = await axios.post(`/api/rounds/${round.roundId}/reveal`, {
        serverSeed: serverSeedInput,
      });
      
      console.log("Reveal response:", res.data);
      alert("✅ Reveal successful!\n" + JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.error("Reveal error:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!round) return alert("⚠️ No round to verify!");
    if (!serverSeedInput) return alert("⚠️ Enter serverSeed!");
    
    try {
      setLoading(true);
      console.log("Verifying round...");
      
      const res = await axios.post("/api/verify", {
        serverSeed: serverSeedInput,
        clientSeed: clientSeed || "",
        nonce: round.nonce,
        dropColumn: Number(dropColumn),
      });
      
      console.log("Verify response:", res.data);
      setVerifyRes(res.data);
    } catch (err: any) {
      console.error("Verify error:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center py-8 px-4 space-y-6">
      <div className="flex justify-between items-center w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-blue-400">🎯 Plinko Fair Game</h1>
        <button
          onClick={() => setMuted((m) => !m)}
          className="text-sm border border-gray-600 px-3 py-1 rounded hover:bg-gray-800"
        >
          {muted ? "🔇 Muted" : "🔊 Sound On"}
        </button>
      </div>

      <p className="text-gray-400 text-sm text-center max-w-md">
        A provably fair Plinko engine with commit–reveal, deterministic RNG, and reproducible results.
      </p>

      <div className="flex flex-wrap justify-center items-center gap-3 w-full max-w-3xl mt-4">
        <button
          onClick={createRound}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md shadow"
        >
          {loading ? "Processing..." : "🎲 Create Round"}
        </button>

        <input
          placeholder="Client Seed (auto-generated if empty)"
          value={clientSeed}
          onChange={(e) => setClientSeed(e.target.value)}
          className="border p-2 rounded text-black bg-white w-48"
        />

        <input
          type="number"
          min="0"
          max="12"
          value={dropColumn}
          onChange={(e) => setDropColumn(Number(e.target.value))}
          className="border p-2 rounded text-black bg-white w-24"
          placeholder="Column"
        />

        <input
          type="number"
          min="10"
          value={betCents}
          onChange={(e) => setBetCents(Number(e.target.value))}
          className="border p-2 rounded text-black bg-white w-32"
          placeholder="Bet (¢)"
        />

        <button
          onClick={startRound}
          disabled={loading || !round}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          ▶️ Start Round
        </button>
      </div>

      {round && (
        <div className="w-full max-w-3xl p-4 border border-gray-700 rounded-md bg-gray-900">
          <h2 className="font-semibold mb-2 text-lg text-gray-200">Current Round</h2>
          <pre className="text-sm text-black bg-white p-3 rounded-md overflow-auto">
            {JSON.stringify(round, null, 2)}
          </pre>
        </div>
      )}

      <div className="w-full max-w-3xl bg-gray-800 rounded-md p-4">
        <h3 className="text-center font-semibold mb-2 text-gray-300">
          💰 Paytable (Bin → Multiplier)
        </h3>
        <div className="grid grid-cols-13 text-center text-sm">
          {PAYTABLE.map((p, i) => (
            <div
              key={i}
              className="border border-gray-700 py-1 rounded-sm bg-gray-900 text-gray-200"
            >
              <div className="text-xs text-gray-400">Bin {i}</div>
              <div className="font-semibold">{p}x</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3 w-full max-w-3xl">
        <input
          placeholder="Paste serverSeed (from Prisma Studio)"
          value={serverSeedInput}
          onChange={(e) => setServerSeedInput(e.target.value)}
          className="border p-2 rounded text-black bg-white w-[400px]"
        />
        <button
          onClick={revealRound}
          disabled={loading || !round}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black px-4 py-2 rounded-md"
        >
          🧩 Reveal
        </button>
        <button
          onClick={verify}
          disabled={loading || !round}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          ✅ Verify
        </button>
      </div>

      {verifyRes && (
        <div className="w-full max-w-3xl p-4 border border-gray-700 rounded-md bg-gray-900 text-white">
          <h2 className="font-semibold mb-2 text-lg text-gray-200">Verification Result</h2>
          <pre className="text-sm text-black bg-white p-3 rounded-md overflow-auto">
            {JSON.stringify(verifyRes, null, 2)}
          </pre>
        </div>
      )}

      <audio ref={pegSoundRef} src="/sounds/peg-tick.mp3" preload="auto" />
      <audio ref={winSoundRef} src="/sounds/win-chime.mp3" preload="auto" />
    </main>
  );
}