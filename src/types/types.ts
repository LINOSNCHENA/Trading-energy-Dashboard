export interface OriginalData {
    date: string;
    amount: any;
  }

export interface ExtractedData {
    date: string;
    amount: number;
  }

export interface TimeSeriesDaily {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  }
