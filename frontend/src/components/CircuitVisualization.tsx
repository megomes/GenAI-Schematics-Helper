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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
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
    <div className="w-full h-full relative bg-gray-50">
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
        className="bg-gray-50"
      >
        <Controls
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
        <MiniMap
          nodeColor="#6B7280"
          nodeStrokeColor="#D1D5DB"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#E5E7EB"
        />
      </ReactFlow>

      {/* Circuit Info Panel */}
      <div className="absolute top-6 left-6 max-w-sm">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {circuitDesign.circuit_info.name}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {circuitDesign.circuit_info.description}
            </p>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-4">
            {circuitDesign.circuit_info.supply_voltage && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Supply Voltage</p>
                <Badge variant="outline" className="text-xs">
                  {circuitDesign.circuit_info.supply_voltage}
                </Badge>
              </div>
            )}

            {circuitDesign.circuit_info.categories && circuitDesign.circuit_info.categories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {circuitDesign.circuit_info.categories.map((category, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-gray-700">Blocks</p>
                <p className="text-gray-500">{circuitDesign.blocks.length}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Connections</p>
                <p className="text-gray-500">{circuitDesign.signal_flow.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signal Legend */}
      <div className="absolute bottom-6 right-6">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Signal Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Audio Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 rounded"></div>
                <span className="text-gray-600">CV Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 rounded"></div>
                <span className="text-gray-600">Gate Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Sync Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Power</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500 rounded"></div>
                <span className="text-gray-600">Ground</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};