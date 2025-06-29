# Chess Coach

An AI-powered chess coach that provides personalized lessons and analysis based on your games and playing style.

## Project Overview

Chess Coach is a full-stack application that integrates with Chess.com and Lichess to analyze your games, create a player profile, and generate personalized lessons tailored to your strengths, weaknesses, and learning style.

## Features

### Command Line Interface (CLI)
- Interactive command-line tool for managing your chess coach account
- Check server status and connection
- User authentication via login/register commands
- View and manage your chess games and lessons
- Update your profile and preferences
- Analyze new games with simple commands

### User Authentication
- Email/password authentication with Firebase
- OAuth integration with Chess.com and Lichess
- Secure token storage

### Interactive Chessboard
- Responsive chessboard UI using react-chessboard
- Support for FEN/PGN notation
- Lesson mode and free-play mode
- Move history tracking

### Game Analysis
- Automatic fetching of games from Chess.com and Lichess
- Stockfish analysis via python-chess
- Move accuracy evaluation
- Blunder detection

### Player Profiling
- Skill trend tracking
- Style analysis (aggressive, positional, etc.)
- Strength and weakness identification
- Opening repertoire analysis

### Personality Modeling
- Conversation analysis using GPT-4
- Learning style classification
- Adaptive teaching approach

### Personalized Lessons
- Weekly lesson generation based on profile
- Interactive exercises and puzzles
- Progress tracking and resume functionality
- Lesson history

### Adaptive Chatbot
- Context-aware responses using LangChain and GPT-4
- Style adaption based on user personality
- Chess-specific assistance
- Chat panel embedded in every lesson for instant questions

## Architecture

The application is built with:

### Frontend
- React for the UI components
- react-chessboard for the interactive chess board
- React Router for navigation
- CSS for styling

### Backend
- Node.js and Express for the API server
- Firebase for authentication
- PostgreSQL for data storage
- Python with FastAPI for chess analysis
- Stockfish for move evaluation
- LangChain and OpenAI for AI components

### Data Flow
1. User authenticates via Firebase or chess platform OAuth
2. Games are fetched weekly from Chess.com and Lichess
3. Games are analyzed by Stockfish via python-chess
4. Player profile is generated and updated
5. Personality model is created from chat interactions
6. Lessons are generated based on profile and personality
7. User interacts with lessons, and progress is tracked

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL
- Stockfish chess engine

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/chess-coach.git
cd chess-coach
```

2. Install dependencies
```
npm run install-all
```

3. Set up environment variables
```
cp .env.example .env
```
Edit .env with your API keys and configuration.
Make sure `OPENAI_API_KEY` is set for the chatbot to function.

4. Set up Python virtual environment and install dependencies
```
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
pip install langchain openai fastapi uvicorn
```

5. Start the development server
```
npm run dev
```

6. Start the Python FastAPI backend (in a separate terminal)
```
# Make sure the virtual environment is activated
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux

# Start the FastAPI server with uvicorn
uvicorn main:app --reload --port 8000
```

7. Access the application at http://localhost:3000
   The FastAPI backend will be available at http://localhost:8000
   Open any lesson and use the chatbot panel below the board to ask questions.

8. Install the CLI globally (optional)
```
npm install -g .
```

### Using the Command Line Interface

After installing the CLI globally, you can use the following commands:

```
# Check server status
chess-coach server-status

# Get help
chess-coach help

# Register a new account
chess-coach register

# Log in to your account
chess-coach login

# View your profile
chess-coach profile

# List available lessons
chess-coach lessons

# View a specific lesson
chess-coach lesson <id>

# List your chess games
chess-coach games

# View details and analysis of a specific game
chess-coach game <id>

# Upload and analyze a new game
chess-coach analyze

# Update your profile information
chess-coach update-profile

# Log out
chess-coach logout
```

## Project Structure

```
chess-coach/
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # React components
│       ├── components/   # UI components
│       ├── context/      # React context
│       ├── hooks/        # Custom hooks
│       └── utils/        # Utility functions
├── backend/              # Express backend
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   ├── middleware/       # Express middleware
│   └── services/         # Business logic
├── cli.js                # Command line interface
└── analysis/             # Python analysis service
    ├── app/              # FastAPI application
    ├── models/           # Analysis models
    └── utils/            # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
