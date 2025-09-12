import React, { useState, useCallback } from 'react';
import { Brain, BarChart3, MessageSquare, Upload } from 'lucide-react';
import { DataUploader } from './components/DataUploader';
import { StockChart } from './components/StockChart';
import { ConversationalInterface } from './components/ConversationalInterface';
import { AnalysisResults } from './components/AnalysisResults';
import { StockSpanCalculator } from './utils/stockSpanCalculator';
import { MovingAverageCalculator } from './utils/movingAverageCalculator';
import { SentimentAnalyzer } from './utils/sentimentAnalyzer';
import { StockData, AnalysisResult } from './types';

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'chart' | 'analysis' | 'chat'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const processStockData = useCallback(async (stockData: StockData[]) => {
    setIsProcessing(true);
    
    try {
      // Initialize calculators
      const spanCalculator = new StockSpanCalculator();
      const maCalculator = new MovingAverageCalculator();
      const sentimentAnalyzer = new SentimentAnalyzer();

      // Process data with DSA algorithms
      const stockDataWithSpan = spanCalculator.calculateSpanForStockData(stockData);
      const movingAverages = maCalculator.calculateMovingAverages(stockData);
      const sentimentData = sentimentAnalyzer.analyzeSentiment(stockData);
      
      // Calculate correlation
      const correlationScore = sentimentAnalyzer.calculateSentimentSpanCorrelation(
        sentimentData,
        stockDataWithSpan
      );

      const result: AnalysisResult = {
        stockData: stockDataWithSpan,
        movingAverages,
        sentimentData,
        correlationScore
      };

      setAnalysisResult(result);
      setActiveTab('chart'); // Switch to chart view after processing
    } catch (error) {
      console.error('Error processing stock data:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const tabs = [
    { id: 'upload' as const, label: 'Data Upload', icon: Upload },
    { id: 'chart' as const, label: 'Visualization', icon: BarChart3 },
    { id: 'analysis' as const, label: 'Analysis', icon: Brain },
    { id: 'chat' as const, label: 'AI Assistant', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AI Stock Analyzer
                </h1>
                <p className="text-sm text-gray-500">
                  DSA-Powered Analytics with Sentiment Intelligence
                </p>
              </div>
            </div>
            
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {activeTab === 'upload' && (
            <DataUploader 
              onDataLoad={processStockData}
              className="max-w-4xl mx-auto"
            />
          )}

          {activeTab === 'chart' && (
            <StockChart
              stockData={analysisResult?.stockData || []}
              movingAverages={analysisResult?.movingAverages || []}
              sentimentData={analysisResult?.sentimentData || []}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisResults results={analysisResult} />
          )}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <ConversationalInterface
                stockData={analysisResult?.stockData || []}
                movingAverages={analysisResult?.movingAverages || []}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center text-gray-500 text-sm">
          <div className="max-w-4xl mx-auto px-4">
            <p className="mb-2">
              Powered by advanced DSA algorithms, AI sentiment analysis, and conversational intelligence
            </p>
            <p className="text-xs">
              Stack-based Stock Span (O(n)) • Queue-based Moving Averages • Real-time Sentiment Analysis • Voice Interface
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;