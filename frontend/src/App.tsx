import { useState, useEffect, useRef } from 'react';
import { CpuChipIcon, ArrowLeftIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { CircuitVisualization } from './components/CircuitVisualization';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { circuitApi } from './lib/api';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [circuitDesign, setCircuitDesign] = useState<any>(null);
  const [isGeneratingCircuit, setIsGeneratingCircuit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    addMessage(message, true);
    setIsLoading(true);
    setError(null);

    try {
      if (!isSessionStarted) {
        const response = await circuitApi.startSession(message);
        setSessionId(response.session_id);
        setIsSessionStarted(true);
        addMessage(response.agent_response, false);
      } else {
        if (!sessionId) {
          throw new Error('No active session');
        }
        const response = await circuitApi.sendMessage(sessionId, message);
        addMessage(response.agent_response, false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCircuit = async () => {
    if (!sessionId) return;

    setIsGeneratingCircuit(true);
    setError(null);

    try {
      const response = await circuitApi.generateCircuit(sessionId);
      if (response.success && response.circuit_design) {
        setCircuitDesign(response.circuit_design);
        setShowVisualization(true);
      } else {
        setError(response.errors?.join(', ') || 'Failed to generate circuit');
      }
    } catch (err) {
      console.error('Error generating circuit:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate circuit');
    } finally {
      setIsGeneratingCircuit(false);
    }
  };

  const handleBackToChat = () => {
    setShowVisualization(false);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setIsSessionStarted(false);
    setShowVisualization(false);
    setCircuitDesign(null);
    setError(null);
  };

  // Check if should show generate button (at least 2 messages exchanged)
  const shouldShowGenerateButton = isSessionStarted && messages.length >= 4 && !isLoading;

  if (showVisualization && circuitDesign) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToChat}>
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <CpuChipIcon className="w-6 h-6 text-gray-700" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Circuit Visualization</h1>
                  <p className="text-sm text-gray-600">
                    {circuitDesign.circuit_info?.name || 'Unnamed Circuit'}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleNewSession}>
              New Session
            </Button>
          </div>
        </header>

        {/* Visualization Area */}
        <div className="flex-1">
          <CircuitVisualization circuitDesign={circuitDesign} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CpuChipIcon className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Circuit Design Assistant</h1>
              <p className="text-sm text-gray-600">AI-powered electronic circuit design</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {shouldShowGenerateButton && (
              <Button
                onClick={handleGenerateCircuit}
                disabled={isGeneratingCircuit}
                className="gap-2"
              >
                <BoltIcon className="w-4 h-4" />
                {isGeneratingCircuit ? 'Generating...' : 'Generate Circuit'}
              </Button>
            )}
            {isSessionStarted && (
              <Button variant="outline" onClick={handleNewSession}>
                New Session
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <Card className="max-w-md text-center shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CpuChipIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <CardTitle className="text-xl">Welcome to Circuit Design Assistant</CardTitle>
                    <CardDescription>
                      Describe the electronic circuit you want to create and I'll help you design it step by step.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary">Audio</Badge>
                      <Badge variant="secondary">Synthesizer</Badge>
                      <Badge variant="secondary">Filter</Badge>
                      <Badge variant="secondary">Oscillator</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="py-6 space-y-1">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message.content}
                      isUser={message.isUser}
                    />
                  ))}
                  {isLoading && (
                    <ChatMessage
                      message=""
                      isUser={false}
                      isLoading={true}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <>
            <Separator />
            <div className="bg-red-50 border-red-200 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 text-red-700">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={
            isSessionStarted
              ? "Continue the conversation..."
              : "Describe the circuit you want to create..."
          }
        />
      </div>
    </div>
  );
}

export default App;