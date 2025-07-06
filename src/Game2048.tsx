import React, { useState, useEffect, useCallback } from 'react';
import './Game2048.css';

type Board = number[][];

type GameMove = {
  direction: 'left' | 'right' | 'up' | 'down';
  boardBefore: Board;
  boardAfter: Board;
  score: number;
  timestamp: number;
};

type GameSession = {
  moves: GameMove[];
  finalScore: number;
  startTime: number;
  endTime?: number;
};

const Game2048: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession>(() => ({
    moves: [],
    finalScore: 0,
    startTime: Date.now()
  }));
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1000);

  function initializeBoard(): Board {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board: Board) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function moveLeft(board: Board): { board: Board; score: number; moved: boolean } {
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

  function moveRight(board: Board): { board: Board; score: number; moved: boolean } {
    console.log('moveRight called with board:', board);
    const newBoard = board.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(cell => cell !== 0);
      
      // 从右到左合并相同的数字
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
        newRow.unshift(0); // 在左边添加0
      }
      
      if (JSON.stringify(newRow) !== JSON.stringify(board[i])) {
        moved = true;
      }
      
      newBoard[i] = newRow;
    }

    console.log('moveRight result:', { board: newBoard, score: totalScore, moved });
    return { board: newBoard, score: totalScore, moved };
  }

  function moveUp(board: Board): { board: Board; score: number; moved: boolean } {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const result = moveLeft(transposedBoard);
    return {
      board: result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex])),
      score: result.score,
      moved: result.moved
    };
  }

  function moveDown(board: Board): { board: Board; score: number; moved: boolean } {
    const transposedBoard = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
    const rotatedBoard = transposedBoard.map(row => [...row].reverse());
    const result = moveLeft(rotatedBoard);
    const finalBoard = result.board.map(row => [...row].reverse());
    return {
      board: finalBoard[0].map((_, colIndex) => finalBoard.map(row => row[colIndex])),
      score: result.score,
      moved: result.moved
    };
  }

  function isGameOver(board: Board): boolean {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
        if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        if (i < 3 && board[i][j] === board[i + 1][j]) return false;
      }
    }
    return true;
  }

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver || isReplaying) return;

    console.log('HandleMove called with direction:', direction);
    console.log('Current board:', board);

    let result;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
      default:
        return;
    }

    console.log('Move result:', result);

    if (result.moved) {
      const boardBefore = board.map(row => [...row]);
      addRandomTile(result.board);
      
      const move: GameMove = {
        direction,
        boardBefore,
        boardAfter: result.board.map(row => [...row]),
        score: result.score,
        timestamp: Date.now()
      };
      
      setGameSession(prev => ({
        ...prev,
        moves: [...prev.moves, move]
      }));
      
      setBoard(result.board);
      setScore(prev => prev + result.score);
      
      if (isGameOver(result.board)) {
        setGameOver(true);
        setGameSession(prev => ({
          ...prev,
          finalScore: score + result.score,
          endTime: Date.now()
        }));
      }
    }
  }, [board, gameOver, isReplaying, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log('=== KEY EVENT DEBUG ===');
      console.log('Key pressed:', e.key.toLowerCase());
      console.log('Key code:', e.keyCode);
      console.log('Code:', e.code);
      console.log('Target:', e.target);
      console.log('Current target:', e.currentTarget);
      console.log('Event type:', e.type);
      console.log('Default prevented:', e.defaultPrevented);
      
      e.preventDefault();
      
      switch (e.key.toLowerCase()) {
        case 'w':
          console.log('Moving up');
          handleMove('up');
          break;
        case 'a':
          console.log('Moving left');
          handleMove('left');
          break;
        case 's':
          console.log('Moving down');
          handleMove('down');
          break;
        case 'd':
          console.log('Moving right - D key detected!');
          handleMove('right');
          break;
        default:
          console.log('Unhandled key:', e.key.toLowerCase());
      }
      console.log('=== END KEY EVENT DEBUG ===');
    };

    console.log('Adding keyboard event listener');
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      console.log('Removing keyboard event listener');
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleMove]);

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setIsReplaying(false);
    setReplayIndex(0);
    setGameSession({
      moves: [],
      finalScore: 0,
      startTime: Date.now()
    });
  };

  const startReplay = () => {
    if (gameSession.moves.length === 0) return;
    
    setIsReplaying(true);
    setReplayIndex(0);
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  };

  const stopReplay = () => {
    setIsReplaying(false);
    setReplayIndex(0);
  };

  const exportGameSession = () => {
    const dataStr = JSON.stringify(gameSession, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `2048-game-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importGameSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSession = JSON.parse(e.target?.result as string);
        setGameSession(importedSession);
      } catch (error) {
        alert('导入文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (!isReplaying || replayIndex >= gameSession.moves.length) return;

    const timer = setTimeout(() => {
      const move = gameSession.moves[replayIndex];
      setBoard(move.boardAfter);
      setScore(prev => prev + move.score);
      setReplayIndex(prev => prev + 1);
      
      if (replayIndex === gameSession.moves.length - 1) {
        setTimeout(() => {
          setIsReplaying(false);
          setGameOver(true);
        }, replaySpeed);
      }
    }, replaySpeed);

    return () => clearTimeout(timer);
  }, [isReplaying, replayIndex, gameSession.moves, replaySpeed]);

  return (
    <div className="game-container" tabIndex={0}>
      <div className="game-header">
        <h1>2048</h1>
        <div className="score-container">
          <div className="score-box">
            <div className="score-label">分数</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-box">
            <div className="score-label">步数</div>
            <div className="score-value">{gameSession.moves.length}</div>
          </div>
          <button className="new-game-button" onClick={resetGame}>
            新游戏
          </button>
        </div>
      </div>
      
      <div className="game-instructions">
        使用 WASD 键移动方块 {isReplaying && '(回放中...)'}
        <br />
        <small style={{color: '#999'}}>调试: 请按D键测试，查看控制台输出</small>
      </div>
      
      <div className="replay-controls">
        <button 
          className="replay-button" 
          onClick={startReplay}
          disabled={isReplaying || gameSession.moves.length === 0}
        >
          回放游戏
        </button>
        <button 
          className="replay-button" 
          onClick={stopReplay}
          disabled={!isReplaying}
        >
          停止回放
        </button>
        <button 
          className="replay-button" 
          onClick={exportGameSession}
          disabled={gameSession.moves.length === 0}
        >
          导出记录
        </button>
        <label className="import-button">
          导入记录
          <input 
            type="file" 
            accept=".json" 
            onChange={importGameSession}
            style={{ display: 'none' }}
          />
        </label>
        {isReplaying && (
          <div className="speed-control">
            <label>回放速度:</label>
            <select 
              value={replaySpeed} 
              onChange={(e) => setReplaySpeed(Number(e.target.value))}
            >
              <option value={2000}>慢 (2秒)</option>
              <option value={1000}>正常 (1秒)</option>
              <option value={500}>快 (0.5秒)</option>
              <option value={200}>很快 (0.2秒)</option>
            </select>
          </div>
        )}
      </div>

      <div className="game-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`board-cell ${cell ? `cell-${cell}` : ''}`}
              >
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>游戏结束!</h2>
            <p>最终得分: {score}</p>
            <button onClick={resetGame}>重新开始</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;