# Solana Stacker — No‑Code Game Jam Entry

[![Next.js](https://img.shields.io/badge/Next.js-App-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Play Live](https://img.shields.io/badge/Play-Live-brightgreen)](https://your-vercel-link.vercel.app)

Stack Solana **transaction blocks** perfectly to build the tallest tower, earn **SOL rewards**, and survive **network congestion**! A hyper-addictive timing game built in pure React + Tailwind for the **Scrolly No-Code Game Jam**. [file:31]

![Demo](https://via.placeholder.com/800x450/0a0a0a/ffffff?text=Solana+Stacker+Demo+GIF+%F0%9F%9A%80)

---

## 🎮 How to Play

- **Tap DROP BLOCK** when the yellow block **perfectly aligns** with the stack below.
- **Perfect** (full overlap): **3x SOL** + combo streak.
- **Good** (partial): **2x SOL**.
- **OK/Miss**: **1x SOL** (or network error 😱).
- **Every 5 blocks**: Speed + difficulty ramps up! 🚀
- **Network congestion** (every ~15 blocks): Timing gets **harder** for 4 drops.
- **Goal**: Stack as high as possible before the tower collapses.

**Validators rotate** (Jump Crypto, Firedancer, etc.) + **Solana-themed messages** like "Transaction Confirmed!" or "Block Finalized!".

---

## ✨ Features

- **Progressive difficulty**: Speed/difficulty scales every 5 blocks.
- **Combos & multipliers**: 3+ good stacks = **2x**, 5+ perfect = **3x**.
- **Network congestion**: Random events make timing trickier.
- **Particles + confetti**: Flames, sparks, and celebrations.
- **Audio feedback**: Bass hits, perfect chimes, miss buzzes (Web Audio API).
- **Mobile-first**: Touch controls, haptics (vibration), safe-area insets.
- **Tutorial + stats**: High scores, accuracy, performance history.
- **Share scores**: Native share or clipboard.
- **Responsive 9:16** phone frame for the jam scaffold.

---

## 📱 Controls

- **Tap/Click** the big **DROP BLOCK** button.
- Works on **touch** (mobile) or **mouse** (desktop).
- **Vibration** on hits/misses/perfects.

---

## 🛠 Tech Stack

- **Next.js + TypeScript** (Solana dApp Scaffold)
- **React hooks only** (`useState`, `useEffect`, `useRef`)
- **Tailwind CSS** (all visuals/animations)
- **No canvas/external libs** – pure DOM.
- **Web Audio API** for sound effects.
- **CSS keyframes** for particles/flames/confetti/shake.

**Entire game** is one `GameSandbox` component – drop‑in ready for the scaffold. [file:31]

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+  
- npm / pnpm / yarn

### Quick Start
```bash
npm install
npm run dev
