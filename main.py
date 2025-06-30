from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

# Minimal LangChain setup with fallback
try:
    from langchain_openai import OpenAI
    from langchain.chains import ConversationChain
    from langchain.memory import ConversationBufferMemory
    LANGCHAIN_AVAILABLE = True
except ImportError:
    # Create mock classes for development if LangChain is not installed
    class OpenAI:
        def __init__(self, **kwargs):
            pass
        async def predict(self, input_text):
            return f"Echo1: {input_text}"
    
    class ConversationChain:
        def __init__(self, **kwargs):
            pass
        async def predict(self, input):
            return f"Echo2: {input}"
    
    class ConversationBufferMemory:
        def __init__(self):
            pass
    
    LANGCHAIN_AVAILABLE = False

app = FastAPI(title="Chess Coach AI API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store conversation sessions
sessions = {}

class ChatMessage(BaseModel):
    message: str
    userId: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    userId: str

@app.get("/")
async def root():
    return {"message": "Chess Coach AI API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Chess Coach AI API"}

@app.post("/py-api/chat/message", response_model=ChatResponse)
async def chat_message(chat_request: ChatMessage):
    """
    Process chat messages using LangChain and OpenAI
    """
    try:
        user_id = chat_request.userId
        message = chat_request.message
        
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Initialize conversation for user if not exists
        if user_id not in sessions:
            # Check if OpenAI API key is available
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                # Fallback to mock response if no API key
                return ChatResponse(
                    response=f"Echo (no API key): {message}",
                    userId=user_id
                )
            
            # Create LangChain conversation
            llm = OpenAI(
                api_key=openai_api_key,
                temperature=0.7,
                model="gpt-3.5-turbo-instruct"
            )
            memory = ConversationBufferMemory()
            sessions[user_id] = ConversationChain(
                llm=llm,
                memory=memory,
                verbose=True
            )
        
        # Get response from conversation chain
        conversation = sessions[user_id]
        # predict is synchronous in LangChain
        response = conversation.predict(input=message)
        print(f"[DEBUG] User: {user_id}, Message: {message}, Response: {response}")
        return ChatResponse(response=response, userId=user_id)
        
    except Exception as e:
        # Return error response
        error_msg = f"Error processing message: {str(e)}"
        return ChatResponse(response=error_msg, userId=chat_request.userId)

@app.post("/py-api/chess/analyze")
async def analyze_position():
    """
    Placeholder for chess position analysis
    """
    return {"message": "Chess analysis endpoint - coming soon"}

@app.get("/py-api/chess/opening/{opening_name}")
async def get_opening_info(opening_name: str):
    """
    Get information about a chess opening
    """
    return {
        "opening": opening_name,
        "description": f"Information about {opening_name} opening - coming soon"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
