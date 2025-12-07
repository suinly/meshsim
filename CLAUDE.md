# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Mesh Network Simulator** built with Nuxt 4, visualizing how mesh networking works with packet transmission, SNR (Signal-to-Noise Ratio) calculations, and collision avoidance. The app is client-side only (SSR disabled) and uses Leaflet for interactive map visualization.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Run linter
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Directory Structure

```
app/
├── simulator/          # Core mesh network simulation logic
│   ├── mesh-simulator.ts   # Main simulator class with transmission logic
│   ├── mesh-node.ts        # Node data model
│   └── mesh-packet.ts      # Packet data model with hop counting
├── components/         # Vue components
│   ├── AppSidebar.vue      # Control panel for adding nodes
│   ├── MeshMap.vue         # Leaflet map wrapper
│   └── MeshNode.vue        # Visual representation of mesh nodes
├── pages/
│   └── index.vue           # Main page - combines map + sidebar
├── app.config.ts       # UI theme (Nuxt UI configuration)
└── assets/css/main.css # Global styles + Tailwind
```

### Key Architectural Concepts

#### 1. **Reactive Simulator Pattern**
The `MeshSimulator` class is wrapped in Vue's `reactive()` to make it reactive for the UI:
```typescript
const simulator = reactive(new MeshSimulator());
```
All simulator state changes automatically trigger Vue re-renders.

#### 2. **Mesh Network Simulation Logic** (app/simulator/mesh-simulator.ts)

The simulator implements realistic mesh networking behavior:

- **Carrier Sense Multiple Access (CSMA)**: Nodes check if the channel is busy before transmitting (mesh-simulator.ts:232-253)
- **Exponential Backoff**: Failed transmissions retry with exponential delay + jitter (mesh-simulator.ts:44-59)
- **SNR-based Reception**: Packet reception probability depends on Signal-to-Noise Ratio using sigmoid function (mesh-simulator.ts:193-203)
- **Distance-based Path Loss**: SNR decreases with distance using logarithmic model (mesh-simulator.ts:177-191)
- **Hop Limiting**: Packets have a hop limit (default 3) to prevent infinite propagation (mesh-packet.ts:22-24)
- **Duplicate Suppression**: Nodes track seen packets and suppress rebroadcast if heard multiple times (mesh-simulator.ts:131-140)
- **Retransmission Delay Strategy**: Nodes with worse SNR (farther away) retransmit earlier, those with better SNR (closer) wait longer - this is Meshtastic-inspired behavior (mesh-simulator.ts:205-230)

**Important:** The 5km max range is hardcoded in two places (mesh-simulator.ts:78 and :234) - change both if adjusting range.

#### 3. **Leaflet Integration**

- Leaflet is integrated via `@nuxtjs/leaflet` module
- Map controls are provided by `MeshMap.vue` which wraps the Leaflet component
- Individual nodes (`MeshNode.vue`) are rendered as custom Leaflet markers with drag support
- Node state changes (transmitting/receiving) trigger CSS animations

#### 4. **Component Communication**

- **index.vue** is the orchestrator:
  - Manages `isAddingMode` state
  - Handles map clicks to add nodes
  - Passes simulator reference to MeshNode components
- **MeshNode.vue** emits:
  - `moved`: when dragged (lat, lng)
  - `click`: triggers packet transmission from that node
- **AppSidebar.vue** emits:
  - `toggleAddingMode`: switches between normal and node-adding mode

## Language & Localization

**The application is in Russian.** All UI text and console messages are in Russian:
- UI labels: "Добавить узел", "Нажмите на карту для добавления"
- Console logs: "Передача:", "Пакет потерян:", "Ретрансляция:", etc.

The HTML lang attribute is set to "ru" in app.vue. Maintain Russian language for all user-facing strings.

## Technology Stack

- **Nuxt 4**: Client-side only (ssr: false)
- **Nuxt UI**: Component library with Tailwind CSS v4
- **@nuxtjs/leaflet**: Map visualization
- **TypeScript**: Strict typing throughout
- **npm**: Package manager

## ESLint Configuration

Custom stylistic rules are configured in nuxt.config.ts:
- No trailing commas (`commaDangle: "never"`)
- One True Brace Style (`braceStyle: "1tbs"`)

## State Management

No Pinia or Vuex - the reactive `MeshSimulator` instance serves as the single source of truth. All node positions, transmission states, and packet tracking are managed within the simulator class.

## Console Logging

The simulator logs extensively to the browser console for debugging mesh behavior. All console messages are in Russian and include:
- Channel busy status and retry attempts
- Packet transmission events
- Packet loss with SNR calculations
- Duplicate packet detection
- Rebroadcast suppression
- Retransmission with timing info

When modifying simulation logic, maintain detailed console logging for debugging.