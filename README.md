# 2048 Game

A modern implementation of the classic 2048 puzzle game built with React, TypeScript, and Vite. This version features an AI player powered by Monte Carlo Tree Search (MCTS) algorithm with advanced heuristics.

![2048 Game Screenshot](https://via.placeholder.com/800x450.png?text=2048+Game+Screenshot)

## Features

- 🎮 Classic 2048 gameplay with keyboard controls
- 🤖 AI player with Monte Carlo Tree Search algorithm
- 🧠 Advanced AI strategies (corner strategy, snake pattern, etc.)
- ⏱️ Game replay functionality with adjustable speed
- 💾 Export and import game sessions
- 🎛️ Adjustable AI speed settings

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/2048-game.git
cd 2048-game

# Install dependencies
npm install

# Start development server
npm run dev
```

## How to Play

- Use **W/A/S/D** or arrow keys to move tiles
- Combine tiles with the same number to create a tile with twice the value
- Try to reach the 2048 tile!
- Click **New Game** to restart
- Use the **AI Auto Play** button to let the AI play for you
- Use **Export Record** to save your game session
- Use **Import Record** to load a previously saved game session

## AI Implementation

This game features an advanced AI player powered by Monte Carlo Tree Search (MCTS) with several heuristic improvements:

### Key AI Strategies

1. **Corner Strategy**: Keeps high-value tiles in the corners to maintain board flexibility
2. **Snake Pattern**: Arranges numbers in a snake-like pattern to maintain monotonicity
3. **Center Avoidance**: Avoids placing high-value tiles in the center
4. **Merge Potential**: Prioritizes moves that create merge opportunities

The AI evaluation function considers multiple factors:
- Empty cell count
- Monotonicity of rows and columns
- Smoothness of the board
- Position of high-value tiles
- Potential for future merges

## Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **Jest**: Testing framework

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Test AI performance
node test-ai-performance.cjs
```

## Roadmap

### Short-term Goals (Q3-Q4 2025)
- 🌐 Internationalization support (add English language option)
- ✨ Improved UI/UX with animations
- 📊 High score tracking and leaderboard
- 📱 Mobile-friendly responsive design

### Mid-term Goals (Q1-Q2 2026)
- 🎛️ Different board size options (3x3, 5x5, etc.)
- 🎚️ Adjustable difficulty levels for AI
- 🔄 PWA support for offline play
- 🎯 Game statistics and analytics

### Long-term Goals (Q3 2026+)
- 🧠 Additional AI strategies beyond MCTS
- ⚡ Performance optimizations
- 🎮 Game mode variations
- 🏆 Online multiplayer competitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
