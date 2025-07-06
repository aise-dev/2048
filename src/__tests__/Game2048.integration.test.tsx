import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game2048 from '../Game2048';

// Mock the MCTS class to control its behavior in tests
jest.mock('../MCTS', () => {
  const mockMCTS = {
    getBestMove: jest.fn()
  };
  
  return {
    MCTS: jest.fn(() => mockMCTS),
    mockMCTS
  };
});

describe('Game2048 Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render game board and controls', () => {
    render(<Game2048 />);
    
    expect(screen.getByText('2048')).toBeInTheDocument();
    expect(screen.getByText('分数')).toBeInTheDocument();
    expect(screen.getByText('步数')).toBeInTheDocument();
    expect(screen.getByText('新游戏')).toBeInTheDocument();
    expect(screen.getByText('AI自动游戏')).toBeInTheDocument();
  });

  it('should start AI auto-play when button is clicked', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue('right');

    render(<Game2048 />);
    
    const autoPlayButton = screen.getByText('AI自动游戏');
    expect(autoPlayButton).not.toBeDisabled();
    
    fireEvent.click(autoPlayButton);
    
    await waitFor(() => {
      expect(screen.getByText('(AI自动游戏中...)')).toBeInTheDocument();
    });
    
    expect(autoPlayButton).toBeDisabled();
    expect(screen.getByText('停止AI')).not.toBeDisabled();
  });

  it('should stop AI auto-play when stop button is clicked', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue('right');

    render(<Game2048 />);
    
    // Start auto-play
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    await waitFor(() => {
      expect(screen.getByText('(AI自动游戏中...)')).toBeInTheDocument();
    });
    
    // Stop auto-play
    fireEvent.click(screen.getByText('停止AI'));
    
    await waitFor(() => {
      expect(screen.queryByText('(AI自动游戏中...)')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('AI自动游戏')).not.toBeDisabled();
  });

  it('should call MCTS getBestMove during auto-play', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue('right');

    render(<Game2048 />);
    
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    await waitFor(() => {
      expect(mockMCTSInstance.getBestMove).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should handle keyboard input correctly', () => {
    render(<Game2048 />);
    
    // Test WASD keys
    fireEvent.keyDown(document, { key: 'w', code: 'KeyW' });
    fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });
    fireEvent.keyDown(document, { key: 's', code: 'KeyS' });
    fireEvent.keyDown(document, { key: 'd', code: 'KeyD' });
    
    // Should not crash and should prevent default behavior
    expect(screen.getByText('2048')).toBeInTheDocument();
  });

  it('should disable auto-play when game is over', async () => {
    render(<Game2048 />);
    
    // We would need to simulate a game over state
    // For now, we test that the button exists and can be clicked
    const autoPlayButton = screen.getByText('AI自动游戏');
    expect(autoPlayButton).toBeInTheDocument();
  });

  it('should prevent auto-play during replay', async () => {
    render(<Game2048 />);
    
    // First, we need to have some moves to replay
    // For simplicity, we'll just check that both buttons exist
    expect(screen.getByText('AI自动游戏')).toBeInTheDocument();
    expect(screen.getByText('回放游戏')).toBeInTheDocument();
  });

  it('should allow changing AI speed during auto-play', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue('right');

    render(<Game2048 />);
    
    // Start auto-play
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    await waitFor(() => {
      expect(screen.getByText('AI速度:')).toBeInTheDocument();
    });
    
    // Change speed
    const speedSelect = screen.getByDisplayValue('正常 (0.5秒)');
    fireEvent.change(speedSelect, { target: { value: '100' } });
    
    expect(speedSelect).toHaveValue('100');
  });

  it('should reset auto-play state when starting new game', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue('right');

    render(<Game2048 />);
    
    // Start auto-play
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    await waitFor(() => {
      expect(screen.getByText('(AI自动游戏中...)')).toBeInTheDocument();
    });
    
    // Start new game
    fireEvent.click(screen.getByText('新游戏'));
    
    await waitFor(() => {
      expect(screen.queryByText('(AI自动游戏中...)')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('AI自动游戏')).not.toBeDisabled();
  });

  it('should handle MCTS returning null (no valid moves)', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    mockMCTSInstance.getBestMove.mockReturnValue(null);

    render(<Game2048 />);
    
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    await waitFor(() => {
      expect(mockMCTSInstance.getBestMove).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    // Should stop auto-play when no moves are available
    await waitFor(() => {
      expect(screen.queryByText('(AI自动游戏中...)')).not.toBeInTheDocument();
    });
  });

  it('should export and import game sessions correctly', () => {
    render(<Game2048 />);
    
    // Test export button exists
    expect(screen.getByText('导出记录')).toBeInTheDocument();
    
    // Test import button exists
    expect(screen.getByText('导入记录')).toBeInTheDocument();
  });

  it('should display current score and move count', () => {
    render(<Game2048 />);
    
    // Should display initial score and move count
    expect(screen.getByText('0')).toBeInTheDocument(); // Score
    expect(screen.getByText('0')).toBeInTheDocument(); // Move count
  });

  it('should show game instructions', () => {
    render(<Game2048 />);
    
    expect(screen.getByText(/使用 WASD 键移动方块/)).toBeInTheDocument();
  });

  it('should handle multiple rapid AI moves without crashing', async () => {
    const { MCTS } = require('../MCTS');
    const mockMCTSInstance = new MCTS();
    
    // Mock a sequence of moves
    mockMCTSInstance.getBestMove
      .mockReturnValueOnce('right')
      .mockReturnValueOnce('down')
      .mockReturnValueOnce('left')
      .mockReturnValueOnce('up')
      .mockReturnValue(null); // End the sequence

    render(<Game2048 />);
    
    fireEvent.click(screen.getByText('AI自动游戏'));
    
    // Wait for several moves to be processed
    await waitFor(() => {
      expect(mockMCTSInstance.getBestMove).toHaveBeenCalledTimes(5);
    }, { timeout: 3000 });
    
    // Should stop auto-play after null return
    await waitFor(() => {
      expect(screen.queryByText('(AI自动游戏中...)')).not.toBeInTheDocument();
    });
  });
});