export type Board = number[][];
export type Direction = 'left' | 'right' | 'up' | 'down';

export interface GameState {
  board: Board;
  score: number;
  gameOver: boolean;
}

export interface MCTSNode {
  state: GameState;
  parent: MCTSNode | null;
  children: Map<Direction, MCTSNode>;
  visits: number;
  totalScore: number;
  untriedMoves: Direction[];
}

export class MCTS {
  private static readonly DIRECTIONS: Direction[] = ['left', 'right', 'up', 'down'];
  private static readonly C = Math.sqrt(2); // UCB1 exploration constant
  private maxIterations: number;
  private maxSimulationDepth: number;

  constructor(maxIterations = 1000, maxSimulationDepth = 100) {
    this.maxIterations = maxIterations;
    this.maxSimulationDepth = maxSimulationDepth;
  }

  public getBestMove(gameState: GameState): Direction | null {
    if (gameState.gameOver) return null;

    const validMoves = this.getValidMoves(gameState);
    if (validMoves.length === 0) return null;

    const root = this.createNode(gameState);
    
    for (let i = 0; i < this.maxIterations; i++) {
      const leaf = this.select(root);
      const child = this.expand(leaf);
      const reward = this.simulate(child);
      this.backpropagate(child, reward);
    }

    const bestChild = this.getBestChild(root, 0);
    if (!bestChild) return validMoves[0]; // Fallback to first valid move

    for (const direction of validMoves) {
      if (root.children.has(direction)) {
        const childNode = root.children.get(direction)!;
        if (childNode === bestChild) {
          return direction;
        }
      }
    }

    return validMoves[0]; // Fallback
  }

  private createNode(state: GameState, parent: MCTSNode | null = null): MCTSNode {
    const validMoves = this.getValidMoves(state);
    return {
      state: this.cloneState(state),
      parent,
      children: new Map(),
      visits: 0,
      totalScore: 0,
      untriedMoves: [...validMoves]
    };
  }

  private select(node: MCTSNode): MCTSNode {
    let current = node;
    
    while (current.untriedMoves.length === 0 && current.children.size > 0) {
      current = this.getBestChild(current, MCTS.C)!;
    }
    
    return current;
  }

  private expand(node: MCTSNode): MCTSNode {
    if (node.untriedMoves.length === 0) {
      return node;
    }

    const move = node.untriedMoves.pop()!;
    const newState = this.applyMove(node.state, move);
    const child = this.createNode(newState, node);
    
    node.children.set(move, child);
    
    return child;
  }

  private simulate(node: MCTSNode): number {
    let currentState = this.cloneState(node.state);
    let depth = 0;
    
    while (!currentState.gameOver && depth < this.maxSimulationDepth) {
      const validMoves = this.getValidMoves(currentState);
      if (validMoves.length === 0) break;
      
      const move = this.selectHeuristicMove(currentState, validMoves);
      currentState = this.applyMove(currentState, move);
      depth++;
    }
    
    return this.evaluateState(currentState);
  }

  private selectHeuristicMove(state: GameState, validMoves: Direction[]): Direction {
    if (Math.random() < 0.7) {
      return this.getHeuristicMove(state, validMoves);
    } else {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }

  private getHeuristicMove(state: GameState, validMoves: Direction[]): Direction {
    let bestMove = validMoves[0];
    let bestScore = -Infinity;
    
    for (const move of validMoves) {
      const newState = this.applyMove(state, move);
      const score = this.evaluateState(newState);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  private backpropagate(node: MCTSNode, reward: number): void {
    let current: MCTSNode | null = node;
    
    while (current !== null) {
      current.visits++;
      current.totalScore += reward;
      current = current.parent;
    }
  }

  private getBestChild(node: MCTSNode, explorationFactor: number): MCTSNode | null {
    let bestScore = -Infinity;
    let bestChild: MCTSNode | null = null;
    
    for (const child of node.children.values()) {
      const exploitation = child.totalScore / child.visits;
      const exploration = explorationFactor * Math.sqrt(Math.log(node.visits) / child.visits);
      const score = exploitation + exploration;
      
      if (score > bestScore) {
        bestScore = score;
        bestChild = child;
      }
    }
    
    return bestChild;
  }

  private getValidMoves(state: GameState): Direction[] {
    const moves: Direction[] = [];
    
    for (const direction of MCTS.DIRECTIONS) {
      const newState = this.applyMove(state, direction);
      if (!this.boardsEqual(state.board, newState.board)) {
        moves.push(direction);
      }
    }
    
    return moves;
  }

  private applyMove(state: GameState, direction: Direction): GameState {
    const newBoard = this.cloneBoard(state.board);
    const result = this.move(newBoard, direction);
    
    if (result.moved) {
      this.addRandomTile(result.board);
    }
    
    return {
      board: result.board,
      score: state.score + result.score,
      gameOver: !result.moved && this.isGameOver(result.board)
    };
  }

  private move(board: Board, direction: Direction): { board: Board; score: number; moved: boolean } {
    switch (direction) {
      case 'left':
        return this.moveLeft(board);
      case 'right':
        return this.moveRight(board);
      case 'up':
        return this.moveUp(board);
      case 'down':
        return this.moveDown(board);
    }
  }

  private moveLeft(board: Board): { board: Board; score: number; moved: boolean } {
    const newBoard = board.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(cell => cell !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          totalScore += row[j];
          row[j + 1] = 0;
          j++;
        }
      }
      
      const newRow = row.filter(cell => cell !== 0);
      while (newRow.length < 4) {
        newRow.push(0);
      }
      
      if (JSON.stringify(newRow) !== JSON.stringify(board[i])) {
        moved = true;
      }
      
      newBoard[i] = newRow;
    }

    return { board: newBoard, score: totalScore, moved };
  }

  private moveRight(board: Board): { board: Board; score: number; moved: boolean } {
    const newBoard = board.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(cell => cell !== 0);
      
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          totalScore += row[j];
          row[j - 1] = 0;
          j--;
        }
      }
      
      const newRow = row.filter(cell => cell !== 0);
      while (newRow.length < 4) {
        newRow.unshift(0);
      }
      
      if (JSON.stringify(newRow) !== JSON.stringify(board[i])) {
        moved = true;
      }
      
      newBoard[i] = newRow;
    }

    return { board: newBoard, score: totalScore, moved };
  }

  private moveUp(board: Board): { board: Board; score: number; moved: boolean } {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const result = this.moveLeft(transposedBoard);
    return {
      board: result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex])),
      score: result.score,
      moved: result.moved
    };
  }

  private moveDown(board: Board): { board: Board; score: number; moved: boolean } {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const result = this.moveRight(transposedBoard);
    return {
      board: result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex])),
      score: result.score,
      moved: result.moved
    };
  }

  private evaluateState(state: GameState): number {
    if (state.gameOver) return state.score;
    
    let score = state.score;
    
    // Bonus for empty cells
    const emptyCells = this.getEmptyCells(state.board).length;
    score += emptyCells * 15; // 增加空格的权重
    
    // Bonus for monotonicity (snake pattern)
    score += this.getMonotonicityScore(state.board);
    
    // Bonus for smoothness
    score += this.getSmoothnessScore(state.board);
    
    // Enhanced corner strategy - prefer largest tiles in corners
    score += this.getCornerStrategyScore(state.board);
    
    // Bonus for keeping high values away from center
    score += this.getCenterAvoidanceScore(state.board);
    
    // Bonus for potential merges
    score += this.getMergePotentialScore(state.board);
    
    // Bonus for board structure (prefer snake-like patterns)
    score += this.getStructureScore(state.board);
    
    return score;
  }

  private getMonotonicityScore(board: Board): number {
    let score = 0;
    
    // Enhanced monotonicity check with weighted scoring
    // Check rows
    for (let i = 0; i < 4; i++) {
      let increasing = true;
      let decreasing = true;
      let rowScore = 0;
      
      for (let j = 0; j < 3; j++) {
        if (board[i][j] > 0 && board[i][j + 1] > 0) {
          if (board[i][j] > board[i][j + 1]) increasing = false;
          if (board[i][j] < board[i][j + 1]) decreasing = false;
          
          // Bonus for adjacent tiles with good ratio
          const ratio = Math.max(board[i][j], board[i][j + 1]) / Math.min(board[i][j], board[i][j + 1]);
          if (ratio <= 2) {
            rowScore += Math.min(board[i][j], board[i][j + 1]) * 0.1;
          }
        }
      }
      
      if (increasing || decreasing) {
        score += 60 + rowScore; // 增加单调性的权重
      }
    }
    
    // Check columns
    for (let j = 0; j < 4; j++) {
      let increasing = true;
      let decreasing = true;
      let colScore = 0;
      
      for (let i = 0; i < 3; i++) {
        if (board[i][j] > 0 && board[i + 1][j] > 0) {
          if (board[i][j] > board[i + 1][j]) increasing = false;
          if (board[i][j] < board[i + 1][j]) decreasing = false;
          
          // Bonus for adjacent tiles with good ratio
          const ratio = Math.max(board[i][j], board[i + 1][j]) / Math.min(board[i][j], board[i + 1][j]);
          if (ratio <= 2) {
            colScore += Math.min(board[i][j], board[i + 1][j]) * 0.1;
          }
        }
      }
      
      if (increasing || decreasing) {
        score += 60 + colScore;
      }
    }
    
    return score;
  }

  private getSmoothnessScore(board: Board): number {
    let score = 0;
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] !== 0) {
          const value = Math.log2(board[i][j]);
          
          if (j < 3 && board[i][j + 1] !== 0) {
            const rightValue = Math.log2(board[i][j + 1]);
            score -= Math.abs(value - rightValue);
          }
          
          if (i < 3 && board[i + 1][j] !== 0) {
            const downValue = Math.log2(board[i + 1][j]);
            score -= Math.abs(value - downValue);
          }
        }
      }
    }
    
    return score;
  }

  private getCornerStrategyScore(board: Board): number {
    let score = 0;
    const maxTile = Math.max(...board.flat());
    
    // Check if largest tile is in a corner
    const corners = [
      board[0][0], board[0][3], board[3][0], board[3][3]
    ];
    
    if (corners.includes(maxTile)) {
      score += maxTile * 0.5; // 大幅增加角落大数字的奖励
    }
    
    // Bonus for having multiple high values in corners
    const sortedValues = board.flat().filter(v => v > 0).sort((a, b) => b - a);
    const topValues = sortedValues.slice(0, 4);
    
    for (const value of topValues) {
      if (corners.includes(value)) {
        score += value * 0.1;
      }
    }
    
    return score;
  }

  private getCenterAvoidanceScore(board: Board): number {
    let score = 0;
    
    // Penalize high values in center positions
    const centerPositions = [
      board[1][1], board[1][2], board[2][1], board[2][2]
    ];
    
    for (const value of centerPositions) {
      if (value > 0) {
        score -= value * 0.2; // 惩罚中心位置的大数字
      }
    }
    
    return score;
  }

  private getMergePotentialScore(board: Board): number {
    let score = 0;
    
    // Check for potential merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) continue;
        
        const currentValue = board[i][j];
        
        // Check horizontal merges
        if (j < 3 && board[i][j + 1] === currentValue) {
          score += currentValue * 0.3;
        }
        
        // Check vertical merges
        if (i < 3 && board[i + 1][j] === currentValue) {
          score += currentValue * 0.3;
        }
      }
    }
    
    return score;
  }

  private getStructureScore(board: Board): number {
    let score = 0;
    
    // Prefer snake-like patterns (monotonic rows/columns)
    // Check for snake pattern starting from top-left
    let snakeScore = 0;
    let currentValue = 0;
    
    // Check first row (left to right)
    for (let j = 0; j < 4; j++) {
      if (board[0][j] > 0) {
        if (currentValue === 0 || board[0][j] <= currentValue) {
          snakeScore += board[0][j];
          currentValue = board[0][j];
        }
      }
    }
    
    // Check last column (top to bottom)
    for (let i = 1; i < 4; i++) {
      if (board[i][3] > 0) {
        if (currentValue === 0 || board[i][3] <= currentValue) {
          snakeScore += board[i][3];
          currentValue = board[i][3];
        }
      }
    }
    
    // Check last row (right to left)
    for (let j = 2; j >= 0; j--) {
      if (board[3][j] > 0) {
        if (currentValue === 0 || board[3][j] <= currentValue) {
          snakeScore += board[3][j];
          currentValue = board[3][j];
        }
      }
    }
    
    score += snakeScore * 0.2;
    
    return score;
  }

  private addRandomTile(board: Board): void {
    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  private getEmptyCells(board: Board): Array<{ row: number; col: number }> {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    return emptyCells;
  }

  private isGameOver(board: Board): boolean {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
        if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        if (i < 3 && board[i][j] === board[i + 1][j]) return false;
      }
    }
    return true;
  }

  private cloneBoard(board: Board): Board {
    return board.map(row => [...row]);
  }

  private cloneState(state: GameState): GameState {
    return {
      board: this.cloneBoard(state.board),
      score: state.score,
      gameOver: state.gameOver
    };
  }

  private boardsEqual(board1: Board, board2: Board): boolean {
    return JSON.stringify(board1) === JSON.stringify(board2);
  }

}