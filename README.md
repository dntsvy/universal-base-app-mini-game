# Universal Base App – Mini Game

Universal Base App is an idle / incremental mini game built with React and Vite, inspired by the idea of building on Base.

You start as a small builder on Base, posting, attracting users, hiring creators and developers, launching miniapps and AI agents – and eventually taking your Base App public via IPO and expanding into a universal “everything app”.

This project is designed to be deployed as a simple web mini app (e.g. playable inside the Base App browser or on mobile), with no wallet or authentication required in the first version.

---

## ✨ Features

- **Baseposting**  
  Tap the `BASEPOSTING` button to gain onchain users and initial business fund.

- **Base App Automation**
  - Creator Studio (creators)
  - Developer Hub (developers)
  - Miniapp Factory (miniapps)
  - AI Agent Lab (AI agents)
  
  Each unit generates users per second and scales your growth.

- **Funding Stages**

  Progress through funding stages as your fund grows:

  - Bootstrapped  
  - Seed Round  
  - Series A  
  - Series B  
  - Unicorn  

- **Pitch Investors**

  Convert your current user traction into additional fund with a single button: `PITCH INVESTORS`.

- **IPO & Prestige**

  Once you reach sufficient users and fund, you can trigger an `IPO & RESET`:

  - Resets your progress (users, fund, units)
  - Increases your **Founder Prestige level**
  - Each prestige level boosts long-term growth multipliers

- **Competitors & Market Share**

  Legacy apps grow over time in parallel.  
  Track:
  - Legacy users
  - Your market share (% of global users)

- **Universe Map / Sectors**

  Unlock sectors as your fund and prestige level increase:

  - Base Community  
  - Startup Launch Pad  
  - Base Network Expansion  
  - Business Empire  
  - Global Everything App  
  - Universal Baseverse  

- **Auto Save / Auto Load**

  Game state is stored in `localStorage`, so you can close the tab and come back later.

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript  
- **Bundler / Dev Server:** Vite  
- **Styling:** Plain CSS (Base-style blue & white theme)  
- **State:** React hooks (`useState`, `useEffect`)  
- **Storage:** `localStorage` (client-side only)

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (LTS recommended, e.g. 18+)
- npm or yarn

### Install dependencies

```bash
npm install
# or
yarn
