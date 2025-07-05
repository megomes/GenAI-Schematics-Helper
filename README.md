# Circuit Design Tool

AI-powered circuit design tool that generates structured circuit designs through conversational AI using Claude API.

## 🏗️ Project Structure

```
circuit-design-tool/
├── backend/                 # Python backend
│   ├── src/
│   │   └── circuit_agent.py    # Main circuit design agent
│   ├── api/
│   │   └── server.py           # FastAPI REST server
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment template
│   └── CLAUDE.md              # Claude Code instructions
├── frontend/                # (Future React app)
├── shared/
│   ├── schemas/
│   │   └── circuit_schema.json # JSON schema definition
│   └── examples/
│       └── sample_circuits/    # Example circuit designs
├── scripts/
│   ├── run_agent.py           # CLI interface
│   └── serve_static.py        # Static HTTP server
└── docs/
    └── README.md              # This file
```

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Run CLI Interface**
   ```bash
   python ../scripts/run_agent.py
   ```

4. **Run API Server** (for React frontend)
   ```bash
   cd backend/api
   python server.py
   ```

## 🔧 API Endpoints

The FastAPI server provides the following endpoints for React frontend integration:

- `POST /api/session/start` - Start a new design session
- `POST /api/session/respond` - Process user responses
- `POST /api/circuit/generate` - Generate circuit design JSON
- `POST /api/circuit/validate` - Validate circuit design
- `GET /api/session/status` - Get session status

## 📊 Circuit JSON Schema

The tool generates structured JSON with:

- **Circuit Info**: Name, description, supply voltage, categories
- **Blocks**: Functional blocks with inputs/outputs, positioning, technical details
- **Signal Flow**: Connections between blocks by signal type

Signal types supported:
- `audio_signal` - Audio signals
- `cv_signal` - Control voltage (1V/oct, modulation)
- `gate_signal` - Gate/trigger signals
- `sync_signal` - Synchronization signals
- `power_12v`, `power_neg12v`, `power_5v` - Power supplies
- `ground` - Ground connections

## 🛠️ Development

### Running the CLI Tool
```bash
python scripts/run_agent.py
```

### Starting the API Server
```bash
cd backend/api
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Static File Server (for testing)
```bash
python scripts/serve_static.py
```

## 📁 File Organization

- **Backend**: All Python code, API server, and dependencies
- **Shared**: JSON schemas and example circuits accessible to both backend and frontend
- **Scripts**: Utility scripts for development and testing
- **Docs**: Project documentation

## 🔮 Future Features

- React frontend for interactive circuit visualization
- Real-time circuit editing and validation
- Component library and templates
- Export to various formats (PDF, SVG, netlist)
- Collaborative circuit design

## 📝 License

This project is for educational and development purposes.