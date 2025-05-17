// import React, { useState, useEffect } from 'react';
// import Board from '../src/page/Board';
// import './App.css';

// const calculateWinner = (squares, size) => {
//   if (size === 3) {
//     const lines = [
//       [0, 1, 2], [3, 4, 5], [6, 7, 8], 
//       [0, 3, 6], [1, 4, 7], [2, 5, 8], 
//       [0, 4, 8], [2, 4, 6],            
//     ];
//     for (let line of lines) {
//       const [a, b, c] = line;
//       if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
//         return { winner: squares[a], winningSquares: line };
//       }
//     }
//   } else if (size === 6) {
//     const inARow = 5;
//     const checkLine = (start, delta) => {
//       let symbol = squares[start];
//       if (!symbol) return null;
//       for (let i = 1; i < inARow; i++) {
//         if (squares[start + i * delta] !== symbol) return null;
//       }
//       return Array.from({ length: inARow }, (_, i) => start + i * delta);
//     };

//     for (let row = 0; row < size; row++) {
//       for (let col = 0; col < size; col++) {
//         const idx = row * size + col;

//         if (!squares[idx]) continue;

//         // Ngang
//         if (col + inARow <= size) {
//           const winningSquares = checkLine(idx, 1);
//           if (winningSquares) return { winner: squares[idx], winningSquares };
//         }

//         // Dọc
//         if (row + inARow <= size) {
//           const winningSquares = checkLine(idx, size);
//           if (winningSquares) return { winner: squares[idx], winningSquares };
//         }

//         // Chéo chính
//         if (row + inARow <= size && col + inARow <= size) {
//           const winningSquares = checkLine(idx, size + 1);
//           if (winningSquares) return { winner: squares[idx], winningSquares };
//         }

//         // Chéo phụ
//         if (row + inARow <= size && col - inARow + 1 >= 0) {
//           const winningSquares = checkLine(idx, size - 1);
//           if (winningSquares) return { winner: squares[idx], winningSquares };
//         }
//       }
//     }
//   }
//   return null;
// };

// const App = () => {
//   const [boardSize, setBoardSize] = useState(3);
//   const [squares, setSquares] = useState(Array(9).fill(null));
//   const [xIsNext, setXIsNext] = useState(true);

//   useEffect(() => {
//     setSquares(Array(boardSize * boardSize).fill(null));
//     setXIsNext(true);
//   }, [boardSize]);

//   const winnerInfo = calculateWinner(squares, boardSize);

//   const status = winnerInfo
//     ? `Người thắng: ${winnerInfo.winner}`
//     : `Lượt chơi: ${xIsNext ? 'X' : 'O'}`;

//   const handleClick = (i) => {
//     if (squares[i] || winnerInfo) return;
//     const nextSquares = [...squares];
//     nextSquares[i] = xIsNext ? 'X' : 'O';
//     setSquares(nextSquares);
//     setXIsNext(!xIsNext);
//   };

//   const resetGame = () => {
//     setSquares(Array(boardSize * boardSize).fill(null));
//     setXIsNext(true);
//   };

//   return (
//     <div className="game">
//       <h1>Game Caro</h1>
//       <div style={{ marginBottom: 10 }}>
//         <label>Chọn kích thước: </label>
//         <select
//           value={boardSize}
//           onChange={(e) => setBoardSize(Number(e.target.value))}
//         >
//           <option value={3}>3 x 3</option>
//           <option value={6}>6 x 6</option>
//         </select>
//       </div>
//       <p>{status}</p>
//       <Board 
//         squares={squares} 
//         onClick={handleClick} 
//         size={boardSize} 
//         winningSquares={winnerInfo?.winningSquares || []} 
//       />
//       <button onClick={resetGame} style={{ marginTop: '16px' }}>
//         Chơi lại
//       </button>
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import Board from '../src/page/Board';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:8080');

const App = () => {
  const [boardSize] = useState(6); // cố định 6x6 cho Caro
  const [squares, setSquares] = useState(Array(36).fill(null));
  const [mySymbol, setMySymbol] = useState('');
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Auto create & join room mặc định
    const username = `Player-${Math.floor(Math.random() * 1000)}`;
    const defaultRoom = 'default';

    // Gửi yêu cầu join phòng mặc định
    socket.emit('joinRoom', { roomId: defaultRoom, username }, (res) => {
      if (res.success) {
        setRoomId(defaultRoom);
      } else {
        alert(res.message);
      }
    });
  

    // Assign symbol
    socket.on('assignSymbol', (symbol) => {
      setMySymbol(symbol);
    });

    socket.on('playerJoined', (players) => {
      setPlayers(players);
    });

    socket.on('moveMade', ({ x, y, symbol }) => {
      setSquares(prev => {
        const newSquares = [...prev];
        newSquares[y * boardSize + x] = symbol;
        return newSquares;
      });
      setCurrentTurn(symbol === 'X' ? 'O' : 'X');
    });

    socket.on('gameOver', ({ winner, username }) => {
      alert(`🎉 ${username} (${winner}) thắng!`);
      setWinnerInfo({ winner });
    });

    socket.on('gameRestarted', () => {
      setSquares(Array(boardSize * boardSize).fill(null));
      setCurrentTurn('X');
      setWinnerInfo(null);
    });

    return () => socket.disconnect();
  }, []);

  const handleClick = (i) => {
    if (squares[i] || winnerInfo || mySymbol !== currentTurn) return;

    const x = i % boardSize;
    const y = Math.floor(i / boardSize);
    socket.emit('makeMove', { roomId, x, y, symbol: mySymbol });
  };

  const resetGame = () => {
    socket.emit('restartGame', { roomId });
  };

  // const status = winnerInfo
  //   ? `Người thắng: ${winnerInfo.winner}`
  //   : mySymbol
  //     ? `Bạn là: ${mySymbol} | Lượt: ${currentTurn}`
  //     : `Đang chờ gán symbol...`;

  return (
    <div className="game">
      <h1>Game Caro Online</h1>
      {/* <p>{status}</p> */}
      <Board
        squares={squares}
        onClick={handleClick}
        size={boardSize}
        winningSquares={[]} // optional
      />
      <button onClick={resetGame} style={{ marginTop: '16px' }}>
        Chơi lại
      </button>
    </div>
  );
};

export default App;

