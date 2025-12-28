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
├── simulator/              # Core mesh network simulation logic
│   ├── Simulator.ts            # Main simulator class with transmission logic
│   ├── BaseNode.ts             # Abstract base class for all node types
│   ├── ClientNode.ts           # Client node implementation with SNR-based rebroadcast delay
│   ├── ClientMuteNode.ts       # Client node that doesn't rebroadcast
│   ├── RouterNode.ts           # Router node with favorites and hop limit preservation
│   ├── Packet.ts               # Packet data model with hop counting
│   ├── CADTransmitter.ts       # Channel Activity Detection with exponential backoff
│   ├── Logger.ts               # Logging system for simulation events
│   ├── NodeRole.ts             # Enum: CLIENT, CLIENT_MUTE, ROUTER
│   ├── NodeState.ts            # Enum: LISTENING, TRANSMITTING, RECEIVING
│   ├── SimulatorMode.ts        # Enum: ADD mode
│   └── LogEntityType.ts        # Log entity types
├── components/             # Vue components
│   ├── AppSidebar.vue          # Main sidebar with controls, settings, and statistics
│   ├── AppControls.vue         # Node adding controls
│   ├── AppSettings.vue         # Simulator settings (hop limit, node role)
│   ├── AppStatistic.vue        # Packet statistics (coverage, hops, retransmissions)
│   ├── AppLogo.vue             # Application logo
│   ├── AppFooter.vue           # Footer with log viewer
│   ├── AppCheckableButton.vue  # Custom checkable button component
│   ├── MeshMap.vue             # Leaflet map wrapper
│   ├── MeshNodeMarker.vue      # Visual representation of mesh nodes as Leaflet markers
│   ├── MeshLogViewer.vue       # Console log viewer component
│   ├── NodeContextMenu.vue     # Draggable context menu window
│   ├── NodeInfo.vue            # Node information display
│   └── NodeSettingsForm.vue    # Node settings editor form
├── composables/            # Vue composables
│   ├── useSimulator.ts         # Provides reactive simulator instance
│   ├── useSimulatorSettings.ts # Provides simulator settings (hop limit, default role)
│   └── useWindowStack.ts       # Z-index management for draggable windows
├── pages/
│   └── index.vue               # Main page - combines map, sidebar, and log viewer
├── app.config.ts           # UI theme (Nuxt UI configuration)
└── assets/css/main.css     # Global styles + Tailwind
```

### Key Architectural Concepts

#### 1. **Reactive Simulator Pattern**
The `Simulator` class is wrapped in Vue's `reactive()` via `useSimulator` composable to make it reactive for the UI:
```typescript
const simulator = reactive(new Simulator(logger));
```
All simulator state changes automatically trigger Vue re-renders.

#### 2. **Node Type System**

The simulator supports three types of nodes with different rebroadcast behaviors:

- **ClientNode** (NodeRole.CLIENT):
  - Rebroadcasts packets once (suppresses duplicates with `heardRebroadcast()`)
  - Uses SNR-based rebroadcast delay: worse SNR (farther) = earlier transmission, better SNR (closer) = later transmission (Meshtastic-inspired, ClientNode.ts:18-39)
  - Decrements hop limit on every retransmission

- **ClientMuteNode** (NodeRole.CLIENT_MUTE):
  - Receives packets but never rebroadcasts
  - Used for end-user devices that only consume data

- **RouterNode** (NodeRole.ROUTER):
  - Rebroadcasts packets only once per packet ID (RouterNode.ts:10-12)
  - Preserves hop limit when receiving from "favorite" nodes (RouterNode.ts:19-21)
  - Zero rebroadcast delay for faster routing

#### 3. **Mesh Network Simulation Logic**

The simulator implements realistic mesh networking behavior:

- **Channel Activity Detection (CAD)**: Implemented in CADTransmitter.ts with exponential backoff
  - Checks if channel is busy before transmitting
  - Exponential backoff: cwMin=3, cwMax=7 slots (configurable in Simulator.ts:21-27)
  - Maximum 5 retry attempts before giving up
  - Each CAD operation takes 5ms + random backoff

- **Power-based Transmission Range**: Transmission range calculated using Friis formula: `Range = 5000м × 10^((Power - 20дБм) / 20)`
  - Power 20 dBm (default) = 5.0 km
  - Power 10 dBm = ~1.6 km
  - Power 1 dBm = ~396 m
  - Each dBm of transmit power adds 1 dB to max SNR

- **SNR-based Reception**: Packet reception probability depends on Signal-to-Noise Ratio (Simulator.ts:226-236)
  - Uses sigmoid function: `1 / (1 + exp(-k * (snr - threshold)))`
  - SNR > -7 dB: ~98%+ success, SNR ~ -11 dB: 50%, SNR < -15 dB: ~2%

- **Distance-based Path Loss**: SNR decreases with distance using logarithmic model (Simulator.ts:192-223)
  - Path loss exponent: 2.5 (urban/obstacles environment)
  - Max SNR at 1m: 15 dB, Min SNR at max range: -10 dB
  - Includes log-normal fading (±2 dB random variation)

- **Hop Limiting**: Packets have configurable hop limit (default 3, adjustable 1-7) to prevent infinite propagation (Packet.ts:4,13)
  - Each rebroadcast decrements hop limit (unless RouterNode with favorites)
  - Packets with hopLimit=0 cannot be rebroadcast

- **Duplicate Suppression**: Nodes track received/transmitted packets (BaseNode.ts:18-19,84-92)
  - ClientNode: suppresses if heard rebroadcast
  - RouterNode: suppresses if already transmitted

- **Retransmission Delay Strategy**: Nodes with worse SNR (farther away) retransmit earlier, those with better SNR (closer) wait longer - this is Meshtastic-inspired behavior

**Important:** Base range (5000m at 20 dBm) is defined in `calculateMaxRange()` method. Change `baseRange` constant to adjust default transmission distance.

#### 4. **Logging System**

The simulator uses a centralized Logger (Logger.ts) that emits events consumed by MeshLogViewer component. All log messages are in Russian and include:
- Node information (ID, role, state)
- Packet transmission/reception events
- SNR calculations and packet loss
- CAD channel busy status and retries
- Duplicate detection and rebroadcast suppression

#### 5. **Leaflet Integration**

- Leaflet is integrated via `@nuxtjs/leaflet` module
- Map controls are provided by `MeshMap.vue` which wraps the Leaflet component
- Individual nodes (`MeshNodeMarker.vue`) are rendered as custom Leaflet markers with drag support
- Node state changes (NodeState: LISTENING, TRANSMITTING, RECEIVING) trigger CSS animations (expanding wave for transmission, pulsing ring for reception)
- Context menu support:
  - **Desktop**: Right-click on node marker
  - **Mobile**: Long-press (500ms) on node marker with visual feedback (red ring animation)

#### 6. **Component Communication**

- **index.vue** is the orchestrator:
  - Manages simulator mode (ADD mode via SimulatorMode enum)
  - Handles map clicks to add nodes with configurable hop limit and role
  - Provides simulator instance to all components via composable
  - Controls log viewer visibility

- **MeshNodeMarker.vue**:
  - Renders the node on the map with Leaflet
  - Emits `moved`: when dragged (lat, lng) → calls `simulator.moveNode()`
  - Emits `click`: for left-click (triggers packet transmission) → calls `simulator.transmitFromNode()`
  - Handles context menu opening (right-click or long-press)
  - Manages `NodeContextMenu` instance for this node

- **NodeContextMenu.vue**:
  - Draggable floating window using Teleport
  - Manages z-index via `useWindowStack` composable
  - Switches between info view and settings edit mode
  - Contains `NodeInfo` and `NodeSettingsForm` child components
  - Highlights on re-click (green glow animation)

- **NodeInfo.vue**:
  - Displays node statistics (role, state, hop limit, power, range, packets)
  - Emits `transmit`: to send packet from node
  - Emits `edit`: to switch to settings mode

- **NodeSettingsForm.vue**:
  - Form for editing hop limit (1-7) and power (1-20 dBm)
  - Shows live transmission range calculation
  - Emits `apply`: with new settings
  - Emits `cancel`: to return to info view

- **AppSidebar.vue**: Combines sub-components:
  - AppControls.vue: Toggle between normal and ADD mode
  - AppSettings.vue: Configure hop limit and default node role
  - AppStatistic.vue: Display packet statistics (coverage %, avg hops, retransmissions)
  - User interaction hints with closeable alert

#### 7. **Window Stack Management** (app/composables/useWindowStack.ts)

The application implements a multi-window system for node context menus:

- **Z-index Stacking**: Each window gets an incrementing z-index starting from 9999
- **Bring to Front**: Clicking on any window or its associated node brings it to the top
- **Highlight Animation**: Re-clicking a node with an open window triggers green glow animation (600ms duration)
- **Drag Support**: Windows can be dragged by their header bar (with grip icon)
  - Both mouse and touch events supported
  - Prevents map interaction while dragging
- **Position Persistence**: Window positions are maintained during drag operations
- **Screen Bounds**: Context menu position is adjusted to keep windows fully visible (10px margins from screen edges)

**Implementation Pattern:**
```typescript
const { zIndex, bringToFront } = useWindowStack();

// In template
:style="{ zIndex: zIndex }"

// On click/interaction
bringToFront();
```

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

No Pinia or Vuex - the reactive `Simulator` instance (accessed via `useSimulator()` composable) serves as the single source of truth. All node positions, transmission states, packet tracking, and statistics are managed within the simulator and node classes. Settings like hop limit and default role are managed via `useSimulatorSettings()` composable.

**Node State Tracking:**
- Each `BaseNode` instance tracks:
  - `transmittedPackets`: Array of packet IDs sent by this node
  - `receivedPackets`: Array of packet IDs received by this node
  - `hopLimit`: Configurable hop limit (1-7, default 3)
  - `power`: Transmit power in dBm (1-20, default 20)
  - `role`: NodeRole enum (CLIENT, CLIENT_MUTE, ROUTER)
  - `state`: NodeState enum (LISTENING, TRANSMITING, RECEIVING)

**Reactive Updates:**
- All node property changes automatically trigger Vue re-renders
- Context menu windows display live statistics
- Range calculations update in real-time when power is adjusted

## Console Logging

The simulator logs extensively to the browser console for debugging mesh behavior. All console messages are in Russian and include:
- Channel busy status and retry attempts
- Packet transmission events
- Packet loss with SNR calculations
- Duplicate packet detection
- Rebroadcast suppression
- Retransmission with timing info

When modifying simulation logic, maintain detailed console logging for debugging.

## Key Implementation Notes

### Touch Event Handling
- Always use `.stop.prevent` on touch events in draggable windows to prevent map interaction
- Long-press detection requires 500ms timeout with visual feedback
- Separate handlers for `touchstart`, `touchmove`, `touchend` needed for proper drag support

### Component Separation
- **NodeInfo.vue**: Pure display component, no editing logic
- **NodeSettingsForm.vue**: Pure form component with local reactive state
- **NodeContextMenu.vue**: Window management and mode switching only
- Keep concerns separated for maintainability

### Power and Range Calculations
- The same `calculateRange()` function is duplicated in both `NodeInfo.vue` and `NodeSettingsForm.vue` for simplicity
- Both components use identical formula: `Range = 5000м × 10^((Power - 20дБм) / 20)`
- Consider extracting to composable if logic becomes more complex

### Z-Index Management
- Base z-index: 9999 (defined in useWindowStack.ts)
- Each new "bring to front" operation increments by 1
- No z-index cleanup on window close (acceptable for typical usage)
- If z-index overflow becomes an issue (unlikely), implement reset logic

### Animation Timing
- Long-press visual feedback: 500ms
- Window highlight animation: 600ms
- Transmission wave animation: 600ms (expanding)
- Reception ring animation: 600ms (pulsing)
- Keep animations synchronized for visual consistency

## Git Flow

The project uses Git Flow for version management:
- **Branches**: `main` (production), `develop` (development), `feature/*`, `release/*`, `hotfix/*`
- **Version tags**: Prefix is empty (`versiontag =` in .git/config), so tags should be created manually with `v` prefix (e.g., `v0.0.1`)
- **Release workflow**: When using `git flow release finish`, specify version **WITH** the `v` prefix (e.g., `git flow release finish 'v0.0.2'`)

## Dependency Management

The project includes `renovate.json` configuration for Renovate Bot (automated dependency updates):
- Extends Nuxt's official Renovate config
- Enables lock file maintenance
- **Note**: Current config includes `pnpmDedupe` option, but project uses npm (may need cleanup)
- Renovate requires GitHub App installation to function

## Deployment

The project deploys to GitHub Pages via `.github/workflows/deploy.yml`:
- Triggers on push to `main` branch or manual workflow dispatch
- Generates static site with `npm run generate`
- Deploys to GitHub Pages environment
