import React, { useState, useRef, useEffect } from 'react';

interface CommandInputProps {
  onCommand: (command: string) => void;
  disabled: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onCommand, disabled }) => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || disabled) return;

    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Execute command
    onCommand(command);
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete for common commands
      const commands = ['help', 'clear', 'design', 'generate', 'visualize', 'reset'];
      const matching = commands.filter(cmd => cmd.startsWith(command.toLowerCase()));
      if (matching.length === 1) {
        setCommand(matching[0]);
      }
    }
  };

  return (
    <div className="terminal-input">
      <form onSubmit={handleSubmit} className="terminal-form">
        <div className="terminal-prompt">
          <span className="terminal-user">user@circuit-designer</span>
          <span className="terminal-separator">:</span>
          <span className="terminal-path">~</span>
          <span className="terminal-dollar">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="terminal-command-input"
          placeholder={disabled ? "Processing..." : "Enter command..."}
          autoComplete="off"
          spellCheck="false"
        />
      </form>
      
      <div className="terminal-help">
        <small>
          Tip: Use ↑/↓ for history, Tab for autocomplete, type "help" for commands
        </small>
      </div>
    </div>
  );
}; 