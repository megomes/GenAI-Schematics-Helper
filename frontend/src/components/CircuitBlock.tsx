import React from 'react';
import { Handle, Position } from 'reactflow';
import { getSignalTypeColor } from '../lib/circuitMapper';

interface CircuitBlockProps {
  data: {
    name: string;
    function: string;
    inputs: Array<{
      signal_type: string;
      name: string;
      required: boolean;
      description: string;
    }>;
    outputs: Array<{
      signal_type: string;
      name: string;
      description: string;
    }>;
    implementation?: string;
    parameters?: Record<string, any>;
    components?: string[];
  };
}

export const CircuitBlock: React.FC<CircuitBlockProps> = ({ data }) => {
  const hasInputs = data.inputs.length > 0;
  const hasOutputs = data.outputs.length > 0;

  return (
    <div className="circuit-block">
      {/* Input Handles */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          className="circuit-handle circuit-handle-input"
        />
      )}

      <div className="circuit-block-card">
        <header className="circuit-block-header">
          <div className="circuit-block-icon">⚡</div>
          <h4 className="circuit-block-title">{data.name}</h4>
        </header>

        <div className="circuit-block-content">
          <p className="circuit-block-function">{data.function}</p>

          {/* Implementation */}
          {data.implementation && (
            <div className="circuit-block-implementation">
              <span className="circuit-block-impl-icon">⚙</span>
              <span className="circuit-block-impl-text">{data.implementation}</span>
            </div>
          )}

          {/* Key Parameters */}
          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <div className="circuit-block-params">
              <strong>Parameters:</strong>
              <div className="circuit-block-params-list">
                {Object.entries(data.parameters).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="circuit-block-param">
                    <span className="param-key">{key.replace(/_/g, ' ')}</span>
                    <span className="param-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input/Output Summary */}
          <div className="circuit-block-io-summary">
            {hasInputs && (
              <div className="circuit-block-io-item">
                <div className="circuit-block-io-dot input-dot"></div>
                <span>{data.inputs.length} input{data.inputs.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {hasOutputs && (
              <div className="circuit-block-io-item">
                <div className="circuit-block-io-dot output-dot"></div>
                <span>{data.outputs.length} output{data.outputs.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Signal Type Indicators */}
          {hasOutputs && (
            <div className="circuit-block-signals">
              {data.outputs.slice(0, 3).map((output, index) => (
                <span
                  key={index}
                  className="circuit-block-signal-badge"
                  style={{ 
                    borderColor: getSignalTypeColor(output.signal_type),
                    color: getSignalTypeColor(output.signal_type)
                  }}
                >
                  {output.signal_type.replace('_signal', '').replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          className="circuit-handle circuit-handle-output"
        />
      )}
    </div>
  );
};