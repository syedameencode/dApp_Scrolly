# Battle Arena (AI Bot) — No‑Code Game Jam Mini‑Game

[![Next.js](https://img.shields.io/badge/Next.js-App-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, mobile-first 8×8 tactical PvE game built in React + Tailwind CSS for the Scrolly No‑Code Game Jam: move, attack, shield, grab power-ups, and survive the shrinking danger zone against an AI bot.

---

## Gameplay

- **Objective:** Reduce the bot’s HP to 0 before yours hits 0 (or win on HP/score when time runs out).
- **Turns:** You (🔵) vs Bot (🤖), alternating turns.
- **Actions:**
  - **Move:** 1 tile (Manhattan distance).
  - **Attack:** Target the opponent within range 1–2.
  - **Shield:** Reduce incoming damage (cooldown-based).
  - **Power:** Spend ⚡ power-ups to boost damage (consumes power-ups).
- **Power-ups:**
  - 💚 **Health**: restore HP.
  - ⚡ **Damage**: gain power-up stacks for stronger attacks.
- **Shrinking arena:** As the timer drops, the **danger zone expands**. Entering it causes **damage** and makes you **vulnerable** (taking increased damage on the next hit).

---

## Difficulty levels

- **Easy:** Bot is less optimal and more random.
- **Medium:** Bot uses basic tactics, sometimes prioritizes power-ups.
- **Hard:** Bot plays aggressively, uses power-ups/shields more intelligently.

---

## Tech stack

- **Next.js + TypeScript**
- **React hooks only** (`useState`, `useEffect`)
- **Tailwind CSS** for all visuals
- No canvas, no external game libs, no backend, no wallet logic

---

## Running locally

### Prerequisites
- Node.js (LTS recommended)
- npm / pnpm / yarn

### Install & run
