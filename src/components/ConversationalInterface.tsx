import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Volume2 } from 'lucide-react';
import { ConversationalAI } from '../utils/conversationalAI';
import { VoiceInterface } from '../utils/voiceInterface';
import { ChatMessage, StockData, MovingAverage } from '../types';

interface ConversationalInterfaceProps {
  stockData: StockData[];
  movingAverages: MovingAverage[];
  className?: string;
}

export const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  stockData,
  movingAverages,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI stock analyst. Ask me about trends, moving averages, price analysis, or trading recommendations. You can type or use voice commands!",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setSIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationalAI = useRef(new ConversationalAI());
  const voiceInterface = useRef(new VoiceInterface());

  useEffect(() => {
    conversationalAI.current.updateData(stockData, movingAverages);
  }, [stockData, movingAverages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSIsLoading(true);

    try {
      const response = await conversationalAI.current.processQuery(text);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      voiceInterface.current.stopListening();
      setIsListening(false);
      return;
    }

    if (!voiceInterface.current.isSupported()) {
      setVoiceError('Voice recognition is not supported in this browser');
      return;
    }

    setIsListening(true);
    setVoiceError(null);

    try {
      await voiceInterface.current.startListening(
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        },
        (error) => {
          setVoiceError(error);
          setIsListening(false);
        }
      );
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : 'Voice recognition failed');
      setIsListening(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      await voiceInterface.current.speak(text);
    } catch (error) {
      console.error('Text-to-speech failed:', error);
    }
  };

  const formatMessageText = (text: string) => {
    // Simple formatting for better readability
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg flex flex-col h-96 ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">AI Stock Analyst</h2>
          {voiceInterface.current.isSupported() && (
            <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded">
              Voice Enabled
            </span>
          )}
        </div>
        {voiceError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {voiceError}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md flex items-start space-x-2
              ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'}`}
              >
                {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`rounded-lg p-3 relative group
                ${message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'}`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                />
                
                {message.sender === 'ai' && (
                  <button
                    onClick={() => handleTextToSpeech(message.text)}
                    className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 
                             transition-opacity bg-gray-200 hover:bg-gray-300 p-1 rounded"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3 text-gray-600" />
                  </button>
                )}
                
                <div className={`text-xs mt-1 opacity-70
                  ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 
                            text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputText)}
            placeholder="Ask about stock trends, prices, recommendations..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={isLoading || !inputText.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Try asking: "What's the current trend?", "Should I buy or sell?", "What's the 10-day average?"
        </div>
      </div>
    </div>
  );
};