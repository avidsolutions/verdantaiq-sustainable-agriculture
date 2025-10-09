
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  Minimize2, 
  RotateCcw,
  Lightbulb,
  Settings,
  TrendingUp
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
  isTyping?: boolean;
}

interface WatsonAssistantChatProps {
  onClose: () => void;
}

export function WatsonAssistantChat({ onClose }: WatsonAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Watson Assistant, your AI agricultural expert. I can help you with system management, environmental monitoring, maintenance guidance, and optimization strategies. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<any>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create Watson Assistant session
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/watson/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create_session',
            userId: 'current_user' // In real app, use actual user ID
          }),
        });

        const result = await response.json();
        if (result.success) {
          setSessionId(result.data.sessionId);
        }
      } catch (error) {
        console.error('Failed to initialize Watson session:', error);
      }
    };

    initializeSession();

    return () => {
      // Cleanup session on unmount
      if (sessionId) {
        fetch('/api/watson/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete_session',
            userId: 'current_user'
          }),
        }).catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    // Use a small delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      // Try scrollIntoView first
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }

      // Fallback: manually scroll the container
      if (scrollContainerRef.current) {
        const scrollElement = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    // Force scroll to bottom immediately
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }

    if (scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing_${Date.now()}`,
      role: 'assistant',
      content: 'typing...',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch('/api/watson/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          userId: 'current_user',
          message: inputValue,
          context: {
            ...conversationContext,
            session_id: sessionId,
            user_context: {
              current_system: 'sys_001',
              user_role: 'manager'
            }
          }
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data.output?.generic) {
        // Remove typing indicator and add real response
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: result.data.output.generic[0]?.text || 'I apologize, but I couldn\'t process your request. Please try again.',
            timestamp: new Date(),
            context: result.data.context
          };
          return [...withoutTyping, assistantMessage];
        });

        // Update conversation context for next message
        if (result.data.context) {
          setConversationContext(result.data.context);
        }

        setTimeout(scrollToBottom, 50);
      } else {
        // Remove typing indicator on error
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        throw new Error('Invalid response from Watson');
      }
    } catch (error) {
      console.error('Error sending message to Watson:', error);

      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please try again later or contact support if the issue persists.',
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });

      setTimeout(scrollToBottom, 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string, params?: any) => {
    setIsLoading(true);

    // Add typing indicator for quick actions too
    const typingMessage: Message = {
      id: `typing_${Date.now()}`,
      role: 'assistant',
      content: 'thinking...',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch('/api/watson/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId: 'current_user',
          context: {
            ...conversationContext,
            session_id: sessionId,
            user_context: {
              current_system: 'sys_001',
              user_role: 'manager'
            }
          },
          ...params
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data.output?.generic) {
        // Remove typing indicator and add real response
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          const assistantMessage: Message = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: result.data.output.generic[0]?.text || 'Action completed successfully.',
            timestamp: new Date(),
            context: result.data.context
          };
          return [...withoutTyping, assistantMessage];
        });

        // Update conversation context for next message
        if (result.data.context) {
          setConversationContext(result.data.context);
        }

        setTimeout(scrollToBottom, 50);
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
      // Remove typing indicator on error
      setMessages(prev => prev.filter(msg => !msg.isTyping));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_new',
        role: 'assistant',
        content: "Chat cleared! How can I help you with your agricultural systems today?",
        timestamp: new Date(),
      }
    ]);
    setTimeout(scrollToBottom, 50);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
        <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="font-medium text-sm">Watson Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
          >
            ↑
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full max-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Watson Assistant
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-blue-700 h-8 w-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-700 h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        {/* Quick Actions */}
        <div className="p-3 bg-gray-50 border-b flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('optimization_suggestions', {
                performanceData: {
                  yieldEfficiency: 88.7,
                  energyUsage: 175,
                  waterUsage: 250,
                  uptime: 96.2,
                  qualityScore: 8.5
                }
              })}
              className="h-7 text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Optimization Tips
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('maintenance_guidance', {
                systemComponent: 'sensors',
                message: 'General maintenance schedule'
              })}
              className="h-7 text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Maintenance Help
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('agricultural_query', {
                message: 'What are the current environmental conditions?',
                systemData: {
                  temperature: 72.1,
                  moisture: 68.8,
                  ph: 6.4,
                  activeSystems: ['North Greenhouse', 'South Production'],
                  lastHarvest: '2024-09-01',
                  currentYield: 1250
                }
              })}
              className="h-7 text-xs"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              System Status
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea ref={scrollContainerRef} className="h-full">
            <div className="p-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {message.role === 'user' ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.isTyping ? (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-3 border-t flex-shrink-0 bg-white">
          <div className="flex gap-2 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Watson about your agricultural systems..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              Powered by IBM Watson
            </Badge>
            {sessionId && (
              <div className="text-xs text-muted-foreground">
                Session: {sessionId.slice(-8)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
