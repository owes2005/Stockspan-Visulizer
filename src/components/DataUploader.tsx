import React, { useState, useRef } from 'react';
import { Upload, Download, BarChart, FileSpreadsheet } from 'lucide-react';
import { StockData } from '../types';
import { DataGenerator } from '../utils/dataGenerator';

interface DataUploaderProps {
  onDataLoad: (data: StockData[]) => void;
  className?: string;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoad, className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataGenerator = new DataGenerator();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);
      onDataLoad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (csvText: string): StockData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row');
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredColumns = ['date', 'open', 'high', 'low', 'close'];
    
    // Check for required columns
    const missingColumns = requiredColumns.filter(col => 
      !header.some(h => h.includes(col))
    );
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const data: StockData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < requiredColumns.length) continue;

      try {
        const dateIndex = header.findIndex(h => h.includes('date'));
        const openIndex = header.findIndex(h => h.includes('open'));
        const highIndex = header.findIndex(h => h.includes('high'));
        const lowIndex = header.findIndex(h => h.includes('low'));
        const closeIndex = header.findIndex(h => h.includes('close'));
        const volumeIndex = header.findIndex(h => h.includes('volume'));

        const stockData: StockData = {
          date: values[dateIndex],
          open: parseFloat(values[openIndex]),
          high: parseFloat(values[highIndex]),
          low: parseFloat(values[lowIndex]),
          close: parseFloat(values[closeIndex]),
          volume: volumeIndex >= 0 ? parseInt(values[volumeIndex]) : 1000000
        };

        // Validate data
        if (isNaN(stockData.open) || isNaN(stockData.high) || 
            isNaN(stockData.low) || isNaN(stockData.close)) {
          throw new Error(`Invalid numeric data on line ${i + 1}`);
        }

        data.push(stockData);
      } catch (err) {
        console.warn(`Skipping invalid row ${i + 1}:`, values);
      }
    }

    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV file');
    }

    // Sort by date
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return data;
  };

  const handleGenerateSampleData = () => {
    setIsProcessing(true);
    setError(null);

    try {
      const sampleData = dataGenerator.generateStockData(30, 100);
      onDataLoad(sampleData);
    } catch (err) {
      setError('Failed to generate sample data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSample = () => {
    const csvData = dataGenerator.generateCSVSample();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_stock_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Upload</h2>
        <p className="text-gray-600 text-sm">
          Upload CSV file with stock data or generate sample data for analysis
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Upload CSV File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your stock data CSV file with columns: Date, Open, High, Low, Close, Volume
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Choose File'}
            </button>
          </div>
        </div>

        {/* Generate Sample Data */}
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <BarChart className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Generate Sample Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create realistic sample stock data for testing and demonstration
            </p>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleGenerateSampleData}
                disabled={isProcessing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Generating...' : 'Generate Sample'}
              </button>
              
              <button
                onClick={handleDownloadSample}
                className="flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 
                         rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Format Help */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">CSV Format Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Header row with columns: Date, Open, High, Low, Close, Volume</li>
              <li>• Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
              <li>• Numeric values for OHLC prices and volume</li>
              <li>• Data should be sorted by date (ascending)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};