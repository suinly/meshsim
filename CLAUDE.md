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
│   ├── Simulator.ts        # Main simulator class with transmission logic
│   ├── BaseNode.ts         # Base node class
│   ├── ClientNode.ts       # Client node implementation
│   ├── ClientMuteNode.ts   # Client node without rebroadcast
│   ├── RouterNode.ts       # Router node implementation
│   ├── Packet.ts           # Packet data model with hop counting
│   ├── CADTransmitter.ts   # Channel Activity Detection implementation
│   ├── NodeRole.ts         # Node role enum
│   ├── NodeState.ts        # Node state enum
│   └── Logger.ts           # Logging interface
├── components/         # Vue components
│   ├── AppSidebar.vue          # Control panel for adding nodes
│   ├── AppSettings.vue         # Application settings panel
│   ├── MeshMap.vue             # Leaflet map wrapper
│   ├── MeshNodeMarker.vue      # Visual representation of mesh nodes on map
│   ├── NodeContextMenu.vue     # Draggable context menu window
│   ├── NodeInfo.vue            # Node information display
│   └── NodeSettingsForm.vue    # Node settings editor form
├── composables/        # Vue composables
│   ├── useSimulator.ts         # Simulator instance management
│   └── useWindowStack.ts       # Z-index management for draggable windows
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

#### 2. **Mesh Network Simulation Logic** (app/simulator/Simulator.ts)

The simulator implements realistic mesh networking behavior:

- **Carrier Sense Multiple Access (CSMA)**: Nodes check if the channel is busy before transmitting via CADTransmitter
- **Exponential Backoff**: Failed transmissions retry with exponential delay + jitter (configurable in CADTransmitter)
- **Power-based Transmission Range**: Transmission range calculated using Friis formula: `Range = 5000м × 10^((Power - 20дБм) / 20)`
  - Power 20 dBm (default) = 5.0 km
  - Power 10 dBm = ~1.6 km
  - Power 1 dBm = ~396 m
- **SNR-based Reception**: Packet reception probability depends on Signal-to-Noise Ratio using sigmoid function
  - Each dBm of transmit power adds 1 dB to max SNR
  - Reception probability: SNR > -7 dB (~98%), SNR ~ -11 dB (50%), SNR < -15 dB (~2%)
- **Distance-based Path Loss**: SNR decreases with distance using logarithmic model (path loss exponent = 2.5)
- **Hop Limiting**: Packets have configurable hop limit (default 3, adjustable 1-7) to prevent infinite propagation
- **Duplicate Suppression**: Nodes track seen packets and suppress rebroadcast if heard multiple times
- **Retransmission Delay Strategy**: Nodes with worse SNR (farther away) retransmit earlier, those with better SNR (closer) wait longer - this is Meshtastic-inspired behavior

**Important:** Base range (5000m at 20 dBm) is defined in `calculateMaxRange()` method. Change `baseRange` constant to adjust default transmission distance.

#### 3. **Leaflet Integration**

- Leaflet is integrated via `@nuxtjs/leaflet` module
- Map controls are provided by `MeshMap.vue` which wraps the Leaflet component
- Individual nodes (`MeshNodeMarker.vue`) are rendered as custom Leaflet markers with drag support
- Node state changes (transmitting/receiving) trigger CSS animations (expanding wave for transmission, pulsing ring for reception)
- Context menu support:
  - **Desktop**: Right-click on node marker
  - **Mobile**: Long-press (500ms) on node marker with visual feedback (red ring animation)

#### 4. **Component Communication**

- **index.vue** is the orchestrator:
  - Manages `isAddingMode` state
  - Handles map clicks to add nodes
  - Passes simulator reference to MeshNodeMarker components
- **MeshNodeMarker.vue**:
  - Renders the node on the map with Leaflet
  - Emits `moved`: when dragged (lat, lng)
  - Emits `click`: for left-click (triggers packet transmission)
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
- **AppSidebar.vue** emits:
  - `toggleAddingMode`: switches between normal and node-adding mode

#### 5. **Window Stack Management** (app/composables/useWindowStack.ts)

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

No Pinia or Vuex - the reactive `Simulator` instance serves as the single source of truth. All node positions, transmission states, and packet tracking are managed within the simulator class.

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