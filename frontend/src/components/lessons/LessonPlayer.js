import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ReactMarkdown from 'react-markdown';

const LessonPlayer = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isDraggable, setIsDraggable] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch lesson data from an API
    // For now, we'll use mock data
    const mockLessons = {
      1: {
        id: 1,
        title: 'Opening Principles for Beginners',
        description: 'Learn the key principles to follow in the opening phase of your chess games.',
        difficulty: 'Beginner',
        sections: [
          {
            type: 'introduction',
            title: 'Introduction to Opening Principles',
            content: `
# Opening Principles for Beginners

Chess openings are crucial because they set the tone for the middlegame and endgame. While there are countless specific opening variations to study, beginners should focus on understanding and applying general opening principles.

In this lesson, you'll learn:
- Control of the center
- Piece development
- King safety
- Pawn structure basics

Let's get started!
            `,
            position: 'start'
          },
          {
            type: 'explanation',
            title: 'Control the Center',
            content: `
## Control the Center

The center of the board (d4, d5, e4, e5) is strategically important because:

1. Pieces control more squares from central positions
2. Pieces can move more easily to either side of the board
3. Control of the center provides more space and mobility

**Key Principle:** Aim to control the center with pawns and pieces.

In the position shown, White has moved 1.e4, taking the first step toward controlling the center.
            `,
            position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
          },
          {
            type: 'puzzle',
            title: 'Your Turn: Respond to 1.e4',
            content: `
## Your Turn

Now Black should also fight for the center. What's one good move for Black here?

Try making a move on the board. Aim to control or contest the center.
            `,
            position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
            solution: ['e5', 'c5', 'e6', 'd5'],
            feedback: {
              'e5': 'Excellent! 1...e5 directly contests the center and leads to open, double king pawn positions.',
              'c5': 'Good! 1...c5 is the Sicilian Defense, an aggressive response that fights for the center indirectly.',
              'e6': 'Good. 1...e6 prepares to support d5, fighting for the center more gradually (French Defense).',
              'd5': 'Good! 1...d5 immediately challenges White\'s center pawn (Scandinavian Defense).',
              'default': 'That move doesn\'t effectively fight for the center. Consider e5, c5, e6, or d5.'
            }
          },
          {
            type: 'explanation',
            title: 'Develop Your Pieces',
            content: `
## Develop Your Pieces

After establishing pawns in the center, you should develop your pieces quickly:

1. Knights before bishops (generally)
2. Develop toward the center
3. Don't move the same piece multiple times
4. Don't bring your queen out too early

**Key Principle:** Aim to develop all pieces before launching an attack.

In this position, after 1.e4 e5, White has played 2.Nf3, developing a knight toward the center.
            `,
            position: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'
          },
          {
            type: 'explanation',
            title: 'King Safety',
            content: `
## King Safety

In the opening, king safety is paramount:

1. Castle early (usually within the first 10 moves)
2. Maintain pawn shield in front of your castled king
3. Avoid moving pawns in front of your castled king without good reason

**Key Principle:** Get your king to safety before launching attacks.

This position shows a typical king's side castle for White, providing good king safety.
            `,
            position: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
            nextPosition: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 1 5'
          },
          {
            type: 'quiz',
            title: 'Quick Quiz: Opening Principles',
            content: `
## Quiz: Opening Principles

Test your understanding of the opening principles we've covered.

1. Which is generally NOT a good practice in the opening?
   a) Developing knights before bishops
   b) Controlling the center with pawns
   c) Moving the same piece multiple times
   d) Castling early

2. Why is the center of the board important?
   a) It's where the king is safest
   b) Pieces control more squares from central positions
   c) You get more points for capturing in the center
   d) It's required by the rules

3. When should you typically castle?
   a) Only when under attack
   b) In the endgame
   c) Within the first 10 moves
   d) After developing all pieces
            `,
            answers: {
              '1': 'c',
              '2': 'b',
              '3': 'c'
            }
          },
          {
            type: 'conclusion',
            title: 'Conclusion',
            content: `
## Conclusion

Congratulations! You've learned the fundamental principles of the chess opening:

1. **Control the center** with pawns and pieces
2. **Develop your pieces** efficiently, starting with knights and bishops
3. **Castle early** to ensure king safety
4. **Create a balanced pawn structure** that supports your pieces

Remember, these principles are guidelines, not absolute rules. As you progress, you'll learn when it's appropriate to deviate from them.

In your next games, focus on applying these principles, and you'll see immediate improvement in your opening play.

Next up: Tactical Patterns in the Opening!
            `,
            position: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 2 6'
          }
        ],
        progress: 0
      },
      2: {
        id: 2,
        title: 'Tactical Patterns: Pins and Skewers',
        description: 'Master two of the most common tactical motifs in chess.',
        difficulty: 'Intermediate',
        // Would define sections similar to lesson 1
        sections: [],
        progress: 0
      }
    };

    // Simulate API call to fetch lesson data
    setTimeout(() => {
      const fetchedLesson = mockLessons[id];
      if (fetchedLesson) {
        setLesson(fetchedLesson);
        
        // Set the initial position for the first section
        if (fetchedLesson.sections && fetchedLesson.sections.length > 0) {
          const firstSection = fetchedLesson.sections[0];
          if (firstSection.position) {
            const newGame = new Chess(firstSection.position);
            setGame(newGame);
            setPosition(firstSection.position);
          }
        }
      }
      setLoading(false);
    }, 500);
  }, [id]);

  // Update position when changing sections
  useEffect(() => {
    if (lesson && lesson.sections && lesson.sections[currentSectionIndex]) {
      const section = lesson.sections[currentSectionIndex];
      if (section.position) {
        const newGame = new Chess(section.position);
        setGame(newGame);
        setPosition(section.position);
        
        // Reset move history and current move index
        setMoveHistory([]);
        setCurrentMoveIndex(-1);
        
        // Set draggable based on section type
        setIsDraggable(section.type === 'puzzle');
      }
      
      // If there's a "nextPosition" in the section, set up a timeout to show it
      if (section.nextPosition) {
        const timer = setTimeout(() => {
          const newGame = new Chess(section.nextPosition);
          setGame(newGame);
          setPosition(section.nextPosition);
        }, 3000); // Show the next position after 3 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [lesson, currentSectionIndex]);

  // Calculate and update progress
  useEffect(() => {
    if (lesson && lesson.sections) {
      const progressPercentage = (currentSectionIndex / (lesson.sections.length - 1)) * 100;
      setProgress(progressPercentage);
    }
  }, [lesson, currentSectionIndex]);

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
      const newMoveHistory = [
        ...moveHistory,
        {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          san: result.san,
          color: result.color
        }
      ];
      setMoveHistory(newMoveHistory);
      setCurrentMoveIndex(newMoveHistory.length - 1);
      
      // Check if this is a puzzle section and verify the solution
      const currentSection = lesson.sections[currentSectionIndex];
      if (currentSection.type === 'puzzle' && currentSection.solution) {
        // Extract the move notation (e.g., 'e5' from e7-e5)
        const moveNotation = result.to;
        
        // Check if the move is in the solution array
        if (currentSection.solution.includes(moveNotation)) {
          // Get feedback for the specific move, or use default
          const feedback = currentSection.feedback && currentSection.feedback[moveNotation] 
            ? currentSection.feedback[moveNotation] 
            : currentSection.feedback?.default || 'Good move!';
          
          // In a real app, would show feedback in a modal or toast
          alert(feedback);
        } else if (currentSection.feedback?.default) {
          alert(currentSection.feedback.default);
        }
      }
      
      return true;
    }
    return false;
  };

  function onDrop(sourceSquare, targetSquare) {
    // Only allow moves in puzzle sections
    const currentSection = lesson?.sections[currentSectionIndex];
    if (!currentSection || currentSection.type !== 'puzzle') {
      return false;
    }
    
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for simplicity
    });
    
    return move;
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const goToNextSection = () => {
    if (lesson && currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // End of lesson, in a real app would mark as completed
      alert('Congratulations! You have completed this lesson.');
    }
  };

  if (loading) {
    return <div className="container">Loading lesson...</div>;
  }

  if (!lesson) {
    return (
      <div className="container">
        <h2>Lesson not found</h2>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const currentSection = lesson.sections[currentSectionIndex];

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>{lesson.title}</h1>
          <div className="progress" style={{ height: '20px' }}>
            <div 
              className="progress-bar bg-primary" 
              role="progressbar" 
              style={{ width: `${progress}%` }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        <div className="grid">
          <div>
            <h2>{currentSection.title}</h2>
            <div className="content-container">
              <ReactMarkdown>{currentSection.content}</ReactMarkdown>
              
              {currentSection.type === 'quiz' && (
                <div className="quiz-container">
                  {/* In a real app, would implement quiz functionality here */}
                  <p className="text-primary">Quiz functionality would be implemented here</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="chessboard-container">
              <Chessboard 
                position={position} 
                onPieceDrop={onDrop}
                boardOrientation="white"
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
            
            {moveHistory.length > 0 && (
              <div className="move-history">
                <h4>Your Moves:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                  {moveHistory.map((move, index) => (
                    <div 
                      key={index}
                      style={{ 
                        margin: '0 10px 10px 0',
                        padding: '5px 10px',
                        backgroundColor: '#f4f4f4',
                        borderRadius: '3px'
                      }}
                    >
                      {index % 2 === 0 ? Math.floor(index / 2) + 1 + '. ' : ''}
                      {move.san}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={goToPreviousSection}
            disabled={currentSectionIndex === 0}
          >
            Previous
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={goToNextSection}
          >
            {currentSectionIndex < lesson.sections.length - 1 ? 'Next' : 'Complete Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
