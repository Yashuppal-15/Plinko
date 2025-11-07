# 🎯 Plinko Lab (Provably Fair Game)
**Daphnis Labs — Full Stack Developer Intern Take-Home Assignment**

An interactive Plinko game demonstrating:
- ✅ Provably fair commit–reveal RNG
- ✅ Deterministic, seed-replayable outcome engine
- ✅ Responsive UI/UX with animation, sound, and confetti
- ✅ Public verifier page to reproduce results exactly

---

## 🚀 Tech Stack
**Frontend:** Next.js 14 (App Router), React, Tailwind CSS  
**Backend:** Next.js API routes, Prisma ORM  
**Database:** SQLite (local) / PostgreSQL (optional)  
**Hash / PRNG:** SHA-256 (crypto) + xorshift32 deterministic PRNG  

---

## 🧠 Features
| Feature | Description |
|----------|--------------|
| 🎲 Commit-Reveal Protocol | Implements commitHex = SHA256(serverSeed + ":" + nonce) and combinedSeed = SHA256(serverSeed + ":" + clientSeed + ":" + nonce) |
| 🧩 Deterministic Engine | Fully replayable peg map and path using xorshift32 PRNG |
| 💰 Paytable | Symmetric multiplier distribution across 13 bins |
| 🔉 Sound + 🎉 Confetti | Subtle peg tick and win chime with confetti animation |
| 🧮 Verifier Page | `/verify` allows recomputation and proof of fairness |
| 🔒 Zero Secret Leakage | ServerSeed never exposed until reveal |

---

## 🧱 Folder Structure
plinko-game/
├── app/
│ ├── api/ → Backend routes
│ ├── verify/ → Public verifier page
│ └── page.tsx → Main game UI
├── lib/prisma.ts → Prisma client setup
├── prisma/schema.prisma
├── public/sounds/
├── .env
├── README.md
└── package.json

yaml
Copy code

---

## 🧰 Environment Variables
DATABASE_URL="file:./dev.db"

yaml
Copy code

---

## ⚙️ Run Locally
```bash
# Install dependencies
npm install

# Setup Prisma
npx prisma migrate dev --name init
npx prisma generate

# Run dev server
npm run dev
Then open http://localhost:3000.

🧪 Testing
✅ Commit-Reveal Verification
Test using these known inputs:

ini
Copy code
rows = 12
serverSeed = b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc
nonce = 42
clientSeed = candidate-hello
Should produce:

ini
Copy code
commitHex = bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34
combinedSeed = e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0
🧩 API Routes
Route	Description
POST /api/rounds/commit	Creates new round & stores commitHex
POST /api/rounds/[id]/start	Generates path, pegMap, payout
POST /api/rounds/[id]/reveal	Reveals serverSeed
POST /api/verify	Public deterministic recomputation

🎨 UI/UX
Clean dark gradient theme

Confetti celebration after win

Sound toggle (🔊 / 🔇)

Mobile-friendly & responsive layout

Keyboard-accessible input fields

🧩 Fairness Implementation
Commit formula: SHA256(serverSeed + ":" + nonce)

Combined seed: SHA256(serverSeed + ":" + clientSeed + ":" + nonce)

PRNG: xorshift32 seeded from first 4 bytes of combinedSeed (big-endian)

Peg map biases: leftBias = 0.5 + (rand() - 0.5) * 0.2, rounded to 6 decimals

Bias adjust: (dropColumn - floor(12 / 2)) * 0.01


🧠 AI Usage (as required by prompt)

I used ChatGPT (GPT-5) as a coding assistant to:

Set up the project structure, Prisma schema, and API routes

Generate UI layout with Tailwind styling and sound integration

Debug common Next.js + Prisma issues

All code was reviewed, modified, and tested by me to ensure correctness.