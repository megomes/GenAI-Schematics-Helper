import React from 'react';

interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'system';
  timestamp: Date;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  isLoading: boolean;
  error: string | null;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines, isLoading, error }) => {
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getLinePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return '';
      case 'output':
        return '>';
      case 'error':
        return '[ERROR]';
      case 'system':
        return '[SYSTEM]';
      default:
        return '';
    }
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'terminal-command';
      case 'output':
        return 'terminal-output';
      case 'error':
        return 'terminal-error';
      case 'system':
        return 'terminal-system';
      default:
        return '';
    }
  };

  return (
    <div className="terminal-content">
      {lines.map((line) => (
        <div key={line.id} className={`terminal-line ${getLineClass(line.type)}`}>
          <span className="terminal-timestamp">[{formatTimestamp(line.timestamp)}]</span>
          <span className="terminal-prefix">{getLinePrefix(line.type)}</span>
          <span className="terminal-text">{line.content}</span>
        </div>
      ))}
      
      {isLoading && (
        <div className="terminal-line terminal-loading">
          <span className="terminal-timestamp">[{formatTimestamp(new Date())}]</span>
          <span className="terminal-prefix">{'>'}</span>
          <span className="terminal-text">
            Processing
            <span className="terminal-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </span>
        </div>
      )}
      
      {error && (
        <div className="terminal-line terminal-error">
          <span className="terminal-timestamp">[{formatTimestamp(new Date())}]</span>
          <span className="terminal-prefix">[ERROR]</span>
          <span className="terminal-text">{error}</span>
        </div>
      )}
      
      <div className="terminal-cursor">_</div>
    </div>
  );
}; 