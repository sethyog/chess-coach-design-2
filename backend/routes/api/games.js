const express = require('express');
const router = express.Router();

// @route   GET api/games
// @desc    Get all games for the current user
// @access  Private
router.get('/', (req, res) => {
  // In a real implementation, this would fetch games from the database
  // For now, we'll return mock data
  res.json([
    {
      id: 'game1',
      source: 'chess.com',
      pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2025.06.01"]\n[Round "-"]\n[White "User1"]\n[Black "JohnDoe"]\n[Result "0-1"]\n[ECO "B20"]\n[WhiteElo "1240"]\n[BlackElo "1280"]\n[TimeControl "600"]\n1. e4 c5 2. d3 Nc6 3. Nf3 e6 4. Be2 d5 5. exd5 exd5 6. O-O Bd6 7. Re1+ Be6 8. Bg5 f6 9. Bh4 Qd7 10. c3 Nge7 11. Nbd2 O-O 12. Nf1 Rae8 13. Ng3 Bg4 14. Nh5 Bxe2 15. Rxe2 g6 16. Ng3 Rxe2 17. Qxe2 Re8 18. Qd1 Nd8 19. Re1 Ne6 20. Rxe8+ Qxe8 21. Ne1 Qd7 22. Nf3 Ng8 23. Nh1 Nf8 24. Nf1 Ne6 25. Ng3 g5 26. Bg3 Bxg3 27. hxg3 Qg4 28. Qe2 Qxe2 29. Ne1 Qxe1# 0-1',
      date: '2025-06-01T15:30:00.000Z',
      analyzed: true,
      analysis: {
        accuracy: 78.5,
        mistakes: 3,
        blunders: 1,
        missedWins: 0,
        criticalMoments: [
          {
            move: 15,
            fen: 'r3k2r/pp1qn2p/2nb1p2/2pp2pB/8/2PP1N2/PP3PPP/RN1Q1RK1 b kq - 1 15',
            bestMove: 'g6',
            reason: 'Prevents Ng7+ tactics'
          }
        ]
      }
    },
    {
      id: 'game2',
      source: 'lichess',
      pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org"]\n[Date "2025.06.05"]\n[Round "-"]\n[White "JohnDoe"]\n[Black "Opponent2"]\n[Result "1-0"]\n[ECO "C50"]\n[WhiteElo "1295"]\n[BlackElo "1310"]\n[TimeControl "300+2"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 O-O 6. Bg5 h6 7. Bh4 d6 8. c3 a6 9. Nbd2 Ba7 10. Re1 g5 11. Bg3 Nh5 12. h3 Nxg3 13. fxg3 Kg7 14. d4 exd4 15. cxd4 Qe7 16. e5 dxe5 17. dxe5 Rd8 18. Qc1 Be6 19. Bxe6 Qxe6 20. Nf1 Rxd1 21. Raxd1 Rd8 22. Rxd8 Nxd8 23. Ne3 Nc6 24. Nd5 Nxe5 25. Nxe5 Qxe5 26. Rxe5 1-0',
      date: '2025-06-05T18:45:00.000Z',
      analyzed: true,
      analysis: {
        accuracy: 85.2,
        mistakes: 2,
        blunders: 0,
        missedWins: 1,
        criticalMoments: [
          {
            move: 10,
            fen: 'r1bq1rk1/1pp2pp1/p1np3p/2b1p3/2B1P3/2PP1N1P/PP3PP1/RNBQR1K1 b - - 0 10',
            bestMove: 'Be6',
            reason: 'Protects the bishop and challenges the center'
          }
        ]
      }
    }
  ]);
});

// @route   GET api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', (req, res) => {
  // In a real implementation, this would fetch a specific game from the database
  res.json({
    id: req.params.id,
    source: 'chess.com',
    pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2025.06.01"]\n[Round "-"]\n[White "User1"]\n[Black "JohnDoe"]\n[Result "0-1"]\n[ECO "B20"]\n[WhiteElo "1240"]\n[BlackElo "1280"]\n[TimeControl "600"]\n1. e4 c5 2. d3 Nc6 3. Nf3 e6 4. Be2 d5 5. exd5 exd5 6. O-O Bd6 7. Re1+ Be6 8. Bg5 f6 9. Bh4 Qd7 10. c3 Nge7 11. Nbd2 O-O 12. Nf1 Rae8 13. Ng3 Bg4 14. Nh5 Bxe2 15. Rxe2 g6 16. Ng3 Rxe2 17. Qxe2 Re8 18. Qd1 Nd8 19. Re1 Ne6 20. Rxe8+ Qxe8 21. Ne1 Qd7 22. Nf3 Ng8 23. Nh1 Nf8 24. Nf1 Ne6 25. Ng3 g5 26. Bg3 Bxg3 27. hxg3 Qg4 28. Qe2 Qxe2 29. Ne1 Qxe1# 0-1',
    date: '2025-06-01T15:30:00.000Z',
    analyzed: true,
    analysis: {
      accuracy: 78.5,
      mistakes: 3,
      blunders: 1,
      missedWins: 0,
      criticalMoments: [
        {
          move: 15,
          fen: 'r3k2r/pp1qn2p/2nb1p2/2pp2pB/8/2PP1N2/PP3PPP/RN1Q1RK1 b kq - 1 15',
          bestMove: 'g6',
          reason: 'Prevents Ng7+ tactics'
        }
      ]
    }
  });
});

// @route   POST api/games/fetch
// @desc    Fetch new games from Chess.com and Lichess
// @access  Private
router.post('/fetch', (req, res) => {
  // In a real implementation, this would fetch games from Chess.com and Lichess APIs
  // using the stored OAuth tokens
  res.json({
    message: 'Games fetched successfully',
    newGames: 5,
    games: [
      {
        id: 'game3',
        source: 'chess.com',
        pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2025.06.10"]\n[Round "-"]\n[White "Opponent3"]\n[Black "JohnDoe"]\n[Result "0-1"]\n[ECO "B30"]\n[WhiteElo "1260"]\n[BlackElo "1290"]\n[TimeControl "600"]\n1. e4 c5 2. Nf3 Nc6 3. Bc4 e6 4. O-O a6 5. c3 b5 6. Bb3 c4 7. Bc2 Nf6 8. Re1 d5 9. e5 Nd7 10. d4 cxd3 11. Bxd3 Bc5 12. Bf4 O-O 13. Nbd2 f6 14. exf6 Nxf6 15. Bg5 Bd7 16. Ne5 Nxe5 17. Rxe5 Qc7 18. Nf3 Rac8 19. Rc1 Qb6 20. Qe2 Rce8 21. h3 Bb4 22. Rd1 Bxc3 23. bxc3 Qxc3 24. Be3 Ne4 25. Bb1 Rf3 26. gxf3 Qxe5 27. fxe4 Qxf3 28. Qxf3 Rxe4 29. Bd3 Rxe3 30. fxe3 Bxh3 0-1',
        date: '2025-06-10T20:15:00.000Z',
        analyzed: false
      }
    ]
  });
});

// @route   POST api/games/analyze/:id
// @desc    Analyze a specific game
// @access  Private
router.post('/analyze/:id', (req, res) => {
  // In a real implementation, this would trigger Stockfish analysis via python-chess
  res.json({
    message: 'Game analysis completed',
    game: {
      id: req.params.id,
      analyzed: true,
      analysis: {
        accuracy: 81.3,
        mistakes: 2,
        blunders: 1,
        missedWins: 0,
        criticalMoments: [
          {
            move: 22,
            fen: 'r3r1k1/3b2p1/pq2p2p/1p1p4/8/2PBnN1P/PP2QPP1/2RR2K1 w - - 0 22',
            bestMove: 'Rc2',
            reason: 'Defends the second rank and prepares for counterplay'
          }
        ]
      }
    }
  });
});

module.exports = router;
