interface Cell {
  x: number;
  y: number;
  player: number | null;
}

interface Move {
  x: number;
  y: number;
  score: number;
}

// Maps for evaluating board state
const scoreMap: Record<string, number> = {
  '5': 100000,    // Five in a row (win)
  '4': 10000,     // Four in a row (one move from win)
  '3': 1000,      // Three in a row
  '2': 100,       // Two in a row
  '1': 10,        // One stone
};

// Check if a position is valid
const isValidPosition = (x: number, y: number, cells: Record<string, Cell>): boolean => {
  return cells[`${x},${y}`] === undefined;
};

// Get all existing cells boundaries to optimize search space
const getBoundaries = (cells: Record<string, Cell>): { minX: number, minY: number, maxX: number, maxY: number } => {
  if (Object.keys(cells).length === 0) {
    return { minX: -5, minY: -5, maxX: 5, maxY: 5 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  Object.values(cells).forEach(cell => {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  });
  
  // Add a buffer zone around existing stones
  return {
    minX: minX - 3,
    minY: minY - 3,
    maxX: maxX + 3,
    maxY: maxY + 3
  };
};

// Evaluate the score of a given direction
const evaluateDirection = (
  x: number, 
  y: number, 
  dx: number, 
  dy: number, 
  player: number, 
  cells: Record<string, Cell>
): number => {
  let count = 1; // Start with the current position
  let blocked = 0; // 0, 1, or 2 blocked ends
  
  // Check positive direction
  for (let i = 1; i < 5; i++) {
    const key = `${x + dx * i},${y + dy * i}`;
    if (cells[key]?.player === player) {
      count++;
    } else {
      if (cells[key] !== undefined) {
        blocked++;
      }
      break;
    }
  }
  
  // Check negative direction
  for (let i = 1; i < 5; i++) {
    const key = `${x - dx * i},${y - dy * i}`;
    if (cells[key]?.player === player) {
      count++;
    } else {
      if (cells[key] !== undefined) {
        blocked++;
      }
      break;
    }
  }
  
  // Adjust score based on blockage
  if (blocked === 2 && count < 5) {
    return 0; // Both ends blocked and not winning
  }
  
  return blocked === 0 ? scoreMap[count.toString()] || 0 : (scoreMap[count.toString()] || 0) / 2;
};

// Evaluate the score of a position for a player
const evaluatePosition = (
  x: number, 
  y: number, 
  player: number, 
  cells: Record<string, Cell>
): number => {
  if (!isValidPosition(x, y, cells)) {
    return -1;
  }
  
  const directions = [
    [1, 0],   // Horizontal
    [0, 1],   // Vertical
    [1, 1],   // Diagonal (top-left to bottom-right)
    [1, -1],  // Diagonal (bottom-left to top-right)
  ];
  
  let totalScore = 0;
  
  for (const [dx, dy] of directions) {
    totalScore += evaluateDirection(x, y, dx, dy, player, cells);
  }
  
  return totalScore;
};

// Check if a position has any neighbors
const hasNeighbor = (x: number, y: number, cells: Record<string, Cell>): boolean => {
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      
      const key = `${x + dx},${y + dy}`;
      if (cells[key] !== undefined) {
        return true;
      }
    }
  }
  
  return false;
};

// Find all valid candidate moves
const getCandidateMoves = (cells: Record<string, Cell>): { x: number, y: number }[] => {
  const { minX, minY, maxX, maxY } = getBoundaries(cells);
  const candidates: { x: number, y: number }[] = [];
  
  // If board is empty, start at center
  if (Object.keys(cells).length === 0) {
    return [{ x: 0, y: 0 }];
  }
  
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (isValidPosition(x, y, cells) && hasNeighbor(x, y, cells)) {
        candidates.push({ x, y });
      }
    }
  }
  
  return candidates;
};

// Easy AI: Random valid move with some basic strategy
const easyAI = (
  cells: Record<string, Cell>, 
  player: number, 
  lastMove: { x: number, y: number } | null
): { x: number, y: number } => {
  const opponent = 1 - player;
  const candidates = getCandidateMoves(cells);
  
  if (candidates.length === 0) {
    return { x: 0, y: 0 };
  }
  
  // Look for winning move
  for (const move of candidates) {
    const testCells = { ...cells };
    testCells[`${move.x},${move.y}`] = { x: move.x, y: move.y, player };
    
    if (evaluatePosition(move.x, move.y, player, cells) >= scoreMap['5']) {
      return move;
    }
  }
  
  // Look for blocking opponent's win
  for (const move of candidates) {
    const testCells = { ...cells };
    testCells[`${move.x},${move.y}`] = { x: move.x, y: move.y, opponent };
    
    if (evaluatePosition(move.x, move.y, opponent, cells) >= scoreMap['4']) {
      return move;
    }
  }
  
  // Otherwise random move
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// Medium AI: More strategic, but doesn't look too far ahead
const mediumAI = (
  cells: Record<string, Cell>, 
  player: number, 
  lastMove: { x: number, y: number } | null
): { x: number, y: number } => {
  const opponent = 1 - player;
  const candidates = getCandidateMoves(cells);
  
  if (candidates.length === 0) {
    return { x: 0, y: 0 };
  }
  
  // Evaluate all candidate moves
  const scoredMoves: Move[] = candidates.map(move => {
    // Evaluate offensive potential
    const playerScore = evaluatePosition(move.x, move.y, player, cells);
    
    // Evaluate defensive potential
    const opponentScore = evaluatePosition(move.x, move.y, opponent, cells);
    
    // Combined score (prioritize defense slightly)
    const score = playerScore + opponentScore * 1.1;
    
    return { ...move, score };
  });
  
  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness to the top moves for variety
  const topMoves = scoredMoves.slice(0, 3);
  const selectedIndex = Math.floor(Math.random() * Math.min(3, topMoves.length));
  
  return topMoves[selectedIndex];
};

// Hard AI: Strategic with better evaluation
const hardAI = (
  cells: Record<string, Cell>, 
  player: number, 
  lastMove: { x: number, y: number } | null
): { x: number, y: number } => {
  const opponent = 1 - player;
  const candidates = getCandidateMoves(cells);
  
  if (candidates.length === 0) {
    return { x: 0, y: 0 };
  }
  
  // Evaluate all candidate moves
  const scoredMoves: Move[] = candidates.map(move => {
    // Create a test board with this move
    const testCells = { ...cells };
    testCells[`${move.x},${move.y}`] = { x: move.x, y: move.y, player };
    
    // Evaluate offensive potential
    const playerScore = evaluatePosition(move.x, move.y, player, cells);
    
    // Evaluate defensive potential
    const opponentScore = evaluatePosition(move.x, move.y, opponent, cells);
    
    // Look ahead: What's the best move opponent can make after this?
    const opponentCandidates = getCandidateMoves(testCells);
    let maxOpponentScore = 0;
    
    for (const opMove of opponentCandidates) {
      const opScore = evaluatePosition(opMove.x, opMove.y, opponent, testCells);
      maxOpponentScore = Math.max(maxOpponentScore, opScore);
    }
    
    // Combined score (prioritize immediate win, then blocks, then future potential)
    let score = 0;
    
    // Check for immediate win
    if (playerScore >= scoreMap['5']) {
      score = 1000000;
    } 
    // Check for immediate block
    else if (opponentScore >= scoreMap['4']) {
      score = 500000;
    }
    // Otherwise, balance offense, defense, and future
    else {
      score = playerScore * 1.2 + opponentScore - maxOpponentScore * 0.5;
    }
    
    return { ...move, score };
  });
  
  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Top move with a small chance of second-best for variety
  return Math.random() < 0.9 ? scoredMoves[0] : scoredMoves[1] || scoredMoves[0];
};

// Main AI move function
export const aiMove = (
  cells: Record<string, Cell>, 
  player: number, 
  difficulty: 'easy' | 'medium' | 'hard',
  lastMove: { x: number, y: number } | null
): { x: number, y: number } => {
  switch (difficulty) {
    case 'easy':
      return easyAI(cells, player, lastMove);
    case 'medium':
      return mediumAI(cells, player, lastMove);
    case 'hard':
      return hardAI(cells, player, lastMove);
    default:
      return easyAI(cells, player, lastMove);
  }
};