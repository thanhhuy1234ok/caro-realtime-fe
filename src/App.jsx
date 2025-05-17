import React, { useState, useEffect } from 'react';
import Board from '../src/page/Board';
import './App.css';

const calculateWinner = (squares, size) => {
  if (size === 3) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], 
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6],            
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], winningSquares: line };
      }
    }
  } else if (size === 6) {
    const inARow = 5;
    const checkLine = (start, delta) => {
      let symbol = squares[start];
      if (!symbol) return null;
      for (let i = 1; i < inARow; i++) {
        if (squares[start + i * delta] !== symbol) return null;
      }
      return Array.from({ length: inARow }, (_, i) => start + i * delta);
    };

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const idx = row * size + col;

        if (!squares[idx]) continue;

        // Ngang
        if (col + inARow <= size) {
          const winningSquares = checkLine(idx, 1);
          if (winningSquares) return { winner: squares[idx], winningSquares };
        }

        // Dọc
        if (row + inARow <= size) {
          const winningSquares = checkLine(idx, size);
          if (winningSquares) return { winner: squares[idx], winningSquares };
        }

        // Chéo chính
        if (row + inARow <= size && col + inARow <= size) {
          const winningSquares = checkLine(idx, size + 1);
          if (winningSquares) return { winner: squares[idx], winningSquares };
        }

        // Chéo phụ
        if (row + inARow <= size && col - inARow + 1 >= 0) {
          const winningSquares = checkLine(idx, size - 1);
          if (winningSquares) return { winner: squares[idx], winningSquares };
        }
      }
    }
  }
  return null;
};

const App = () => {
  const [boardSize, setBoardSize] = useState(3);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    setSquares(Array(boardSize * boardSize).fill(null));
    setXIsNext(true);
  }, [boardSize]);

  const winnerInfo = calculateWinner(squares, boardSize);

  const status = winnerInfo
    ? `Người thắng: ${winnerInfo.winner}`
    : `Lượt chơi: ${xIsNext ? 'X' : 'O'}`;

  const handleClick = (i) => {
    if (squares[i] || winnerInfo) return;
    const nextSquares = [...squares];
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(boardSize * boardSize).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="game">
      <h1>Game Caro</h1>
      <div style={{ marginBottom: 10 }}>
        <label>Chọn kích thước: </label>
        <select
          value={boardSize}
          onChange={(e) => setBoardSize(Number(e.target.value))}
        >
          <option value={3}>3 x 3</option>
          <option value={6}>6 x 6</option>
        </select>
      </div>
      <p>{status}</p>
      <Board 
        squares={squares} 
        onClick={handleClick} 
        size={boardSize} 
        winningSquares={winnerInfo?.winningSquares || []} 
      />
      <button onClick={resetGame} style={{ marginTop: '16px' }}>
        Chơi lại
      </button>
    </div>
  );
};

export default App;
