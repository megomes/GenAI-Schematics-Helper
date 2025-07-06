import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import type { Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import { CircuitBlock } from './CircuitBlock';
import { transformToReactFlow } from '../lib/circuitMapper';
import type { CircuitDesign } from '../lib/circuitMapper';

// Custom node types
const nodeTypes = {
  circuitBlock: CircuitBlock,
};

interface CircuitVisualizationProps {
  circuitDesign: CircuitDesign;
}

export const CircuitVisualization: React.FC<CircuitVisualizationProps> = ({ 
  circuitDesign 
}) => {
  const { nodes: initialNodes, edges: initialEdges } = transformToReactFlow(circuitDesign);
  
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="circuit-visualization">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        className="circuit-flow"
      >
        <Controls className="circuit-controls" />
        <MiniMap
          nodeColor="var(--secondary-color)"
          nodeStrokeColor="var(--primary-color)"
          className="circuit-minimap"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="var(--secondary-color)"
        />
      </ReactFlow>

      {/* Circuit Info Panel */}
      <div className="circuit-info-panel">
        <div className="card">
          <header>
            <h3>{circuitDesign.circuit_info.name}</h3>
            <p>{circuitDesign.circuit_info.description}</p>
          </header>
          
          <div className="card-body">
            {circuitDesign.circuit_info.supply_voltage && (
              <div className="circuit-info-item">
                <strong>Supply Voltage:</strong> {circuitDesign.circuit_info.supply_voltage}
              </div>
            )}

            {circuitDesign.circuit_info.categories && circuitDesign.circuit_info.categories.length > 0 && (
              <div className="circuit-info-item">
                <strong>Categories:</strong> {circuitDesign.circuit_info.categories.join(', ')}
              </div>
            )}

            <div className="circuit-stats">
              <div className="circuit-stat">
                <strong>Blocks:</strong> {circuitDesign.blocks.length}
              </div>
              <div className="circuit-stat">
                <strong>Connections:</strong> {circuitDesign.signal_flow.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Legend */}
      <div className="circuit-legend-panel">
        <div className="card">
          <header>
            <h4>Signal Types</h4>
          </header>
          <div className="card-body">
            <div className="signal-legend">
              <div className="signal-item">
                <div className="signal-line signal-audio"></div>
                <span>Audio Signal</span>
              </div>
              <div className="signal-item">
                <div className="signal-line signal-cv"></div>
                <span>CV Signal</span>
              </div>
              <div className="signal-item">
                <div className="signal-line signal-gate"></div>
                <span>Gate Signal</span>
              </div>
              <div className="signal-item">
                <div className="signal-line signal-sync"></div>
                <span>Sync Signal</span>
              </div>
              <div className="signal-item">
                <div className="signal-line signal-power"></div>
                <span>Power</span>
              </div>
              <div className="signal-item">
                <div className="signal-line signal-ground"></div>
                <span>Ground</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};