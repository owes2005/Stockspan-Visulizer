export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  span?: number;
}

export interface MovingAverage {
  date: string;
  ma5: number;
  ma10: number;
  ma20: number;
}

export interface SentimentData {
  date: string;
  score: number;
  confidence: number;
  volume: number;
}

export interface AnalysisResult {
  stockData: StockData[];
  movingAverages: MovingAverage[];
  sentimentData: SentimentData[];
  correlationScore: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}