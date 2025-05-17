import React from 'react';

const Board = ({ squares, onClick, size }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 40px)`,
                gap: 2,
                marginTop: 10,
            }}
        >
            {squares.map((val, i) => (
                <div
                    key={i}
                    onClick={() => onClick(i)}
                    style={{
                        width: 40,
                        height: 40,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        lineHeight: '40px',
                        fontSize: 18,
                        cursor: 'pointer',
                        background: val ? '#f0f0f0' : '#fff',
                    }}
                >
                    {val}
                </div>
            ))}
        </div>
    );
};

export default Board;
