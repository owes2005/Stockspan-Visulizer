import { StockData } from '../types';

/**
 * Generates realistic stock data for demonstration purposes
 */
export class DataGenerator {
  generateStockData(days: number = 30, initialPrice: number = 100): StockData[] {
    const data: StockData[] = [];
    let currentPrice = initialPrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate realistic price movements
      const volatility = 0.02; // 2% daily volatility
      const trend = Math.sin(i / 10) * 0.001; // Slight trend component
      const randomWalk = (Math.random() - 0.5) * volatility;
      const priceChange = (trend + randomWalk) * currentPrice;
      
      currentPrice += priceChange;
      
      // Generate OHLC data
      const dailyVolatility = currentPrice * 0.015; // 1.5% intraday volatility
      const high = currentPrice + Math.random() * dailyVolatility;
      const low = currentPrice - Math.random() * dailyVolatility;
      const open = low + Math.random() * (high - low);
      const close = currentPrice;
      
      // Generate volume (between 1M and 10M shares)
      const volume = Math.floor(1000000 + Math.random() * 9000000);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume
      });
    }
    
    return data;
  }

  generateCSVSample(): string {
    const data = this.generateStockData(30, 100);
    let csv = 'Date,Open,High,Low,Close,Volume\n';
    
    data.forEach(row => {
      csv += `${row.date},${row.open},${row.high},${row.low},${row.close},${row.volume}\n`;
    });
    
    return csv;
  }
}