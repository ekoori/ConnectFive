# Connect Five

A React-based Connect Five game with an infinite canvas. Play against another human or against AI with different difficulty levels.

## Features

- Infinite canvas with panning and zooming
- Human vs Human gameplay
- Human vs AI gameplay with three difficulty levels
  - Easy: Makes some random moves with basic strategy
  - Medium: More strategic, evaluates potential moves
  - Hard: Looks ahead and plays defensively and offensively
- Win detection for five in a row (horizontal, vertical, or diagonal)
- Visual indicators for current player and last move

![ConnectFive Screenshot](https://github.com/user-attachments/assets/06cf6999-960f-4434-a8f6-016aa36f82ac)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the game.

## How to Play

1. Choose your game mode (Human vs Human or one of the AI difficulty levels)
2. Players take turns placing stones on the board
3. The first player to get five stones in a row (horizontally, vertically, or diagonally) wins
4. Use the mouse to navigate:
   - Click to place a stone
   - Middle mouse button or Ctrl+left mouse to pan the board
   - Mouse wheel to zoom in/out
5. Use the "Reset Game" button to start a new game
6. Use the "Back to Menu" button to return to the game mode selection

## Technologies Used

- React
- Next.js
- TypeScript
- Styled Components
