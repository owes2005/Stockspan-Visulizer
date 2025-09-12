import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  results: AnalysisResult | null;
  className?: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, className = '' }) => {
  if (!results || results.stockData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <Activity className="w-8 h-8 mr-3" />
          <span>Upload data to see analysis results</span>
        </div>
      </div>
    );
  }

  const { stockData, movingAverages, sentimentData, correlationScore } = results;
  const latest = stockData[stockData.length - 1];
  const previous = stockData.length > 1 ? stockData[stockData.length - 1] : null;
  const latestMA = movingAverages[movingAverages.length - 1];
  const latestSentiment = sentimentData[sentimentData.length - 1];

  // Calculate key metrics
  const avgSpan = stockData.reduce((sum, data) => sum + (data.span || 0), 0) / stockData.length;
  const maxSpan = Math.max(...stockData.map(d => d.span || 0));
  const priceChange = previous ? ((latest.close - previous.close) / previous.close) * 100 : 0;
  
  // Determine trend
  const isUptrend = latest.close > (latestMA?.ma10 || 0) && (latest.span || 0) > 3;
  const isDowntrend = latest.close < (latestMA?.ma10 || 0) && (latest.span || 0) <= 2;
  
  // Generate insights
  const insights = [];
  
  if (isUptrend) {
    insights.push({
      type: 'bullish' as const,
      title: 'Bullish Trend Detected',
      message: `Price is above 10-day MA with span of ${latest.span} days, indicating upward momentum.`
    });
  } else if (isDowntrend) {
    insights.push({
      type: 'bearish' as const,
      title: 'Bearish Pressure',
      message: `Price below 10-day MA with low span suggests downward pressure.`
    });
  }

  if (maxSpan > 10) {
    insights.push({
      type: 'info' as const,
      title: 'Strong Momentum Period',
      message: `Maximum span of ${maxSpan} days indicates a period of exceptional momentum.`
    });
  }

  if (Math.abs(correlationScore) > 0.5) {
    insights.push({
      type: correlationScore > 0 ? 'bullish' : 'bearish',
      title: 'Sentiment-Price Correlation',
      message: `${Math.abs(correlationScore * 100).toFixed(0)}% ${correlationScore > 0 ? 'positive' : 'negative'} correlation between sentiment and price movement.`
    });
  }

  const getInsightIcon = (type: 'bullish' | 'bearish' | 'info') => {
    switch (type) {
      case 'bullish': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'bearish': return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightBorderColor = (type: 'bullish' | 'bearish' | 'info') => {
    switch (type) {
      case 'bullish': return 'border-green-200 bg-green-50';
      case 'bearish': return 'border-red-200 bg-red-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Results</h2>
        <p className="text-gray-600 text-sm">
          Comprehensive analysis of stock performance and behavioral signals
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800">Average Span</h3>
          <div className="text-2xl font-bold text-blue-600">
            {avgSpan.toFixed(1)} days
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800">Price Change</h3>
          <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-800">Sentiment Score</h3>
          <div className="text-2xl font-bold text-purple-600">
            {latestSentiment ? (latestSentiment.score * 100).toFixed(0) : '0'}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-orange-800">Correlation</h3>
          <div className="text-2xl font-bold text-orange-600">
            {(correlationScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Technical Analysis Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
          Technical Analysis Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Price Action</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Current Price: ${latest.close.toFixed(2)}</li>
              <li>• 10-day MA: ${latestMA?.ma10?.toFixed(2) || 'N/A'}</li>
              <li>• 20-day MA: ${latestMA?.ma20?.toFixed(2) || 'N/A'}</li>
              <li>• Position: {latest.close > (latestMA?.ma10 || 0) ? 'Above' : 'Below'} short-term MA</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Momentum Indicators</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Current Span: {latest.span || 0} days</li>
              <li>• Maximum Span: {maxSpan} days</li>
              <li>• Average Span: {avgSpan.toFixed(1)} days</li>
              <li>• Momentum: {(latest.span || 0) > avgSpan ? 'Above' : 'Below'} average</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Market Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${getInsightBorderColor(insight.type)}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                    <p className="text-gray-700 text-sm">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Performance */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">Algorithm Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-700">Stock Span (Stack)</h4>
            <p className="text-indigo-600">O(n) time complexity</p>
            <p className="text-indigo-600">Processed {stockData.length} data points</p>
          </div>
          <div>
            <h4 className="font-medium text-indigo-700">Moving Average (Queue)</h4>
            <p className="text-indigo-600">Sliding window analysis</p>
            <p className="text-indigo-600">Multiple timeframes (5, 10, 20 days)</p>
          </div>
          <div>
            <h4 className="font-medium text-indigo-700">Sentiment Analysis</h4>
            <p className="text-indigo-600">Behavioral finance integration</p>
            <p className="text-indigo-600">{sentimentData.length} sentiment data points</p>
          </div>
        </div>
      </div>
    </div>
  );
};