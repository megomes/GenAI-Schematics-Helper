#!/usr/bin/env python3
"""
FastAPI server for Circuit Design Agent
Provides REST API endpoints for React frontend communication
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sys
import os

# Add the src directory to the path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from circuit_agent import CircuitDesignAgent

app = FastAPI(
    title="Circuit Design Agent API",
    description="AI-powered circuit design tool API",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent instance
agent = None

class SessionStartRequest(BaseModel):
    description: str

class UserResponseRequest(BaseModel):
    session_id: str
    response: str

class CircuitGenerationRequest(BaseModel):
    session_id: str

class SessionResponse(BaseModel):
    session_id: str
    agent_response: str

class CircuitDesignResponse(BaseModel):
    circuit_design: Dict[str, Any]
    success: bool
    errors: Optional[List[str]] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the circuit design agent on startup"""
    global agent
    try:
        agent = CircuitDesignAgent()
        print("Circuit Design Agent initialized successfully")
    except Exception as e:
        print(f"Failed to initialize Circuit Design Agent: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Circuit Design Agent API is running", "status": "healthy"}

@app.post("/api/session/start", response_model=SessionResponse)
async def start_session(request: SessionStartRequest):
    """Start a new circuit design session"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        response = agent.start_design_session(request.description)
        session_id = f"session_{hash(request.description)}_{len(agent.conversation_history)}"
        
        return SessionResponse(
            session_id=session_id,
            agent_response=response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@app.post("/api/session/respond", response_model=SessionResponse)
async def process_response(request: UserResponseRequest):
    """Process user response in an ongoing session"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        response = agent.process_user_response(request.response)
        
        return SessionResponse(
            session_id=request.session_id,
            agent_response=response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process response: {str(e)}")

@app.post("/api/circuit/generate", response_model=CircuitDesignResponse)
async def generate_circuit(request: CircuitGenerationRequest):
    """Generate circuit design JSON from current conversation"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        circuit_design = agent.generate_circuit_design()
        
        if "error" in circuit_design:
            return CircuitDesignResponse(
                circuit_design={},
                success=False,
                errors=[circuit_design.get("error", "Unknown error")]
            )
        
        return CircuitDesignResponse(
            circuit_design=circuit_design,
            success=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate circuit: {str(e)}")

@app.post("/api/circuit/validate")
async def validate_circuit(circuit_design: Dict[str, Any]):
    """Validate a circuit design JSON structure"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        validation_result = agent.validate_circuit_design(circuit_design)
        return {
            "valid": validation_result["valid"],
            "errors": validation_result["errors"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate circuit: {str(e)}")

@app.get("/api/session/status")
async def get_session_status():
    """Get current session status and conversation history length"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    return {
        "conversation_length": len(agent.conversation_history),
        "has_active_session": len(agent.conversation_history) > 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)