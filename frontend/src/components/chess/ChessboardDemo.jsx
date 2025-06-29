import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessboardDemo = () => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState('start');
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isDraggable, setIsDraggable] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameMode, setGameMode] = useState('free-play'); // free-play or lesson

  // Example PGN for lesson mode
  const examplePgn = `[Event "Casual Game"]
[Site "Berlin GER"]
[Date "1852.??.??"]
[EventDate "?"]
[Round "?"]
[Result "1-0"]
[White "Adolf Anderssen"]
[Black "Jean Dufresne"]
[ECO "C52"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "47"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O
d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4
Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6
Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8
23.Bd7+ Kf8 24.Bxe7# 1-0`;

  const loadPgn = () => {
    const newGame = new Chess();
    try {
      newGame.loadPgn(examplePgn);
      setGame(newGame);
      setPosition(newGame.fen());
      
      // Extract move history
      const history = [];
      const moves = newGame.history({ verbose: true });
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        history.push({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          san: move.san,
          color: move.color
        });
      }
      setMoveHistory(history);
    } catch (error) {
      console.error("Invalid PGN:", error);
    }
  };

  const makeMove = (move) => {
    const gameCopy = { ...game };
    
    const result = gameCopy.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || 'q' // default to queen promotion
    });
    
    if (result) {
      setGame(gameCopy);
      setPosition(gameCopy.fen());
      
      // Update move history
      setMoveHistory([
        ...moveHistory,
        {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          san: result.san,
          color: result.color
        }
      ]);
      
      return true;
    }
    return false;
  };

  function onDrop(sourceSquare, targetSquare) {
    // Don't allow moves in lesson mode unless in free-play mode
    if (gameMode === 'lesson' && isDraggable === false) {
      return false;
    }
    
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for simplicity
    });
    
    return move;
  }

  // Toggle between white and black perspective
  const flipBoard = () => {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  };

  // Reset the game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setMoveHistory([]);
  };

  // Toggle between free-play and lesson mode
  const toggleGameMode = () => {
    if (gameMode === 'free-play') {
      setGameMode('lesson');
      loadPgn();
      setIsDraggable(false); // In lesson mode, start with non-draggable pieces
    } else {
      setGameMode('free-play');
      resetGame();
      setIsDraggable(true);
    }
  };

  // In lesson mode, navigate through the moves
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  
  const goToMove = (index) => {
    if (index >= -1 && index < moveHistory.length) {
      const newGame = new Chess();
      
      // Apply moves up to the selected index
      for (let i = 0; i <= index; i++) {
        newGame.move(moveHistory[i]);
      }
      
      setGame(newGame);
      setPosition(newGame.fen());
      setCurrentMoveIndex(index);
    }
  };

  const nextMove = () => {
    goToMove(currentMoveIndex + 1);
  };

  const prevMove = () => {
    goToMove(currentMoveIndex - 1);
  };

  return (
    <div className="container">
      <h1 className="text-primary">Interactive Chessboard</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>Chessboard Demo</h2>
          <div>
            <button className="btn btn-primary" onClick={flipBoard}>
              Flip Board
            </button>
            <button className="btn btn-secondary" onClick={resetGame}>
              Reset
            </button>
            <button className="btn btn-dark" onClick={toggleGameMode}>
              {gameMode === 'free-play' ? 'Switch to Lesson Mode' : 'Switch to Free Play'}
            </button>
          </div>
        </div>
        
        <div className="chessboard-container">
          <Chessboard 
            position={position} 
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            areArrowsAllowed={true}
            customDarkSquareStyle={{ backgroundColor: '#779952' }}
            customLightSquareStyle={{ backgroundColor: '#edeed1' }}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}
            isDraggablePiece={() => isDraggable}
          />
        </div>
        
        {gameMode === 'lesson' && (
          <div className="card">
            <div className="card-header">
              <h3>The Immortal Game - Anderssen vs. Dufresne (1852)</h3>
              <div>
                <button className="btn btn-dark" onClick={prevMove} disabled={currentMoveIndex < 0}>
                  Previous Move
                </button>
                <button className="btn btn-dark" onClick={nextMove} disabled={currentMoveIndex >= moveHistory.length - 1}>
                  Next Move
                </button>
                <button className="btn btn-primary" onClick={() => setIsDraggable(!isDraggable)}>
                  {isDraggable ? 'Disable Movement' : 'Enable Movement'}
                </button>
              </div>
            </div>
            
            <div>
              <h4>Move History:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                {moveHistory.map((move, index) => (
                  <div 
                    key={index}
                    style={{ 
                      margin: '0 10px 10px 0',
                      padding: '5px 10px',
                      backgroundColor: currentMoveIndex === index ? '#3a6ea5' : '#f4f4f4',
                      color: currentMoveIndex === index ? 'white' : 'black',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onClick={() => goToMove(index)}
                  >
                    {index % 2 === 0 ? Math.floor(index / 2) + 1 + '. ' : ''}
                    {move.san}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {gameMode === 'free-play' && game.isGameOver() && (
          <div className="alert alert-success">
            <h3>Game Over</h3>
            {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Draw!' : 'Game over'}
          </div>
        )}

        <div className="card-header">
          <h3>Current FEN:</h3>
          <p style={{ wordBreak: 'break-all' }}>{position}</p>
        </div>
      </div>
    </div>
  );
};

export default ChessboardDemo;
