# PostgreSQL Conversation Logging Implementation

## Overview

This implementation adds persistent conversation logging to the Chess Coach application using PostgreSQL. All chat conversations are now stored in the database and persist across server restarts.

## Features Implemented

### 1. Database Schema
- **conversations** table: Stores conversation metadata
- **messages** table: Stores individual messages with user/assistant roles
- Proper foreign key relationships and indexes
- UUID primary keys for security
- Conversation insights and coaching metadata stored per conversation

### 2. API Endpoints

#### Chat Endpoints
- `POST /api/chat/message` - Send message and get AI response
- `GET /api/chat/conversations` - Get all user conversations
- `GET /api/chat/conversations/:id` - Get specific conversation with messages
- `PUT /api/chat/conversations/:id` - Update conversation title
- `GET /api/chat/conversations/:id/metadata` - Get conversation insights and coaching metadata
- `PUT /api/chat/conversations/:id/metadata` - Update insights or coaching metadata
- `DELETE /api/chat/conversations/:id` - Delete conversation
- `GET /api/chat/search` - Search conversations by content

#### Enhanced Message Endpoint
The `/api/chat/message` endpoint now supports:
- `userId` (required): User identifier
- `conversationId` (optional): Continue existing conversation
- `message` (required): User message content

Response includes:
- `response`: AI response
- `conversationId`: Conversation UUID
- `title`: Auto-generated conversation title

### 3. Conversation Insights & Metadata
Conversation records now include an `insights` array and `coaching_metadata` object.
These fields track key themes from prior chats such as openings discussed or
repeated mistakes. Metadata can be updated via a dedicated endpoint and is
loaded with the conversation to improve future prompting.

### 4. Database Models

#### Conversation Model
```javascript
{
  id: UUID (primary key),
  user_id: String (indexed),
  title: String (auto-generated),
  metadata: JSON,
  insights: JSON[],
  coaching_metadata: JSON,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### Message Model
```javascript
{
  id: UUID (primary key),
  conversation_id: UUID (foreign key),
  role: ENUM('user', 'assistant'),
  content: Text,
  timestamp: Timestamp,
  metadata: JSON
}
```

### 5. Key Components

#### Database Configuration
- `backend/config/database.js` - Sequelize connection setup
- `backend/models/` - Sequelize models for conversations and messages
- `backend/scripts/setup-database.js` - Database creation script

#### Services
- `backend/services/ConversationService.js` - Complete CRUD operations
  - Create/read/update/delete conversations
  - Add messages to conversations
  - Search functionality
  - Auto-generate conversation titles

#### Enhanced Chat Route
- `backend/routes/api/chat.js` - Updated with database persistence
  - Maintains LangChain conversation context
  - Stores all messages in database
  - Loads conversation history for context

## Setup Instructions

### 1. Database Setup
```bash
# Create the database
node backend/scripts/setup-database.js

# Start the server (will create tables automatically)
npm start
```

### 2. Environment Variables
Ensure your `.env` file contains:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chess_coach
DB_USER=postgres
DB_PASSWORD=postgres
OPENAI_API_KEY=your_openai_key
```

### 3. Testing
```bash
# Run the test script
node backend/test-chat.js
```

## Database Operations

### Conversation Context Loading
The system now loads previous messages from the database to maintain conversation context in LangChain:

1. User sends message
2. System retrieves conversation history from database
3. Rebuilds LangChain memory with conversation context
4. Generates AI response with full context
5. Stores both user message and AI response in database

### Auto-Title Generation
New conversations automatically generate titles from the first message:
- Takes first 50 characters of user's message
- Truncates at word boundaries
- Adds ellipsis if truncated

### Search Functionality
Search across conversations by:
- Conversation titles
- Message content
- Returns matching conversations with relevant messages

## Database Schema Diagram

```
conversations
├── id (UUID, PK)
├── user_id (String, indexed)
├── title (String)
├── metadata (JSON)
├── created_at (Timestamp)
└── updated_at (Timestamp)

messages
├── id (UUID, PK)
├── conversation_id (UUID, FK → conversations.id)
├── role (ENUM: 'user' | 'assistant')
├── content (Text)
├── timestamp (Timestamp)
└── metadata (JSON)
```

## Performance Considerations

### Indexes
- `conversations.user_id` - Fast user conversation lookup
- `conversations.created_at` - Chronological sorting
- `messages.conversation_id` - Fast message retrieval
- `messages.timestamp` - Message ordering
- `messages.role` - Role-based filtering

### Query Optimization
- Pagination support for conversations and messages
- Efficient conversation context loading
- Bulk operations for message insertion

## Benefits

1. **Persistence**: Conversations survive server restarts
2. **Multi-device**: Access conversations from any device
3. **Search**: Full-text search across conversation history
4. **Analytics**: Track conversation patterns and usage
5. **Scalability**: Database can handle large conversation volumes
6. **Context**: AI maintains conversation context across sessions

## API Usage Examples

### Send Message
```javascript
POST /api/chat/message
{
  "message": "Hello, can you help me learn chess?",
  "userId": "user-123",
  "conversationId": "optional-conversation-id"
}
```

### Get Conversations
```javascript
GET /api/chat/conversations?userId=user-123
```

### Get Conversation with Messages
```javascript
GET /api/chat/conversations/conversation-id?userId=user-123
```

### Search Conversations
```javascript
GET /api/chat/search?userId=user-123&query=chess
```

## Test Results

The implementation was successfully tested with:
- ✅ Message persistence across requests
- ✅ Conversation context maintenance
- ✅ Auto-title generation
- ✅ User conversation retrieval
- ✅ Individual conversation access
- ✅ Database relationship integrity
- ✅ UUID security implementation

All conversation data is now safely stored in PostgreSQL and will persist across server restarts.
