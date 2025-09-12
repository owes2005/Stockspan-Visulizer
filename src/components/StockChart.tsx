import React from 'react';
import { StockData, MovingAverage, SentimentData } from '../types';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface StockChartProps {
  stockData: StockData[];
  movingAverages: MovingAverage[];
  sentimentData: SentimentData[];
  className?: string;
}

export const StockChart: React.FC<StockChartProps> = ({
  stockData,
  movingAverages,
  sentimentData,
  className = ''
}) => {
  if (stockData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BarChart3 className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No Data Available</p>
          <p className="text-sm">Upload CSV data or generate sample data to see charts</p>
        </div>
      </div>
    );
  }

  const maxPrice = Math.max(...stockData.map(d => d.high));
  const minPrice = Math.min(...stockData.map(d => d.low));
  const priceRange = maxPrice - minPrice;
  const maxSpan = Math.max(...stockData.map(d => d.span || 0));
  const maxSentiment = Math.max(...sentimentData.map(d => Math.abs(d.score)));

  const getYPosition = (value: number) => {
    return ((maxPrice - value) / priceRange) * 200;
  };

  const getSpanHeight = (span: number) => {
    return (span / maxSpan) * 60;
  };

  const getSentimentHeight = (sentiment: number) => {
    return Math.abs(sentiment / maxSentiment) * 40;
  };

  const latest = stockData[stockData.length - 1];
  const previous = stockData.length > 1 ? stockData[stockData.length - 2] : null;
  const priceChange = previous ? latest.close - previous.close : 0;
  const priceChangePercent = previous ? (priceChange / previous.close) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Stock Analysis Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                ${latest.close.toFixed(2)}
              </div>
              <div className={`flex items-center text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Key Metrics */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Current Span</h3>
          <div className="text-2xl font-bold text-blue-600">{latest.span || 0} days</div>
          <p className="text-xs text-blue-600 mt-1">
            {(latest.span || 0) > 5 ? 'Strong momentum' : 'Weak momentum'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-2">10-Day MA</h3>
          <div className="text-2xl font-bold text-green-600">
            ${movingAverages[movingAverages.length - 1]?.ma10?.toFixed(2) || 'N/A'}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {latest.close > (movingAverages[movingAverages.length - 1]?.ma10 || 0) ? 'Above MA' : 'Below MA'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-800 mb-2">Sentiment</h3>
          <div className="text-2xl font-bold text-purple-600">
            {sentimentData.length > 0 ? (sentimentData[sentimentData.length - 1].score * 100).toFixed(0) : '0'}%
          </div>
          <p className="text-xs text-purple-600 mt-1">
            {sentimentData.length > 0 && sentimentData[sentimentData.length - 1].score > 0.1 ? 'Bullish' : 
             sentimentData.length > 0 && sentimentData[sentimentData.length - 1].score < -0.1 ? 'Bearish' : 'Neutral'}
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Movement & Technical Analysis</h3>
        
        {/* SVG Chart */}
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <svg width="100%" height="320" className="min-w-full">
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Price Line */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={stockData.map((data, index) => 
                `${(index / (stockData.length - 1)) * 800},${getYPosition(data.close) + 20}`
              ).join(' ')}
            />

            {/* Moving Average Lines */}
            {movingAverages.length > 0 && (
              <>
                {/* 10-day MA */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  points={movingAverages.map((data, index) => 
                    `${(index / (movingAverages.length - 1)) * 800},${getYPosition(data.ma10) + 20}`
                  ).join(' ')}
                />
                
                {/* 20-day MA */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="10,5"
                  points={movingAverages.map((data, index) => 
                    `${(index / (movingAverages.length - 1)) * 800},${getYPosition(data.ma20) + 20}`
                  ).join(' ')}
                />
              </>
            )}

            {/* Data Points */}
            {stockData.map((data, index) => (
              <circle
                key={index}
                cx={(index / (stockData.length - 1)) * 800}
                cy={getYPosition(data.close) + 20}
                r="3"
                fill="#2563eb"
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>
                  {data.date}: ${data.close.toFixed(2)}
                  {data.span && `, Span: ${data.span} days`}
                </title>
              </circle>
            ))}
          </svg>
        </div>

        {/* Span Chart */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Stock Span Analysis (Days)</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <svg width="100%" height="100">
              {stockData.map((data, index) => (
                <rect
                  key={index}
                  x={(index / stockData.length) * 800}
                  y={80 - getSpanHeight(data.span || 0)}
                  width={Math.max(800 / stockData.length - 2, 8)}
                  height={getSpanHeight(data.span || 0)}
                  fill={data.span && data.span > 5 ? "#10b981" : "#f59e0b"}
                  className="hover:opacity-80 transition-opacity"
                >
                  <title>{data.date}: {data.span} day span</title>
                </rect>
              ))}
            </svg>
          </div>
        </div>

        {/* Sentiment Chart */}
        {sentimentData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-3">Social Media Sentiment</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <svg width="100%" height="100">
                <line x1="0" y1="50" x2="800" y2="50" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                {sentimentData.map((data, index) => (
                  <rect
                    key={index}
                    x={(index / sentimentData.length) * 800}
                    y={data.score >= 0 ? 50 - getSentimentHeight(data.score) : 50}
                    width={Math.max(800 / sentimentData.length - 2, 8)}
                    height={getSentimentHeight(data.score)}
                    fill={data.score >= 0 ? "#10b981" : "#ef4444"}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{data.date}: {(data.score * 100).toFixed(1)}% sentiment</title>
                  </rect>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-600 mr-2"></div>
            <span>Price</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2 border-dashed"></div>
            <span>10-day MA</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-yellow-500 mr-2 border-dashed"></div>
            <span>20-day MA</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-2 bg-green-500 mr-2"></div>
            <span>High Span ({'>'}5 days)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-2 bg-yellow-500 mr-2"></div>
            <span>Low Span (≤5 days)</span>
          </div>
        </div>
      </div>
    </div>
  );
};