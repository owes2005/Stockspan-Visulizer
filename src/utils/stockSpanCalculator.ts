import { StockData } from '../types';

/**
 * Calculates stock span using Stack-based algorithm in O(n) time complexity
 * Stock span for day i is the maximum number of consecutive days (ending with day i)
 * for which the price was less than or equal to the price on day i
 */
export class StockSpanCalculator {
  private stack: { index: number; price: number }[] = [];

  calculateSpan(prices: number[]): number[] {
    const spans: number[] = [];
    this.stack = []; // Reset stack for new calculation
    
    for (let i = 0; i < prices.length; i++) {
      // Pop elements while stack is not empty and top price <= current price
      while (this.stack.length > 0 && this.stack[this.stack.length - 1].price <= prices[i]) {
        this.stack.pop();
      }
      
      // If stack is empty, span is i + 1, otherwise span is i - top index
      const span = this.stack.length === 0 ? i + 1 : i - this.stack[this.stack.length - 1].index;
      spans.push(span);
      
      // Push current element to stack
      this.stack.push({ index: i, price: prices[i] });
    }
    
    return spans;
  }

  calculateSpanForStockData(stockData: StockData[]): StockData[] {
    const prices = stockData.map(data => data.close);
    const spans = this.calculateSpan(prices);
    
    return stockData.map((data, index) => ({
      ...data,
      span: spans[index]
    }));
  }
}