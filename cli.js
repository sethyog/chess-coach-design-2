#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Verify chalk is working correctly
if (typeof chalk.green !== 'function') {
  // Use a basic fallback if chalk functions aren't available
  chalk.green = (text) => text;
  chalk.red = (text) => text;
  chalk.blue = (text) => text;
  chalk.yellow = (text) => text;
  chalk.cyan = (text) => text;
  chalk.gray = (text) => text;
  chalk.white = (text) => text;
}

// Load environment variables
dotenv.config();

// Set base URL for API requests
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Initialize CLI program
const program = new Command();

// Set CLI metadata
program
  .name('chess-coach')
  .description('CLI for the Chess Coach application')
  .version('0.1.0');

// Store auth token
let authToken = null;
const tokenFile = path.join(__dirname, '.auth-token');

// Try to load saved token
try {
  if (fs.existsSync(tokenFile)) {
    authToken = fs.readFileSync(tokenFile, 'utf8');
  }
} catch (err) {
  // Ignore error, will prompt for login
}

// Create authenticated axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers['x-auth-token'] = authToken;
  }
  return config;
});

// Helper function to save token
const saveToken = (token) => {
  authToken = token;
  fs.writeFileSync(tokenFile, token);
  console.log(chalk.green('✓ Authentication successful'));
};

// Helper function to check if user is authenticated
const checkAuth = () => {
  if (!authToken) {
    console.log(chalk.red('Error: You must be logged in to use this command'));
    console.log(chalk.yellow('Run: chess-coach login'));
    process.exit(1);
  }
};

// Auth Commands
program.command('register')
  .description('Register a new user account')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter your name:',
          validate: input => input.trim() !== '' ? true : 'Name is required'
        },
        {
          type: 'input',
          name: 'email',
          message: 'Enter your email:',
          validate: input => /\S+@\S+\.\S+/.test(input) ? true : 'Please enter a valid email'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:',
          validate: input => input.length >= 6 ? true : 'Password must be at least 6 characters'
        },
        {
          type: 'password',
          name: 'confirmPassword',
          message: 'Confirm your password:',
          validate: (input, answers) => input === answers.password ? true : 'Passwords do not match'
        }
      ]);

      console.log(chalk.blue('Registering user...'));
      
      const res = await api.post('/api/users', {
        name: answers.name,
        email: answers.email,
        password: answers.password
      });

      saveToken(res.data.token);
      console.log(chalk.green(`Welcome, ${answers.name}! Your account has been created.`));
    } catch (err) {
      console.error(chalk.red('Registration failed:'), err.response?.data?.msg || err.message);
    }
  });

program.command('login')
  .description('Log in to your account')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Enter your email:',
          validate: input => /\S+@\S+\.\S+/.test(input) ? true : 'Please enter a valid email'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:',
          validate: input => input.length > 0 ? true : 'Password is required'
        }
      ]);

      console.log(chalk.blue('Logging in...'));
      
      const res = await api.post('/api/auth', {
        email: answers.email,
        password: answers.password
      });

      saveToken(res.data.token);
      console.log(chalk.green('You are now logged in!'));
    } catch (err) {
      console.error(chalk.red('Login failed:'), err.response?.data?.msg || err.message);
    }
  });

program.command('logout')
  .description('Log out from your account')
  .action(() => {
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }
    authToken = null;
    console.log(chalk.green('You have been logged out'));
  });

program.command('whoami')
  .description('Show current user information')
  .action(async () => {
    try {
      checkAuth();
      
      const res = await api.get('/api/auth');
      console.log(chalk.green('Current user:'));
      console.log(chalk.cyan('Name:'), res.data.name);
      console.log(chalk.cyan('Email:'), res.data.email);
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
      if (err.response?.status === 401) {
        console.log(chalk.yellow('Your session has expired. Please login again.'));
        if (fs.existsSync(tokenFile)) {
          fs.unlinkSync(tokenFile);
        }
        authToken = null;
      }
    }
  });

// Lessons Commands
program.command('lessons')
  .description('List available chess lessons')
  .action(async () => {
    try {
      checkAuth();
      
      console.log(chalk.blue('Fetching lessons...'));
      const res = await api.get('/api/lessons');
      
      if (res.data.length === 0) {
        console.log(chalk.yellow('No lessons found'));
        return;
      }
      
      console.log(chalk.green('\nAvailable Lessons:'));
      res.data.forEach((lesson, index) => {
        console.log(chalk.cyan(`\n[${index + 1}] ${lesson.title}`));
        console.log(chalk.gray(`   Level: ${lesson.level}`));
        console.log(chalk.gray(`   Topics: ${lesson.topics.join(', ')}`));
        console.log(chalk.gray(`   Duration: ${lesson.duration} minutes`));
      });
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

program.command('lesson <id>')
  .description('View details of a specific lesson')
  .action(async (id) => {
    try {
      checkAuth();
      
      console.log(chalk.blue(`Fetching lesson ${id}...`));
      const res = await api.get(`/api/lessons/${id}`);
      
      console.log(chalk.green('\nLesson Details:'));
      console.log(chalk.cyan(`Title: ${res.data.title}`));
      console.log(chalk.gray(`Level: ${res.data.level}`));
      console.log(chalk.gray(`Topics: ${res.data.topics.join(', ')}`));
      console.log(chalk.gray(`Duration: ${res.data.duration} minutes`));
      console.log(chalk.gray(`Description: ${res.data.description}`));
      console.log(chalk.cyan('\nContent:'));
      console.log(chalk.white(res.data.content));
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

// Games Commands
program.command('games')
  .description('List your chess games')
  .action(async () => {
    try {
      checkAuth();
      
      console.log(chalk.blue('Fetching your games...'));
      const res = await api.get('/api/games');
      
      if (res.data.length === 0) {
        console.log(chalk.yellow('No games found'));
        return;
      }
      
      console.log(chalk.green('\nYour Games:'));
      res.data.forEach((game, index) => {
        const result = game.result === 'win' ? chalk.green(game.result) : 
                       game.result === 'loss' ? chalk.red(game.result) : 
                       chalk.yellow(game.result);
                       
        console.log(chalk.cyan(`\n[${index + 1}] Game on ${new Date(game.date).toLocaleDateString()}`));
        console.log(chalk.gray(`   Opponent: ${game.opponent}`));
        console.log(chalk.gray(`   Result: ${result}`));
        console.log(chalk.gray(`   Moves: ${game.moves.length}`));
      });
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

program.command('game <id>')
  .description('View details and analysis of a specific game')
  .action(async (id) => {
    try {
      checkAuth();
      
      console.log(chalk.blue(`Fetching game ${id}...`));
      const res = await api.get(`/api/games/${id}`);
      
      console.log(chalk.green('\nGame Details:'));
      console.log(chalk.cyan(`Date: ${new Date(res.data.date).toLocaleDateString()}`));
      console.log(chalk.gray(`Opponent: ${res.data.opponent}`));
      
      const result = res.data.result === 'win' ? chalk.green(res.data.result) : 
                     res.data.result === 'loss' ? chalk.red(res.data.result) : 
                     chalk.yellow(res.data.result);
      console.log(chalk.gray(`Result: ${result}`));
      
      console.log(chalk.cyan('\nMoves:'));
      res.data.moves.forEach((move, index) => {
        if (index % 2 === 0) {
          process.stdout.write(chalk.gray(`${Math.floor(index/2) + 1}. ${move} `));
        } else {
          console.log(chalk.gray(move));
        }
      });
      
      if (res.data.moves.length % 2 !== 0) {
        console.log();
      }
      
      if (res.data.analysis) {
        console.log(chalk.cyan('\nAnalysis:'));
        console.log(chalk.white(res.data.analysis));
      }
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

program.command('analyze')
  .description('Analyze a new chess game')
  .action(async () => {
    try {
      checkAuth();
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'opponent',
          message: 'Opponent name:',
          validate: input => input.trim() !== '' ? true : 'Opponent name is required'
        },
        {
          type: 'list',
          name: 'result',
          message: 'Game result:',
          choices: ['win', 'loss', 'draw']
        },
        {
          type: 'input',
          name: 'pgn',
          message: 'Enter game PGN notation:',
          validate: input => input.trim() !== '' ? true : 'PGN is required'
        }
      ]);

      console.log(chalk.blue('Analyzing game...'));
      
      const res = await api.post('/api/games', {
        opponent: answers.opponent,
        result: answers.result,
        pgn: answers.pgn
      });
      
      console.log(chalk.green('Game successfully uploaded and analyzed!'));
      console.log(chalk.gray(`Game ID: ${res.data.id}`));
      console.log(chalk.yellow('Run the following command to view the analysis:'));
      console.log(chalk.cyan(`chess-coach game ${res.data.id}`));
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

// Profile Commands
program.command('profile')
  .description('View your profile')
  .action(async () => {
    try {
      checkAuth();
      
      console.log(chalk.blue('Fetching your profile...'));
      const res = await api.get('/api/profiles/me');
      
      console.log(chalk.green('\nYour Profile:'));
      console.log(chalk.cyan('Name:'), res.data.user.name);
      console.log(chalk.cyan('Chess Rating:'), res.data.rating || 'Not set');
      console.log(chalk.cyan('Games Played:'), res.data.gamesPlayed);
      console.log(chalk.cyan('Lessons Completed:'), res.data.lessonsCompleted);
      
      if (res.data.strengths && res.data.strengths.length > 0) {
        console.log(chalk.cyan('\nStrengths:'));
        res.data.strengths.forEach(strength => {
          console.log(chalk.gray(`- ${strength}`));
        });
      }
      
      if (res.data.weaknesses && res.data.weaknesses.length > 0) {
        console.log(chalk.cyan('\nAreas for Improvement:'));
        res.data.weaknesses.forEach(weakness => {
          console.log(chalk.gray(`- ${weakness}`));
        });
      }
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

program.command('update-profile')
  .description('Update your profile information')
  .action(async () => {
    try {
      checkAuth();
      
      // First get current profile
      const currentProfile = await api.get('/profiles/me');
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'rating',
          message: 'Your chess rating:',
          default: currentProfile.data.rating?.toString() || '',
          validate: input => {
            if (input === '') return true;
            return !isNaN(input) ? true : 'Rating must be a number';
          }
        },
        {
          type: 'checkbox',
          name: 'interests',
          message: 'Select your chess interests:',
          choices: [
            'Opening Theory', 
            'Middle Game Tactics', 
            'End Game Strategy',
            'Chess History',
            'Chess Variants',
            'Tournament Play'
          ],
          default: currentProfile.data.interests || []
        }
      ]);

      console.log(chalk.blue('Updating profile...'));
      
      const profileData = {
        rating: answers.rating ? parseInt(answers.rating) : undefined,
        interests: answers.interests
      };
      
      await api.put('/api/profiles', profileData);
      
      console.log(chalk.green('Profile updated successfully!'));
    } catch (err) {
      console.error(chalk.red('Error:'), err.response?.data?.msg || err.message);
    }
  });

// System Commands
program.command('server-status')
  .description('Check the status of the Chess Coach server')
  .action(async () => {
    try {
      console.log(chalk.blue('Checking server status...'));
      const res = await axios.get('http://localhost:5000');
      console.log(chalk.green('Server is online!'));
      console.log(chalk.green(`Status: ${res.data.status}`));
      console.log(chalk.gray(`API Version: ${res.data.version || 'unknown'}`));
      console.log(chalk.gray(`Message: ${res.data.message || ''}`));
    } catch (err) {
      console.error(chalk.red('Server is offline or unreachable'));
      console.error(chalk.gray(err.message));
    }
  });

program.command('help')
  .description('Display help information')
  .action(() => {
    program.outputHelp();
  });

// Default command when no arguments
if (process.argv.length <= 2) {
  console.log(chalk.cyan('\n🎮 Chess Coach CLI 🎮'));
  console.log(chalk.gray('Run a command to get started, or use --help for more information.'));
  console.log();
  program.outputHelp();
}

// Parse command line arguments
program.parse(process.argv);
