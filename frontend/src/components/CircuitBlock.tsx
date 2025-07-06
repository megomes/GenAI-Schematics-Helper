import React from 'react';
import { Handle, Position } from 'reactflow';
import { CpuChipIcon, CogIcon } from '@heroicons/react/24/outline';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
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
    <div className="relative">
      {/* Input Handles */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white shadow-sm"
        />
      )}

      <Card className="w-64 shadow-md border-gray-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-4 h-4 text-gray-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-900 leading-tight">
              {data.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            {data.function}
          </p>

          {/* Implementation */}
          {data.implementation && (
            <div className="flex items-start gap-2">
              <CogIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                {data.implementation}
              </p>
            </div>
          )}

          <Separator />

          {/* Key Parameters */}
          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Parameters</p>
              <div className="space-y-1">
                {Object.entries(data.parameters).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input/Output Summary */}
          <div className="flex justify-between items-center text-xs">
            {hasInputs && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-500">
                  {data.inputs.length} input{data.inputs.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {hasOutputs && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-500">
                  {data.outputs.length} output{data.outputs.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Signal Type Indicators */}
          {hasOutputs && (
            <div className="flex flex-wrap gap-1">
              {data.outputs.slice(0, 3).map((output, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-1.5 py-0.5"
                  style={{ 
                    borderColor: getSignalTypeColor(output.signal_type),
                    color: getSignalTypeColor(output.signal_type)
                  }}
                >
                  {output.signal_type.replace('_signal', '').replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Handles */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-blue-500 border-2 border-white shadow-sm"
        />
      )}
    </div>
  );
};