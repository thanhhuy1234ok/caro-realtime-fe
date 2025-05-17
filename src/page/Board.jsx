import React from 'react';

const Board = ({ squares, onClick, size, winningSquares }) => {
  const renderSquare = (i) => {
    const isWinningSquare = winningSquares.includes(i);
    return (
      <button 
        key={i} 
        className={`square ${isWinningSquare ? 'winning' : ''}`} 
        onClick={() => onClick(i)}
      >
        {squares[i]}
      </button>
    );
  };

  const boardRows = [];
  for (let row = 0; row < size; row++) {
    const rowSquares = [];
    for (let col = 0; col < size; col++) {
      rowSquares.push(renderSquare(row * size + col));
    }
    boardRows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return <div>{boardRows}</div>;
};

export default Board;
