import { ChatMessage, StockData, MovingAverage } from '../types';

/**
 * Conversational AI engine for natural language stock analysis
 * Processes user queries and provides intelligent responses
 */
export class ConversationalAI {
  private stockData: StockData[] = [];
  private movingAverages: MovingAverage[] = [];

  updateData(stockData: StockData[], movingAverages: MovingAverage[]) {
    this.stockData = stockData;
    this.movingAverages = movingAverages;
  }

  async processQuery(query: string): Promise<string> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Intent recognition patterns
    const patterns = [
      {
        pattern: /(?:what'?s?|tell me|show me).*(average|ma|moving average).*(\d+)/i,
        handler: this.handleMovingAverageQuery.bind(this)
      },
      {
        pattern: /(span|stock span).*today|current.*span/i,
        handler: this.handleCurrentSpanQuery.bind(this)
      },
      {
        pattern: /(price|current price|latest price)/i,
        handler: this.handlePriceQuery.bind(this)
      },
      {
        pattern: /(trend|trending|direction)/i,
        handler: this.handleTrendQuery.bind(this)
      },
      {
        pattern: /(buy|sell|hold|recommend)/i,
        handler: this.handleRecommendationQuery.bind(this)
      },
      {
        pattern: /(high|highest|peak)/i,
        handler: this.handleHighQuery.bind(this)
      },
      {
        pattern: /(low|lowest|bottom)/i,
        handler: this.handleLowQuery.bind(this)
      }
    ];

    // Find matching pattern
    for (const { pattern, handler } of patterns) {
      const match = normalizedQuery.match(pattern);
      if (match) {
        return handler(normalizedQuery, match);
      }
    }

    // Default response
    return this.getDefaultResponse(normalizedQuery);
  }

  private handleMovingAverageQuery(query: string, match: RegExpMatchArray): string {
    if (this.movingAverages.length === 0) {
      return "I don't have any stock data loaded yet. Please upload some data first.";
    }

    const latest = this.movingAverages[this.movingAverages.length - 1];
    const dayMatch = query.match(/(\d+)/);
    const days = dayMatch ? parseInt(dayMatch[1]) : 10;

    if (days === 5 && latest.ma5) {
      return `The 5-day moving average is $${latest.ma5.toFixed(2)}.`;
    } else if (days === 10 && latest.ma10) {
      return `The 10-day moving average is $${latest.ma10.toFixed(2)}.`;
    } else if (days === 20 && latest.ma20) {
      return `The 20-day moving average is $${latest.ma20.toFixed(2)}.`;
    }

    return `I have moving averages for 5, 10, and 20 days. The latest values are: 5-day: $${latest.ma5?.toFixed(2) || 'N/A'}, 10-day: $${latest.ma10?.toFixed(2) || 'N/A'}, 20-day: $${latest.ma20?.toFixed(2) || 'N/A'}.`;
  }

  private handleCurrentSpanQuery(): string {
    if (this.stockData.length === 0) {
      return "No stock data available. Please upload data to see span analysis.";
    }

    const latest = this.stockData[this.stockData.length - 1];
    const span = latest.span || 0;
    
    let interpretation = '';
    if (span > 10) {
      interpretation = ' This indicates a strong bullish trend!';
    } else if (span > 5) {
      interpretation = ' This shows moderate bullish momentum.';
    } else if (span <= 2) {
      interpretation = ' This suggests bearish pressure or consolidation.';
    } else {
      interpretation = ' This indicates neutral market sentiment.';
    }

    return `The current stock span is ${span} days.${interpretation}`;
  }

  private handlePriceQuery(): string {
    if (this.stockData.length === 0) {
      return "No stock data available. Please upload data to see current price.";
    }

    const latest = this.stockData[this.stockData.length - 1];
    const previous = this.stockData.length > 1 ? this.stockData[this.stockData.length - 2] : null;
    
    let changeText = '';
    if (previous) {
      const change = latest.close - previous.close;
      const changePercent = (change / previous.close) * 100;
      const direction = change >= 0 ? '📈' : '📉';
      changeText = ` ${direction} ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
    }

    return `The current price is $${latest.close.toFixed(2)}.${changeText}`;
  }

  private handleTrendQuery(): string {
    if (this.stockData.length < 5) {
      return "I need more data to analyze the trend. Please provide at least 5 days of data.";
    }

    const recent = this.stockData.slice(-5);
    const priceChanges = recent.slice(1).map((data, i) => 
      data.close - recent[i].close
    );

    const upDays = priceChanges.filter(change => change > 0).length;
    const downDays = priceChanges.filter(change => change < 0).length;

    let trend = '';
    let emoji = '';
    
    if (upDays >= 3) {
      trend = 'bullish uptrend';
      emoji = '🚀';
    } else if (downDays >= 3) {
      trend = 'bearish downtrend';
      emoji = '📉';
    } else {
      trend = 'sideways consolidation';
      emoji = '↔️';
    }

    const latest = this.stockData[this.stockData.length - 1];
    const spanTrend = (latest.span || 0) > 5 ? 'strong momentum' : 'weak momentum';

    return `${emoji} The stock is showing a ${trend} with ${spanTrend} based on the recent 5-day pattern.`;
  }

  private handleRecommendationQuery(): string {
    if (this.stockData.length === 0 || this.movingAverages.length === 0) {
      return "I need stock data to provide recommendations. Please upload data first.";
    }

    const latest = this.stockData[this.stockData.length - 1];
    const latestMA = this.movingAverages[this.movingAverages.length - 1];
    const span = latest.span || 0;

    let signals = [];
    
    // Price vs Moving Average signals
    if (latest.close > (latestMA.ma10 || 0)) signals.push('Price above 10-day MA (Bullish)');
    if (latest.close < (latestMA.ma10 || 0)) signals.push('Price below 10-day MA (Bearish)');
    
    // Span signals
    if (span > 7) signals.push('High span indicates strong momentum (Bullish)');
    if (span <= 2) signals.push('Low span indicates weak momentum (Bearish)');

    let recommendation = 'HOLD';
    let reasoning = 'Mixed signals suggest holding current position.';

    const bullishSignals = signals.filter(s => s.includes('Bullish')).length;
    const bearishSignals = signals.filter(s => s.includes('Bearish')).length;

    if (bullishSignals > bearishSignals) {
      recommendation = 'BUY';
      reasoning = 'Multiple bullish indicators align for a potential buying opportunity.';
    } else if (bearishSignals > bullishSignals) {
      recommendation = 'SELL';
      reasoning = 'Bearish signals suggest considering a sell position.';
    }

    return `📊 **${recommendation}** - ${reasoning}\n\nSignals: ${signals.join(', ')}`;
  }

  private handleHighQuery(): string {
    if (this.stockData.length === 0) {
      return "No data available to find highest price.";
    }

    const highestPrice = Math.max(...this.stockData.map(d => d.high));
    const highestDay = this.stockData.find(d => d.high === highestPrice);
    
    return `The highest price was $${highestPrice.toFixed(2)} on ${highestDay?.date}.`;
  }

  private handleLowQuery(): string {
    if (this.stockData.length === 0) {
      return "No data available to find lowest price.";
    }

    const lowestPrice = Math.min(...this.stockData.map(d => d.low));
    const lowestDay = this.stockData.find(d => d.low === lowestPrice);
    
    return `The lowest price was $${lowestPrice.toFixed(2)} on ${lowestDay?.date}.`;
  }

  private getDefaultResponse(query: string): string {
    const responses = [
      "I can help you analyze stock data! Try asking about moving averages, current prices, trends, or recommendations.",
      "Ask me about stock spans, price movements, or technical analysis. I'm here to help!",
      "I can provide insights on trends, moving averages, and trading recommendations. What would you like to know?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}