import { useState, useEffect, useRef } from 'react';
import { TerminalOutput } from './components/TerminalOutput';
import { CommandInput } from './components/CommandInput';
import { CircuitVisualization } from './components/CircuitVisualization';
import { circuitApi } from './lib/api';

interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'system';
  timestamp: Date;
}

function App() {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [circuitDesign, setCircuitDesign] = useState<any>(null);
  const [isGeneratingCircuit, setIsGeneratingCircuit] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines]);

  useEffect(() => {
    // Welcome message
    addTerminalLine('Circuit Design Terminal v1.0.0', 'system');
    addTerminalLine('Type "help" for available commands', 'system');
    addTerminalLine('Ready to design your circuit...', 'system');
  }, []);

  const addTerminalLine = (content: string, type: TerminalLine['type']) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    addTerminalLine(`$ ${command}`, 'command');
    setIsLoading(true);
    setError(null);

    // Handle built-in commands
    if (command.toLowerCase() === 'help') {
      addTerminalLine('Available commands:', 'output');
      addTerminalLine('  help                 - Show this help message', 'output');
      addTerminalLine('  clear                - Clear terminal', 'output');
      addTerminalLine('  design <description> - Start circuit design', 'output');
      addTerminalLine('  generate             - Generate circuit diagram', 'output');
      addTerminalLine('  visualize            - Show circuit visualization', 'output');
      addTerminalLine('  reset                - Reset current session', 'output');
      setIsLoading(false);
      return;
    }

    if (command.toLowerCase() === 'clear') {
      setTerminalLines([]);
      addTerminalLine('Terminal cleared', 'system');
      setIsLoading(false);
      return;
    }

    if (command.toLowerCase() === 'reset') {
      handleNewSession();
      addTerminalLine('Session reset', 'system');
      setIsLoading(false);
      return;
    }

    if (command.toLowerCase() === 'generate') {
      if (!isSessionStarted) {
        addTerminalLine('Error: No active design session. Use "design <description>" first.', 'error');
        setIsLoading(false);
        return;
      }
      await handleGenerateCircuit();
      return;
    }

    if (command.toLowerCase() === 'visualize') {
      if (!circuitDesign) {
        addTerminalLine('Error: No circuit design available. Use "generate" first.', 'error');
        setIsLoading(false);
        return;
      }
      setShowVisualization(true);
      setIsLoading(false);
      return;
    }

    try {
      if (!isSessionStarted && command.toLowerCase().startsWith('design ')) {
        const description = command.substring(7).trim();
        if (!description) {
          addTerminalLine('Error: Please provide a circuit description.', 'error');
          setIsLoading(false);
          return;
        }
        const response = await circuitApi.startSession(description);
        setSessionId(response.session_id);
        setIsSessionStarted(true);
        addTerminalLine('Design session started', 'system');
        addTerminalLine(response.agent_response, 'output');
      } else if (isSessionStarted) {
        if (!sessionId) {
          throw new Error('No active session');
        }
        const response = await circuitApi.sendMessage(sessionId, command);
        addTerminalLine(response.agent_response, 'output');
      } else {
        addTerminalLine('Error: Unknown command. Type "help" for available commands.', 'error');
      }
    } catch (err) {
      console.error('Error processing command:', err);
      const errorMsg = err instanceof Error ? err.message : 'Command failed';
      addTerminalLine(`Error: ${errorMsg}`, 'error');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCircuit = async () => {
    if (!sessionId) return;

    setIsGeneratingCircuit(true);
    setError(null);
    addTerminalLine('Generating circuit design...', 'system');

    try {
      const response = await circuitApi.generateCircuit(sessionId);
      if (response.success && response.circuit_design) {
        setCircuitDesign(response.circuit_design);
        addTerminalLine('Circuit generated successfully! Use "visualize" to view.', 'system');
      } else {
        const errorMsg = response.errors?.join(', ') || 'Failed to generate circuit';
        addTerminalLine(`Error: ${errorMsg}`, 'error');
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error generating circuit:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate circuit';
      addTerminalLine(`Error: ${errorMsg}`, 'error');
      setError(errorMsg);
    } finally {
      setIsGeneratingCircuit(false);
    }
  };

  const handleBackToTerminal = () => {
    setShowVisualization(false);
  };

  const handleNewSession = () => {
    setTerminalLines([]);
    setSessionId(null);
    setIsSessionStarted(false);
    setShowVisualization(false);
    setCircuitDesign(null);
    setError(null);
    // Re-add welcome message
    addTerminalLine('Circuit Design Terminal v1.0.0', 'system');
    addTerminalLine('Type "help" for available commands', 'system');
    addTerminalLine('Ready to design your circuit...', 'system');
  };

  if (showVisualization && circuitDesign) {
    return (
      <div className="terminal">
        <nav>
          <div className="nav-left">
            <button className="btn btn-ghost" onClick={handleBackToTerminal}>
              ← Back to Terminal
            </button>
          </div>
          <div className="nav-center">
            <h1>Circuit Visualization</h1>
          </div>
          <div className="nav-right">
            <button className="btn btn-primary" onClick={handleNewSession}>
              New Session
            </button>
          </div>
        </nav>

        <div className="container">
          <div className="card">
            <header>
              <h2>{circuitDesign.circuit_info?.name || 'Unnamed Circuit'}</h2>
              <p>{circuitDesign.circuit_info?.description || 'Circuit visualization'}</p>
            </header>
            <div className="card-body">
              <CircuitVisualization circuitDesign={circuitDesign} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal">
      <nav>
        <div className="nav-left">
          <h1>Circuit Design Terminal</h1>
        </div>
        <div className="nav-right">
          <button className="btn btn-primary" onClick={handleNewSession}>
            Reset
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="terminal-window">
          <TerminalOutput 
            lines={terminalLines}
            isLoading={isLoading}
            error={error}
          />
          <div ref={terminalEndRef} />
        </div>
        
        <CommandInput 
          onCommand={handleCommand}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default App;