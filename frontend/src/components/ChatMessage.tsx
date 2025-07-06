import React from 'react';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  isLoading = false,
}) => {
  return (
    <div className={cn(
      "flex gap-4 p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        isUser ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
      )}>
        {isUser ? (
          <UserIcon className="w-4 h-4" />
        ) : (
          <CpuChipIcon className="w-4 h-4" />
        )}
      </div>
      
      <div className={cn(
        "max-w-[75%]",
        isUser ? "text-right" : "text-left"
      )}>
        <Card className={cn(
          "shadow-sm",
          isUser
            ? "bg-gray-900 text-gray-50 border-gray-800"
            : "bg-white border-gray-200"
        )}>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};