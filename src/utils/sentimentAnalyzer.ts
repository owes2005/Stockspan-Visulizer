import { SentimentData } from '../types';

/**
 * Simulates social media sentiment analysis
 * In production, this would integrate with Twitter API, Reddit API, etc.
 */
export class SentimentAnalyzer {
  private sentimentKeywords = {
    bullish: ['buy', 'bull', 'rise', 'up', 'gain', 'profit', 'moon', 'rocket', 'long'],
    bearish: ['sell', 'bear', 'fall', 'down', 'loss', 'crash', 'drop', 'short']
  };

  /**
   * Simulates sentiment analysis for stock data
   * In real implementation, this would:
   * 1. Fetch social media posts using APIs
   * 2. Clean and preprocess text
   * 3. Apply VADER or BERT sentiment models
   * 4. Aggregate daily sentiment scores
   */
  analyzeSentiment(stockData: any[]): SentimentData[] {
    return stockData.map((data, index) => {
      // Simulate sentiment based on price movement and some randomness
      const priceChange = index > 0 ? 
        ((data.close - stockData[index - 1].close) / stockData[index - 1].close) * 100 : 0;
      
      // Base sentiment on price movement with some noise
      const baseSentiment = Math.tanh(priceChange / 5); // Scale to [-1, 1]
      const noise = (Math.random() - 0.5) * 0.4; // Add randomness
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + noise));
      
      // Simulate confidence and volume
      const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence
      const volume = Math.floor(100 + Math.random() * 900); // 100-1000 posts

      return {
        date: data.date,
        score: sentiment,
        confidence,
        volume
      };
    });
  }

  /**
   * Calculates correlation between sentiment and stock span
   */
  calculateSentimentSpanCorrelation(sentimentData: SentimentData[], stockData: any[]): number {
    if (sentimentData.length !== stockData.length || sentimentData.length < 2) {
      return 0;
    }

    const sentimentScores = sentimentData.map(s => s.score);
    const spans = stockData.map(s => s.span || 0);

    return this.pearsonCorrelation(sentimentScores, spans);
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}