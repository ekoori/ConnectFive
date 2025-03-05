import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useInfiniteCanvas } from '../hooks/useInfiniteCanvas';
import { aiMove } from '../utils/ai';

const BoardContainer = styled.div`
  position: relative;
  width: 95vw;
  height: 85vh;
  margin-top: 10px;
  border: 1px solid #ccc;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f0f0f0;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
`;

const PlayerIndicator = styled.div<{ isCurrentPlayer: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: ${({ isCurrentPlayer }) => (isCurrentPlayer ? 'bold' : 'normal')};
  color: ${({ isCurrentPlayer }) => (isCurrentPlayer ? '#2196F3' : '#666')};
`;

const PlayerCircle = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const BackButton = styled(Button)`
  background-color: #f44336;
  
  &:hover {
    background-color: #da190b;
  }
`;

const ResetButton = styled(Button)`
  background-color: #ff9800;
  
  &:hover {
    background-color: #e68a00;
  }
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const WinnerMessage = styled.div`
  color: white;
  font-size: 2rem;
  margin-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
`;

const CELL_SIZE = 40;
const PLAYER_COLORS = ['#e74c3c', '#3498db']; // Red, Blue

interface GameBoardProps {
  gameMode: 'human' | 'ai-easy' | 'ai-medium' | 'ai-hard';
  onBackToMenu: () => void;
}

interface Cell {
  x: number;
  y: number;
  player: number | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ x: number, y: number } | null>(null);
  
  const { 
    offset, 
    scale,
    panStart, 
    panMove, 
    panEnd, 
    zoom,
    resetView
  } = useInfiniteCanvas(canvasRef);

  // Convert screen coordinates to grid coordinates
  const screenToGrid = (screenX: number, screenY: number) => {
    const x = Math.floor((screenX / scale - offset.x) / CELL_SIZE);
    const y = Math.floor((screenY / scale - offset.y) / CELL_SIZE);
    return { x, y };
  };

  // Convert grid coordinates to screen coordinates
  const gridToScreen = (gridX: number, gridY: number) => {
    const x = gridX * CELL_SIZE * scale + offset.x * scale;
    const y = gridY * CELL_SIZE * scale + offset.y * scale;
    return { x, y };
  };

  // Check if a cell is occupied
  const isCellOccupied = (x: number, y: number) => {
    const key = `${x},${y}`;
    return cells[key] !== undefined;
  };

  // Place a stone at the specified grid position
  const placeStone = (x: number, y: number, player: number) => {
    if (winner !== null || isCellOccupied(x, y)) return false;

    const newCells = { ...cells };
    const key = `${x},${y}`;
    newCells[key] = { x, y, player };
    setCells(newCells);
    setLastMove({ x, y });

    // Check for win
    if (checkWin(x, y, player, newCells)) {
      setWinner(player);
      return true;
    }

    setCurrentPlayer((currentPlayer + 1) % 2 as 0 | 1);
    return true;
  };

  // Check for win
  const checkWin = (x: number, y: number, player: number, cellMap: Record<string, Cell>) => {
    const directions = [
      [1, 0],   // Horizontal
      [0, 1],   // Vertical
      [1, 1],   // Diagonal (top-left to bottom-right)
      [1, -1],  // Diagonal (bottom-left to top-right)
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      // Check in the positive direction
      for (let i = 1; i < 5; i++) {
        const key = `${x + dx * i},${y + dy * i}`;
        if (cellMap[key]?.player === player) {
          count++;
        } else {
          break;
        }
      }

      // Check in the negative direction
      for (let i = 1; i < 5; i++) {
        const key = `${x - dx * i},${y - dy * i}`;
        if (cellMap[key]?.player === player) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  };

  // Handle click on the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (winner !== null) return;
    if (gameMode !== 'human' && currentPlayer === 1) return; // Don't allow clicks when AI's turn
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridPos = screenToGrid(x, y);
    placeStone(gridPos.x, gridPos.y, currentPlayer);
  };

  // Reset the game
  const resetGame = () => {
    setCells({});
    setCurrentPlayer(0);
    setWinner(null);
    setLastMove(null);
  };

  // AI's turn
  useEffect(() => {
    if (winner !== null) return;
    if (gameMode === 'human' || currentPlayer === 0) return;

    // Add a small delay to make it feel more natural
    const timeoutId = setTimeout(() => {
      const difficulty = gameMode.split('-')[1] as 'easy' | 'medium' | 'hard';
      const move = aiMove(cells, currentPlayer, difficulty, lastMove);
      
      if (move) {
        placeStone(move.x, move.y, currentPlayer);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentPlayer, gameMode]);

  // Draw the board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transform
    ctx.save();
    ctx.translate(offset.x * scale, offset.y * scale);
    ctx.scale(scale, scale);
    
    // Calculate visible grid boundaries
    const leftCell = Math.floor(-offset.x / CELL_SIZE) - 1;
    const topCell = Math.floor(-offset.y / CELL_SIZE) - 1;
    const rightCell = Math.ceil((canvas.width / scale - offset.x) / CELL_SIZE) + 1;
    const bottomCell = Math.ceil((canvas.height / scale - offset.y) / CELL_SIZE) + 1;
    
    // Draw the grid
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = leftCell; x <= rightCell; x++) {
      ctx.moveTo(x * CELL_SIZE, topCell * CELL_SIZE);
      ctx.lineTo(x * CELL_SIZE, bottomCell * CELL_SIZE);
    }
    
    // Horizontal lines
    for (let y = topCell; y <= bottomCell; y++) {
      ctx.moveTo(leftCell * CELL_SIZE, y * CELL_SIZE);
      ctx.lineTo(rightCell * CELL_SIZE, y * CELL_SIZE);
    }
    
    ctx.stroke();
    
    // Draw center point
    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw stones
    Object.values(cells).forEach(cell => {
      ctx.beginPath();
      ctx.fillStyle = PLAYER_COLORS[cell.player];
      ctx.arc(
        cell.x * CELL_SIZE + CELL_SIZE / 2,
        cell.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Highlight last move
    if (lastMove) {
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.arc(
        lastMove.x * CELL_SIZE + CELL_SIZE / 2,
        lastMove.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 0.5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }, [cells, offset, scale, lastMove]);

  // Handle canvas resize with ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    // Set initial size
    handleResize();
    
    // Set up ResizeObserver for more accurate size tracking
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(canvas);
    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <StatusBar>
        <PlayerIndicator isCurrentPlayer={currentPlayer === 0}>
          <PlayerCircle color={PLAYER_COLORS[0]} />
          <span>Player {gameMode === 'human' ? '1' : 'You'}</span>
        </PlayerIndicator>
        
        <div>
          <ResetButton onClick={resetGame}>Reset Game</ResetButton>
          <BackButton onClick={onBackToMenu}>Back to Menu</BackButton>
        </div>
        
        <PlayerIndicator isCurrentPlayer={currentPlayer === 1}>
          <PlayerCircle color={PLAYER_COLORS[1]} />
          <span>Player {gameMode === 'human' ? '2' : 'AI'}</span>
        </PlayerIndicator>
      </StatusBar>
      
      <BoardContainer
        onMouseDown={(e) => {
          if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            panStart(e.clientX, e.clientY);
            e.preventDefault();
          }
        }}
        onMouseMove={(e) => panMove(e.clientX, e.clientY)}
        onMouseUp={panEnd}
        onMouseLeave={panEnd}
        onWheel={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          zoom(e.deltaY < 0 ? 1.1 : 0.9, x, y);
          e.preventDefault();
        }}
      >
        <Canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        {winner !== null && (
          <GameOverlay>
            <WinnerMessage>
              {gameMode === 'human' 
                ? `Player ${winner + 1} Wins!` 
                : winner === 0 ? 'You Win!' : 'AI Wins!'}
            </WinnerMessage>
            <ResetButton onClick={resetGame}>Play Again</ResetButton>
          </GameOverlay>
        )}
      </BoardContainer>
    </div>
  );
};

export default GameBoard;