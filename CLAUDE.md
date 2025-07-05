# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a GenAI-powered circuit design tool with a professional backend/frontend separation:

### Backend Components
1. **Circuit Design Agent** (`backend/src/circuit_agent.py`) - Uses Anthropic's Claude API to:
   - Ask strategic questions about circuit requirements
   - Generate structured JSON circuit designs using signal type-based connections
   - Maintain conversation context for iterative design
   - Validate circuit designs against JSON schema

2. **FastAPI REST API** (`backend/api/server.py`) - Provides endpoints for React frontend:
   - `/api/session/start` - Initialize new design session
   - `/api/session/respond` - Continue conversation
   - `/api/circuit/generate` - Generate circuit from requirements
   - `/api/circuit/validate` - Validate circuit JSON
   - `/api/session/status` - Get session information

### Frontend (Future React Integration)
- Ready for React frontend integration
- CORS configured for development servers (ports 3000, 5173)
- Structured API responses with Pydantic models

## Development Commands

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env to add ANTHROPIC_API_KEY=your-key-here
```

### Running the Application
```bash
# Start the CLI interface
python scripts/run_agent.py

# Start the FastAPI server (for React frontend)
cd backend && uvicorn api.server:app --reload --host 0.0.0.0 --port 8000

# API will be available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Testing
```bash
# Run the test script to simulate a complete design session
python scripts/test_circuit_agent.py
```

## Key Data Structures

### Circuit JSON Schema
The system generates structured JSON with signal type-based connections:
- `circuit_info` - Name, description, type, complexity
- `blocks` - Circuit blocks with IDs, types, functions, parameters, positions
- `signal_flow` - Signal connections between blocks using standardized signal types

### Signal Types
Standardized signal types for automatic connection inference:
- `audio_signal` - Audio connections
- `cv_signal` - Control voltage
- `gate_signal` - Gate/trigger signals
- `sync_signal` - Synchronization signals
- `power_12v`, `power_neg12v`, `power_5v` - Power rails
- `ground` - Ground connections

## Architecture Notes

### Agent Design Pattern
The `CircuitDesignAgent` class uses a conversation-based approach:
- Maintains conversation history for context
- Asks 2-3 specific technical questions per interaction
- Generates complete circuit designs on demand
- Automatic block positioning with x,y coordinates
- JSON validation against defined schema

### API Design
- FastAPI with automatic OpenAPI documentation
- Pydantic models for request/response validation
- CORS configuration for React development
- Session management for stateful conversations
- Error handling and validation responses

### File Organization
```
backend/
├── src/
│   └── circuit_agent.py     # Main AI agent class
├── api/
│   └── server.py            # FastAPI REST API
└── requirements.txt         # Backend dependencies

shared/
├── schemas/
│   └── circuit_schema.json  # JSON schema definition
└── examples/
    └── *.json               # Example circuit designs

scripts/
├── run_agent.py             # CLI interface
└── test_circuit_agent.py    # Integration tests
```

## Dependencies

### Backend Dependencies
- `anthropic>=0.25.0` - Claude API client
- `python-dotenv>=1.0.0` - Environment variable management
- `fastapi>=0.104.0` - REST API framework
- `uvicorn>=0.24.0` - ASGI server
- `pydantic>=2.5.0` - Data validation

### Frontend Dependencies (Future)
- React.js - UI framework
- D3.js or similar - Circuit visualization
- Axios/Fetch - API communication

## Configuration
- API keys stored in `.env` file
- Circuit JSON schema in `shared/schemas/circuit_schema.json`
- FastAPI server runs on port 8000 by default
- CORS headers enabled for React development servers

## Important Notes
- All code, documentation, and prompts are in English
- Never commit to master/main branches
- Never drop databases
- Signal type-based connections preferred over pin-level connections
- JSON designs are validated against schema before output
- Virtual environment (venv/) is gitignored - create locally