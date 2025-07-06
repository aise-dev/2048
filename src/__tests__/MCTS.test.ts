import { MCTS, type GameState } from '../MCTS';

describe('MCTS', () => {
  let mcts: MCTS;

  beforeEach(() => {
    mcts = new MCTS(100, 10);
  });

  describe('constructor', () => {
    it('should create MCTS instance with default parameters', () => {
      const defaultMcts = new MCTS();
      expect(defaultMcts).toBeInstanceOf(MCTS);
    });

    it('should create MCTS instance with custom parameters', () => {
      const customMcts = new MCTS(500, 50);
      expect(customMcts).toBeInstanceOf(MCTS);
    });
  });

  describe('getBestMove', () => {
    it('should return null for game over state', () => {
      const gameOverState: GameState = {
        board: [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2]
        ],
        score: 100,
        gameOver: true
      };

      const bestMove = mcts.getBestMove(gameOverState);
      expect(bestMove).toBeNull();
    });

    it('should return a valid move for active game state', () => {
      const activeState: GameState = {
        board: [
          [2, 2, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const bestMove = mcts.getBestMove(activeState);
      expect(bestMove).not.toBeNull();
      expect(['left', 'right', 'up', 'down']).toContain(bestMove);
    });

    it('should return null when no moves are possible', () => {
      const noMovesState: GameState = {
        board: [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2]
        ],
        score: 100,
        gameOver: false
      };

      const bestMove = mcts.getBestMove(noMovesState);
      expect(bestMove).toBeNull();
    });
  });

  describe('move operations', () => {
    it('should correctly move tiles left', () => {
      const initialState: GameState = {
        board: [
          [0, 2, 0, 2],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const newState = (mcts as any).applyMove(initialState, 'left');
      expect(newState.board[0]).toEqual([4, 0, 0, 0]);
      expect(newState.score).toBe(4);
    });

    it('should correctly move tiles right', () => {
      const initialState: GameState = {
        board: [
          [2, 0, 2, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const newState = (mcts as any).applyMove(initialState, 'right');
      expect(newState.board[0]).toEqual([0, 0, 0, 4]);
      expect(newState.score).toBe(4);
    });

    it('should correctly move tiles up', () => {
      const initialState: GameState = {
        board: [
          [0, 0, 0, 0],
          [2, 0, 0, 0],
          [0, 0, 0, 0],
          [2, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const newState = (mcts as any).applyMove(initialState, 'up');
      expect(newState.board[0][0]).toBe(4);
      expect(newState.score).toBe(4);
    });

    it('should correctly move tiles down', () => {
      const initialState: GameState = {
        board: [
          [2, 0, 0, 0],
          [0, 0, 0, 0],
          [2, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const newState = (mcts as any).applyMove(initialState, 'down');
      expect(newState.board[3][0]).toBe(4);
      expect(newState.score).toBe(4);
    });
  });

  describe('board evaluation', () => {
    it('should evaluate empty board positively', () => {
      const emptyBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const score = (mcts as any).evaluateState({
        board: emptyBoard,
        score: 0,
        gameOver: false
      });

      expect(score).toBeGreaterThan(0);
    });

    it('should evaluate monotonic board positively', () => {
      const monotonicBoard = [
        [16, 8, 4, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const score = (mcts as any).evaluateState({
        board: monotonicBoard,
        score: 100,
        gameOver: false
      });

      expect(score).toBeGreaterThan(100);
    });

    it('should give bonus for corner placement', () => {
      const cornerBoard = [
        [64, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const score = (mcts as any).evaluateState({
        board: cornerBoard,
        score: 100,
        gameOver: false
      });

      expect(score).toBeGreaterThan(100);
    });
  });

  describe('game over detection', () => {
    it('should detect game over when board is full and no moves possible', () => {
      const fullBoard = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];

      const isGameOver = (mcts as any).isGameOver(fullBoard);
      expect(isGameOver).toBe(true);
    });

    it('should not detect game over when moves are still possible', () => {
      const playableBoard = [
        [2, 2, 4, 8],
        [4, 8, 2, 4],
        [2, 4, 8, 2],
        [8, 2, 4, 8]
      ];

      const isGameOver = (mcts as any).isGameOver(playableBoard);
      expect(isGameOver).toBe(false);
    });

    it('should not detect game over when board has empty cells', () => {
      const boardWithEmpty = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 0, 2]
      ];

      const isGameOver = (mcts as any).isGameOver(boardWithEmpty);
      expect(isGameOver).toBe(false);
    });
  });

  describe('valid moves detection', () => {
    it('should detect all valid moves for simple board', () => {
      const simpleBoard: GameState = {
        board: [
          [2, 0, 2, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const validMoves = (mcts as any).getValidMoves(simpleBoard);
      expect(validMoves.length).toBeGreaterThan(0);
      expect(validMoves.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect no valid moves for locked board', () => {
      const lockedBoard: GameState = {
        board: [
          [2, 4, 2, 4],
          [4, 2, 4, 2],
          [2, 4, 2, 4],
          [4, 2, 4, 2]
        ],
        score: 0,
        gameOver: false
      };

      const validMoves = (mcts as any).getValidMoves(lockedBoard);
      expect(validMoves.length).toBe(0);
    });
  });

  describe('simulation', () => {
    it('should complete simulation without errors', () => {
      const initialState: GameState = {
        board: [
          [2, 0, 0, 0],
          [0, 2, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const node = (mcts as any).createNode(initialState);
      const reward = (mcts as any).simulate(node);
      
      expect(typeof reward).toBe('number');
      expect(reward).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performance', () => {
    it('should complete getBestMove within reasonable time', () => {
      const startTime = Date.now();
      
      const testState: GameState = {
        board: [
          [2, 4, 2, 0],
          [0, 2, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        score: 0,
        gameOver: false
      };

      const bestMove = mcts.getBestMove(testState);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(bestMove).not.toBeNull();
    });
  });
});