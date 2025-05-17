import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

const CaroGame = () => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [inputRoomId, setInputRoomId] = useState('');
    const [mySymbol, setMySymbol] = useState('');
    const [currentTurn, setCurrentTurn] = useState('X');
    const [board, setBoard] = useState(() =>
        Array(20)
            .fill(null)
            .map(() => Array(20).fill(''))
    );
    const [players, setPlayers] = useState([]);
    const [roomsList, setRoomsList] = useState([]);

    const makeMove = (x, y) => {
        if (mySymbol !== currentTurn) {
            alert('Chưa đến lượt bạn!');
            return;
        }
        if (board[y][x]) return;

        socket.emit('makeMove', { roomId, x, y, symbol: mySymbol });
    };

    const handleCreateRoom = () => {
        if (!username) return alert('Hãy nhập tên người chơi!');
        socket.emit('createRoom', { username }, (res) => {
            if (res.success) {
                setRoomId(res.roomId);
                resetBoard();
            }
        });
    };

    const handleJoinRoom = () => {
        if (!username || !inputRoomId) return alert('Điền đủ tên và mã phòng!');
        socket.emit('joinRoom', { roomId: inputRoomId, username }, (res) => {
            if (res.success) {
                setRoomId(inputRoomId);
                resetBoard();
            } else {
                alert(res.message);
            }
        });
    };

    const handleQuickJoin = (id) => {
        setInputRoomId(id);
        handleJoinRoom();
    };

    const getAvailableRooms = () => {
        socket.emit('getAvailableRooms');
    };

    const resetBoard = () => {
        setBoard(
            Array(20)
                .fill(null)
                .map(() => Array(20).fill(''))
        );
        setCurrentTurn('X');
    };

    useEffect(() => {
        socket.on('assignSymbol', (symbol) => {
            setMySymbol(symbol);
            alert(`Bạn là người chơi: ${symbol}`);
        });

        socket.on('moveMade', ({ x, y, symbol }) => {
            setBoard((prevBoard) => {
                const newBoard = prevBoard.map((row) => [...row]);
                newBoard[y][x] = symbol;
                return newBoard;
            });
            setCurrentTurn(symbol === 'X' ? 'O' : 'X');
        });

        socket.on('gameOver', ({ winner, username, reason }) => {
            setTimeout(() => {
                if (reason === 'opponent_left') {
                    alert(`🛑 ${username} (${winner}) thắng do đối thủ rời phòng.`);
                } else {
                    alert(`🎉 Người thắng là ${username} (${winner})`);
                }
            }, 100);
        });

        socket.on('playerJoined', (players) => {
            setPlayers(players);
        });

        socket.on('playerLeft', () => {
            alert('⚠️ Người chơi đã rời phòng.');
        });

        socket.on('availableRooms', (rooms) => {
            setRoomsList(rooms);
        });

        socket.on('gameRestarted', () => {
            alert('🔁 Ván đấu mới bắt đầu!');
            resetBoard();
        });

        return () => socket.disconnect();
    }, []);

    const restartGame = () => {
        socket.emit('restartGame', { roomId });
    };

    return (
        <div>
            <h2>🎮 Game Caro Realtime (React)</h2>

            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên người chơi"
            />
            <button onClick={handleCreateRoom}>Tạo phòng</button>

            <input
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="Nhập mã phòng"
            />
            <button onClick={handleJoinRoom}>Vào phòng</button>

            <button onClick={getAvailableRooms}>🔍 Danh sách phòng có sẵn</button>

            {roomId && (
                <>
                    <h4>Phòng: {roomId}</h4>
                    <p>
                        Người chơi: {players.map((p) => `${p.username} (${p.symbol})`).join(' vs ')}
                    </p>
                    <button onClick={restartGame}>🔄 Chơi lại</button>
                </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 30px)', marginTop: 20 }}>
                {board.map((row, y) =>
                    row.map((cell, x) => (
                        <div
                            key={`${x}-${y}`}
                            onClick={() => makeMove(x, y)}
                            style={{
                                width: 30,
                                height: 30,
                                border: '1px solid #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                cursor: 'pointer',
                            }}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>

            <div>
                <h4>Phòng đang mở:</h4>
                {roomsList.length === 0 ? (
                    <p>Không có phòng nào mở</p>
                ) : (
                    roomsList.map((room) => (
                        <div key={room.roomId}>
                            Phòng: <b>{room.roomId}</b> | Người: {room.players.join(', ')}{' '}
                            <button onClick={() => handleQuickJoin(room.roomId)}>Tham gia</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CaroGame;
