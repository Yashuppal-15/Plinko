# 🎮 Plinko Fair Game

A provably fair Plinko gaming platform with commit-reveal fairness protocol.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue)](https://plinko-1vu7dv1zt-yash-uppals-projects.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-yashuppal--15-black)](https://github.com/yashuppal-15/Plinko)

## 🎯 Overview

Plinko Fair Game is a fully functional gaming platform demonstrating:  
- Commit-Reveal Fairness Protocol - Ensures no cheating possible  
- Deterministic RNG - Mulberry32 algorithm  
- Production-Ready - Live on Vercel with PostgreSQL  

## ✨ Features

### Game Mechanics
- Create Round with unique nonce & commitment hash  
- Auto-generated client seed  
- Admin-controlled server seed  
- Reveal to determine ball trajectory  
- Verify fairness cryptographically  
- Symmetric payout table (0-12 bins)  

### Security & Fairness
- SHA256 hashing for commitments  
- Deterministic Mulberry32 PRNG  
- Provably fair - players can verify independently  
- Results determined by combined seeds  

## 🛠️ Tech Stack

| Layer    | Technology           |
| -------- | -------------------- |
| Frontend | React 18 + Tailwind CSS |
| Backend  | Node.js + Next.js    |
| Database | PostgreSQL (Neon)    |
| ORM      | Prisma               |
| Deployment | Vercel             |

## 📁 Project Structure

plinko-game/
├── app/
│ ├── api/rounds/
│ │ ├── commit/route.ts
│ │ ├── [id]/start/route.ts
│ │ └── [id]/verify/route.ts
│ ├── page.tsx
│ └── layout.tsx
├── lib/
│ ├── prisma.ts
│ ├── engine.ts
│ ├── rng.ts
│ └── combiner.ts
├── prisma/
│ ├── schema.prisma
│ └── migrations/
├── .env
└── package.json

text

## 🚀 Quick Start

### Installation

git clone https://github.com/yashuppal-15/Plinko.git
cd plinko-game
npm install
echo 'DATABASE_URL="postgresql://..."' > .env
npx prisma migrate dev
npm run dev

text

Visit http://localhost:3000

## 🎮 How to Play

### Step 1: Create Round
Click "Create Round" → Generates unique nonce & commitment → Random client seed created

### Step 2: Add Server Seed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

text
Copy output → Open `npx prisma studio` → Paste into serverSeed field

### Step 3: Reveal
Click "Reveal" → Combines client + server seed → Determines ball bin (0-12) → Shows payout

### Step 4: Verify
Click "Verify" → Verifies SHA256 commitment → Proves result is fair

## 🔐 Fairness Protocol

### Commit-Reveal Mechanism

1. Commit Phase: Server generates nonce, hash = SHA256(nonce), only hash revealed  
2. Reveal Phase: Player provides client seed, server reveals nonce, combined seed = SHA256(client + server)  
3. Verify Phase: Player verifies SHA256(nonce) matches, verifies result matches combined seed - No cheating possible  

## 📊 API Endpoints

### Create Round
POST /api/rounds/commit
Body: { clientSeed?: string }
Response: { id, nonce, commitHex, status }

text

### Reveal Round
POST /api/rounds/{id}/start
Body: { clientSeed, serverSeed, dropColumn, betCents }
Response: { id, binIndex, payoutMultiplier, pathJson }

text

### Verify Round
GET /api/rounds/{id}/verify
Response: { verified: boolean, details }

text

## 💾 Database Schema

model Round {
id Int
nonce String
commitHex String
serverSeed String?
clientSeed String?
combinedSeed String?
pegMapHash String?
pathJson String?
binIndex Int?
betCents Int?
payoutMultiplier Float?
dropColumn Int?
status String
createdAt DateTime
revealedAt DateTime?
updatedAt DateTime
}

text

## 💰 Payout Table

| Bin | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|-----|---|---|---|---|---|---|---|---|---|---|----|----|-----|
| Multiplier | 9x | 6x | 4x | 3x | 2x | 1.5x | 1x | 1.5x | 2x | 3x | 4x | 6x | 9x |

## 🔧 Development

### Database Commands

npx prisma studio # View database UI
npx prisma migrate dev # Run migrations
npx prisma generate # Generate Prisma Client
npx prisma migrate reset # Reset database

text

## 🌐 Deployment

### Deploy to Vercel

git add .
git commit -m "Deploy Plinko game"
git push

text

Configure in Vercel dashboard: DATABASE_URL=postgresql://...

Live at: https://plinko-1vu7dv1zt-yash-uppals-projects.vercel.app/

## 👤 Author

Yash Uppal - [@yashuppal-15](https://github.com/yashuppal-15)

## 📄 License

MIT License