# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GenAI-powered circuit design tool that helps users create electronic circuits through conversational AI. The system consists of two main components:

1. **Python Circuit Design Agent** - Uses Anthropic's Claude API to generate structured circuit designs in JSON format through conversational interface
2. **React Frontend** (planned) - Will render the generated JSON into interactive circuit visualizations for users

## Development Commands

### Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env to add ANTHROPIC_API_KEY=your-key-here
```

### Running the Application
```bash
# Start interactive circuit design session
python circuit_agent.py

# Run automated test session
python test_circuit_agent.py

# Start local HTTP server for visualization
python serve.py
```

### Testing
```bash
# Run the test script to simulate a complete design session
python test_circuit_agent.py
```

## Architecture

### Core Components

**CircuitDesignAgent Class** (`circuit_agent.py`)
- Manages conversation-based circuit design sessions
- Maintains conversation history and user requirements
- Interfaces with Claude API for intelligent questioning and JSON generation
- Generates structured circuit designs in functional block format

**HTTP Server** (`serve.py`)
- Serves circuit visualization files with CORS support
- Runs on port 8000 with auto-browser opening
- Enables real-time JSON file monitoring for dynamic updates

### Key Methods

- `start_design_session()` - Initiates conversation with strategic questions
- `process_user_response()` - Handles user input and generates follow-up questions
- `generate_circuit_design()` - Creates final JSON circuit design with functional blocks

### Circuit JSON Schema

The system generates structured JSON designed for React frontend consumption with functional blocks containing:
- Signal flow architecture with inputs/outputs
- Implementation details and working principles
- Component specifications and parameters
- Adjustment/calibration instructions
- Test points and troubleshooting guidance
- Alternative implementation options

The JSON format follows the `signal_flow` structure optimized for React component rendering and interactive circuit visualization.

### API Integration

Uses Anthropic Claude API (claude-3-5-sonnet-20241022) with:
- Conversational context maintenance
- System prompts for strategic questioning
- JSON-only response generation for circuit designs
- Error handling and response validation

## Configuration

- API keys stored in `.env` file (copy from `env.example`)
- Circuit designs saved to `circuit_design.json` or `test_circuit_design.json`
- Server runs on localhost:8000 with CORS enabled
- Temperature: 0.7, Max tokens: 4000 for API calls

## Dependencies

- `anthropic>=0.25.0` - Claude API client
- `python-dotenv>=1.0.0` - Environment variable management
- Standard Python libraries: `http.server`, `json`, `os`, `pathlib`