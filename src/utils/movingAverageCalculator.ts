import { StockData, MovingAverage } from '../types';

/**
 * Calculates moving averages using Queue-based sliding window approach
 * Supports multiple window sizes (5, 10, 20 days)
 */
export class MovingAverageCalculator {
  private queues: Map<number, number[]> = new Map();
  private sums: Map<number, number> = new Map();

  constructor(private windowSizes: number[] = [5, 10, 20]) {
    this.windowSizes.forEach(size => {
      this.queues.set(size, []);
      this.sums.set(size, 0);
    });
  }

  calculateMovingAverages(stockData: StockData[]): MovingAverage[] {
    const result: MovingAverage[] = [];
    
    // Reset queues and sums for new calculation
    this.windowSizes.forEach(size => {
      this.queues.set(size, []);
      this.sums.set(size, 0);
    });

    stockData.forEach((data, index) => {
      const averages: any = { date: data.date };
      
      this.windowSizes.forEach(windowSize => {
        const queue = this.queues.get(windowSize)!;
        let sum = this.sums.get(windowSize)!;
        
        // Add current price to queue and sum
        queue.push(data.close);
        sum += data.close;
        
        // Remove oldest element if window size exceeded
        if (queue.length > windowSize) {
          const removedValue = queue.shift()!;
          sum -= removedValue;
        }
        
        this.sums.set(windowSize, sum);
        
        // Calculate moving average
        if (queue.length === windowSize) {
          averages[`ma${windowSize}`] = sum / windowSize;
        } else {
          // For initial periods, use available data
          averages[`ma${windowSize}`] = sum / queue.length;
        }
      });
      
      result.push(averages);
    });
    
    return result;
  }
}